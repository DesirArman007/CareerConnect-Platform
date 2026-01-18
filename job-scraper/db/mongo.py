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
            
    def close(self):
        self.client.close()