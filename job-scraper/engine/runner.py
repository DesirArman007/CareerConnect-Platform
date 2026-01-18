"""
Main scraping engine that orchestrates all scrapers.
"""

import json
import importlib
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
from db.mongo import JobDatabase
from scrapers.custom.linkedin import LinkedInScraper
logger = logging.getLogger(__name__)


class ScraperEngine:
    """Main engine for orchestrating job scraping."""
    
    def __init__(self, config_path: str = "config/companies.json", db: JobDatabase = None):
        """
        Initialize scraper engine.
        
        Args:
            config_path: Path to companies configuration file
            db: JobDatabase instance
        """
        self.config_path = config_path
        self.companies = self._load_config()
        self.db = db or JobDatabase()
        self.scrapers = {}
        
    def _load_config(self) -> List[Dict]:
        """Load company configuration."""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                return config.get('companies', [])
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            return []
            
    def _get_scraper_class(self, scraper_name: str):
        """Dynamically import and return scraper class."""
        # 1. Check if already loaded/registered
        if scraper_name in self.scrapers:
            return self.scrapers[scraper_name]
            
        try:
            # 2. Dynamic Import Logic
            # ✅ FIX: Added 'LinkedInScraper' to this list so it looks in the 'custom' folder
            if scraper_name in ['GoogleScraper', 'AmazonScraper', 'HCLScraper', 'LinkedInScraper']:
                module_path = f"scrapers.custom.{scraper_name.replace('Scraper', '').lower()}"
            else:
                # Standard Scrapers (Greenhouse, Lever, SuccessFactors)
                module_path = f"scrapers.{scraper_name.replace('Scraper', '').lower()}"
                
            module = importlib.import_module(module_path)
            scraper_class = getattr(module, scraper_name)
            
            self.scrapers[scraper_name] = scraper_class
            return scraper_class
            
        except (ImportError, AttributeError) as e:
            logger.error(f"Error importing scraper {scraper_name}: {e}")
            return None
            
    def scrape_company(self, company_config: Dict) -> Dict:
        """
        Scrape a single company.
        
        Args:
            company_config: Company configuration dict
            
        Returns:
            Dict with scraping results
        """
        company_name = company_config['name']
        
        try:
            logger.info(f"Starting scrape for {company_name}")
            
            scraper_class = self._get_scraper_class(company_config['scraper'])
            if not scraper_class:
                raise Exception(f"Scraper {company_config['scraper']} not found")
                
            scraper = scraper_class(
                company_name=company_name,
                base_url=company_config['url'],
                config=company_config
            )
            
            jobs = scraper.get_jobs()
            
            # Store in database
            stats = self.db.insert_jobs(jobs)
            
            # Log scrape
            self.db.log_scrape(
                company=company_name,
                status='success',
                jobs_count=len(jobs)
            )
            
            result = {
                'company': company_name,
                'status': 'success',
                'jobs_scraped': len(jobs),
                'db_stats': stats
            }
            
            logger.info(f"Completed {company_name}: {len(jobs)} jobs")
            return result
            
        except Exception as e:
            logger.error(f"Error scraping {company_name}: {e}")
            
            self.db.log_scrape(
                company=company_name,
                status='failed',
                jobs_count=0,
                error=str(e)
            )
            
            return {
                'company': company_name,
                'status': 'failed',
                'error': str(e)
            }
            
    def scrape_all(self, max_workers: int = 5, priority_filter: int = None) -> List[Dict]:
        """
        Scrape all enabled companies.
        
        Args:
            max_workers: Maximum parallel workers
            priority_filter: Only scrape companies with this priority (optional)
            
        Returns:
            List of scraping results
        """
        companies_to_scrape = [
            c for c in self.companies
            if c.get('enabled', False) and
            (priority_filter is None or c.get('priority') == priority_filter)
        ]
        
        logger.info(f"Starting scrape for {len(companies_to_scrape)} companies")
        
        results = []
        
        # Use ThreadPoolExecutor for I/O-bound scraping
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(self.scrape_company, company): company
                for company in companies_to_scrape
            }
            
            for future in as_completed(futures):
                company = futures[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    logger.error(f"Exception for {company['name']}: {e}")
                    results.append({
                        'company': company['name'],
                        'status': 'failed',
                        'error': str(e)
                    })
                    
        return results
        
    def scrape_by_priority(self) -> Dict[int, List[Dict]]:
        """
        Scrape companies grouped by priority.
        Higher priority (lower number) scraped first.
        
        Returns:
            Dict mapping priority to results
        """
        priorities = sorted(set(c.get('priority', 99) for c in self.companies))
        
        all_results = {}
        
        for priority in priorities:
            logger.info(f"Scraping priority {priority} companies")
            results = self.scrape_all(priority_filter=priority)
            all_results[priority] = results
            
        return all_results
        
    def get_summary(self) -> Dict:
        """Get summary of all scraped data."""
        total_jobs = self.db.jobs_collection.count_documents({})
        total_companies = self.db.jobs_collection.distinct('company')
        
        recent_scrapes = list(
            self.db.scrape_logs.find()
            .sort('timestamp', -1)
            .limit(20)
        )
        
        return {
            'total_jobs': total_jobs,
            'total_companies': len(total_companies),
            'companies': total_companies,
            'recent_scrapes': recent_scrapes
        }