"""
MongoDB handler for storing job listings.
"""
import os
from pymongo import MongoClient, UpdateOne
from pymongo.errors import BulkWriteError
from typing import List, Dict, Optional
from datetime import datetime
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()


def _flush_redis_cache():
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        logger.info("REDIS_URL not set – skipping cache flush")
        return

    try:
        import redis
        r = redis.from_url(redis_url, decode_responses=True)

        patterns = ["jobs:*", "new_jobs:*", "job_search:*"]
        deleted = 0

        for pattern in patterns:
            cursor = 0
            while True:
                cursor, keys = r.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    deleted += r.delete(*keys)
                if cursor == 0:
                    break

        for key in ["job_stats", "companies:list"]:
            deleted += r.delete(key)

        logger.info(f"Redis cache flushed – {deleted} key(s) deleted")
        r.close()

    except ImportError:
        logger.warning("redis package not installed – run: pip install redis")
    except Exception as e:
        logger.error(f"Failed to flush Redis cache: {e}")
    
class JobDatabase:
    """MongoDB handler for job data."""
    
    def __init__(self):
        connection_string = os.getenv("MONGO_URI")
        db_name = os.getenv("DB_NAME", "job_aggregator")

        if not connection_string:
            raise ValueError("❌ MONGO_URI is missing from .env file!")
        
        self.client = MongoClient(connection_string)
        self.db = self.client[db_name]
        self.jobs_collection = self.db['jobs']
        self.companies_collection = self.db['companies']
        self.scrape_logs = self.db['scrape_logs']
        self._create_indexes()
        
    def _create_indexes(self):
        """Create necessary indexes for performance."""
        self.jobs_collection.create_index([
            ('company', 1),
            ('job_id', 1)
        ], unique=True)
        
        self.jobs_collection.create_index([('createdAt', -1)])
        
        self.jobs_collection.create_index([
            ('company', 1),
            ('location', 1)
        ])
        self.jobs_collection.create_index([
            ('title', 'text'), 
            ('description', 'text')
        ])
        
    # ✅ FIX 1: Changed 'jobs_found' to 'jobs_count' to match your runner.py
    def log_scrape(self, company: str, status: str, jobs_count: int = 0, error: Optional[str] = None):
        """
        Logs the result of a scrape operation.
        """
        try:
            log_entry = {
                "company": company,
                "status": status,
                "jobs_found": jobs_count, # Storing as jobs_found in DB, but accepting jobs_count arg
                "timestamp": datetime.utcnow(),
                "error": str(error) if error else None
            }
            self.scrape_logs.insert_one(log_entry)
            logger.info(f"Logged scrape status for {company}: {status}")
        except Exception as e:
            logger.error(f"Failed to save scrape log for {company}: {e}")

    def insert_jobs(self, jobs: List[Dict]) -> Dict:
        """
        Insert or update jobs using upsert.
        """
        if not jobs:
            return {'inserted': 0, 'updated': 0, 'failed': 0}
        
        operations = []
        for job in jobs:
            filter_query = {
                'company': job['company'],
                'job_id': job['job_id']
            }
            
            current_time = datetime.utcnow()
            job['last_seen'] = current_time
            job['updatedAt'] = current_time 
            
            # ✅ FIX 2: Handle 'source' manually to avoid MongoDB conflict error
            if 'source' not in job:
                job['source'] = 'Scraper'

            operations.append(
                UpdateOne(
                    filter_query,
                    {
                        '$set': job, # Updates all fields (including source)
                        '$setOnInsert': {
                            'createdAt': current_time
                            # Removed 'source' from here to prevent conflict
                        }
                    },
                    upsert=True
                )
            )
        
        try:
            result = self.jobs_collection.bulk_write(operations, ordered=False)
            stats = {
                'inserted': result.upserted_count,
                'updated': result.modified_count,
                'failed': 0
            }
            logger.info(f"Database operation: {stats}")

            # Flush Redis cache so the API serves fresh data immediately
            if stats['inserted'] > 0 or stats['updated'] > 0:
                _flush_redis_cache()

            return stats
            
        except BulkWriteError as e:
            write_errors = e.details.get('writeErrors', [])
            if write_errors:
                first_error = write_errors[0]
                error_msg = first_error.get('errmsg', 'Unknown Error')
                failed_op = first_error.get('op', {})
                
                logger.error("MONGODB REJECTED DATA!")
                logger.error(f"REASON: {error_msg}")
                logger.error(f"BAD DATA: job_id='{failed_op.get('q', {}).get('job_id')}' company='{failed_op.get('q', {}).get('company')}'")
                
            stats = {
                'inserted': e.details.get('nUpserted', 0),
                'updated': e.details.get('nModified', 0),
                'failed': len(write_errors)
            }
            return stats
            
    def mark_missing_jobs_dead(self, company: str, current_job_ids: List[str]) -> Dict:
        """
        Marks jobs as dead (joblive: false) if they are in DB but not in current_job_ids.
        Includes SAFETY CIRCUIT BREAKER:
        - If > 20% of jobs would be deleted, ABORT and return error.
        - Prevents wiping out data if scraper fails/returns 0 jobs.
        """
        if not current_job_ids:
            logger.warning(f"[Circuit Breaker] Scraper returned 0 jobs for {company}. Aborting dead job check.")
            return {'status': 'skipped', 'reason': 'zero_jobs_scraped'}

        # 1. Get all currently LIVE jobs from DB for this company
        active_jobs_cursor = self.jobs_collection.find(
            {'company': company, 'joblive': True},
            {'job_id': 1}
        )
        active_db_ids = {doc['job_id'] for doc in active_jobs_cursor}
        
        if not active_db_ids:
            return {'status': 'skipped', 'reason': 'no_active_jobs_in_db'}

        # 2. Identify missing IDs (In DB but not in Current Scrape)
        # Convert list to set for O(1) lookup
        current_ids_set = set(current_job_ids)
        missing_ids = list(active_db_ids - current_ids_set)
        
        if not missing_ids:
            return {'status': 'clean', 'removed': 0, 'reason': 'perfect_match'}

        # 3. SAFETY CHECK (Circuit Breaker)
        total_active = len(active_db_ids)
        drop_count = len(missing_ids)
        drop_rate = drop_count / total_active
        
        if drop_rate > 0.20: # 20% Threshold
            logger.error(f"[Circuit Breaker] {company}: Attempting to remove {drop_count}/{total_active} jobs ({drop_rate:.1%}). ABORTING.")
            return {
                'status': 'aborted', 
                'reason': 'circuit_breaker_tripped',
                'drop_rate': drop_rate,
                'planned_removal': drop_count,
                'total_active': total_active
            }

        # 4. Execute Soft Delete
        logger.info(f"Marking {drop_count} jobs as dead for {company}")
        result = self.jobs_collection.update_many(
            {
                'company': company,
                'job_id': {'$in': missing_ids}
            },
            {
                '$set': {
                    'joblive': False,
                    'last_seen': datetime.utcnow() # Update timestamp to show when we closed it
                }
            }
        )
        
        return {
            'status': 'success',
            'removed': result.modified_count,
            'drop_rate': drop_rate
        }

    def close(self):
        self.client.close()