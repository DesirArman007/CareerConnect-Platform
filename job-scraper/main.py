"""
Main entry point for job scraping system.
"""

import argparse
import logging
from datetime import datetime
import sys
import os

# Fix Windows console encoding
if sys.platform == 'win32':
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr.reconfigure(encoding='utf-8')
    os.environ['PYTHONIOENCODING'] = 'utf-8'

from engine.runner import ScraperEngine
from db.mongo import JobDatabase

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'scraper_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description='Job Aggregation Scraper')
    
    parser.add_argument(
        '--mode',
        choices=['all', 'priority', 'single'],
        default='all',
        help='Scraping mode'
    )
    
    parser.add_argument(
        '--company',
        type=str,
        help='Company name for single mode'
    )
    
    parser.add_argument(
        '--priority',
        type=int,
        help='Priority level to scrape'
    )
    
    parser.add_argument(
        '--workers',
        type=int,
        default=3,
        help='Number of parallel workers (default: 3)'
    )
    
    parser.add_argument(
        '--config',
        type=str,
        default='config/companies.json',
        help='Path to companies config file'
    )
    
    # REMOVED --db-uri argument because we now use .env file
    
    parser.add_argument(
        '--cleanup',
        action='store_true',
        help='Remove jobs older than 90 days'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Run without saving to database'
    )

    parser.add_argument(
        '--output',
        type=str,
        help='Output JSON file for dry-run mode'
    )
    
    args = parser.parse_args()
    
    try:
        # Initialize database
        logger.info("Connecting to database...")
        # ✅ FIXED: No arguments passed here. It loads from .env automatically.
        db = JobDatabase()
        
        # Cleanup old jobs if requested
        if args.cleanup:
            logger.info("Cleaning up old jobs...")
            deleted = db.delete_old_jobs(days=90)
            logger.info(f"Deleted {deleted} old jobs")
            return
        
        # Initialize scraper engine
        logger.info("Initializing scraper engine...")
        engine = ScraperEngine(
            config_path=args.config, 
            db=db,
            dry_run=args.dry_run,
            output_file=args.output
        )
        
        # Execute scraping based on mode
        if args.mode == 'single':
            if not args.company:
                logger.error("--company required for single mode")
                return
            
            company_config = next(
                (c for c in engine.companies if c['name'].lower() == args.company.lower()),
                None
            )
            
            if not company_config:
                logger.error(f"Company '{args.company}' not found in config")
                return
            
            logger.info(f"Scraping single company: {args.company}")
            result = engine.scrape_company(company_config)
            print_results([result])
            
        elif args.mode == 'priority':
            logger.info("Scraping by priority groups...")
            results = engine.scrape_by_priority()
            
            for priority, priority_results in results.items():
                logger.info(f"\n=== Priority {priority} Results ===")
                print_results(priority_results)
            
        else:  # all mode
            logger.info(f"Scraping all companies with {args.workers} workers...")
            results = engine.scrape_all(
                max_workers=args.workers,
                priority_filter=args.priority
            )
            print_results(results)
        
        # Print summary
        summary = engine.get_summary()
        logger.info("\n=== Scraping Summary ===")
        logger.info(f"Total jobs in database: {summary['total_jobs']}")
        logger.info(f"Total companies: {summary['total_companies']}")
        # logger.info(f"Companies: {', '.join(summary['companies'])}")
        
    except KeyboardInterrupt:
        logger.info("\nScraping interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
    finally:
        logger.info("Scraping completed")


def print_results(results):
    """Print scraping results in a formatted way."""
    successful = [r for r in results if r['status'] == 'success']
    failed = [r for r in results if r['status'] == 'failed']
    
    total_jobs = sum(r.get('jobs_scraped', 0) for r in successful)
    
    logger.info(f"\nSuccessful: {len(successful)}/{len(results)}")
    logger.info(f"Total jobs scraped: {total_jobs}")
    
    if successful:
        logger.info("\nSuccessful scrapes:")
        for result in successful:
            # Use simple ASCII character for Windows compatibility
            logger.info(f"  [OK] {result['company']}: {result['jobs_scraped']} jobs")
    
    if failed:
        logger.info("\nFailed scrapes:")
        for result in failed:
            logger.info(f"  [X] {result['company']}: {result.get('error', 'Unknown error')}")


if __name__ == '__main__':
    main()