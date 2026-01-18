"""
Custom scraper for Amazon Jobs.
Amazon has an API-driven career site.
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
import logging

logger = logging.getLogger(__name__)


class AmazonScraper(BaseJobScraper):
    """Custom scraper for Amazon Jobs."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate'  # Avoid zstandard compression
        })
        
    # def scrape(self) -> List[Dict]:
    #     """Scrape jobs from Amazon Jobs API."""
    #     jobs = []
    #     offset = 0
    #     limit = 100
        
    #     api_url = "https://www.amazon.jobs/en/search.json"
        
    #     while True:
    #         try:
    #             params = {
    #                 'offset': offset,
    #                 'result_limit': limit,
    #                 'sort': 'recent',
    #                 'category[]': [],  # Empty to get all categories
    #                 'country[]': ['IND']  # Filter for India only
    #             }
                
    #             response = self.session.get(api_url, params=params, timeout=30)
    #             response.raise_for_status()
    #             data = response.json()
                
    #             job_listings = data.get('jobs', [])
                
    #             if not job_listings:
    #                 break
                
    #             for job_data in job_listings:
    #                 try:
    #                     job = self._parse_job(job_data)
    #                     jobs.append(job)
    #                 except Exception as e:
    #                     logger.error(f"Error parsing job: {e}")
                
    #             # Check pagination
    #             hits = data.get('hits', 0)
    #             if offset + limit >= hits:
    #                 break
                
    #             offset += limit
    #             time.sleep(0.5)
                
    #             logger.info(f"Fetched {len(jobs)} jobs from Amazon")
                
    #         except requests.RequestException as e:
    #             logger.error(f"Error fetching Amazon jobs: {e}")
    #             break
        
    #     return jobs

    def scrape(self) -> List[Dict]:
        """Scrape jobs from Amazon Jobs API."""
        jobs = []
        offset = 0
        limit = 100
        target_jobs_count = 500  # <--- Set your hard limit here
        
        api_url = "https://www.amazon.jobs/en/search.json"
        
        while len(jobs) < target_jobs_count:  # <--- Check total jobs in loop condition
            try:
                params = {
                    'offset': offset,
                    'result_limit': limit,
                    'sort': 'recent',
                    'category[]': [],
                    'country[]': ['IND']
                }
                
                response = self.session.get(api_url, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                job_listings = data.get('jobs', [])
                
                if not job_listings:
                    break
                
                for job_data in job_listings:
                    try:
                        job = self._parse_job(job_data)
                        jobs.append(job)
                        
                        # Stop immediately if we hit the limit while processing this batch
                        if len(jobs) >= target_jobs_count:
                            break
                            
                    except Exception as e:
                        logger.error(f"Error parsing job: {e}")
                
                # Log progress
                logger.info(f"Scanned {len(jobs)} jobs so far...")

                # Break outer loop if limit reached
                if len(jobs) >= target_jobs_count:
                    break
                
                # Check pagination (if we haven't hit our limit but Amazon runs out of jobs)
                hits = data.get('hits', 0)
                if offset + limit >= hits:
                    break
                
                offset += limit
                time.sleep(0.5)
                
            except requests.RequestException as e:
                logger.error(f"Error fetching Amazon jobs: {e}")
                break
        
        return jobs[:target_jobs_count] # Return exactly the limit
    
    # def _parse_job(self, job_data: Dict) -> Dict:
    #     """Parse an Amazon job posting."""
    #     # Location handling
    #     location_parts = []
    #     city = job_data.get('city', '')
    #     state = job_data.get('state', '')
    #     country = job_data.get('country', '')
        
    #     if city:
    #         location_parts.append(city)
    #     if state:
    #         location_parts.append(state)
    #     if country:
    #         location_parts.append(country)
            
    #     location = ', '.join(location_parts)
        
    #     # Job URL
    #     job_path = job_data.get('job_path', '')
    #     apply_url = f"https://www.amazon.jobs{job_path}" if job_path else ''
        
    #     return {
    #         'title': job_data.get('title', ''),
    #         'location': location,
    #         'apply_url': apply_url,
    #         'job_id': job_data.get('id_icims', ''),
    #         'department': job_data.get('business_category', ''),
    #         'employment_type': job_data.get('schedule_type_id', 'Full-time'),
    #         'description': job_data.get('description', ''),
    #         'source': 'Amazon'
    #     }

    def _parse_job(self, job_data: Dict) -> Dict:
        """Parse an Amazon job posting with strict fallbacks."""
        
        # 1. Robust ID Extraction
        raw_id = job_data.get('id_icims') or job_data.get('id') or job_data.get('job_id')
        job_id = str(raw_id) if raw_id else ''

        # 2. Robust Location Handling (The likely culprit)
        location_parts = []
        if job_data.get('city'): location_parts.append(job_data['city'])
        if job_data.get('state'): location_parts.append(job_data['state'])
        if job_data.get('country'): location_parts.append(job_data['country'])
        
        location = ', '.join(location_parts)
        
        # If location is empty (common in Amazon API), force a default based on your filter
        if not location:
            location = "India (Remote/Unspecified)"

        # 3. Robust URL Handling
        job_path = job_data.get('job_path', '')
        if job_path:
            apply_url = f"https://www.amazon.jobs{job_path}"
        else:
            # Fallback: Construct a search URL if the specific job link is missing
            apply_url = f"https://www.amazon.jobs/en/jobs/{job_id}"

        # 4. Construct the job object
        job = {
            'title': job_data.get('title', 'Untitled Position'), # Default title if missing
            'location': location,
            'apply_url': apply_url,
            'job_id': job_id,
            'department': job_data.get('business_category', 'Amazon'),
            'employment_type': job_data.get('schedule_type_id', 'Full-time'),
            'description': job_data.get('description', 'No description available.'),
            'source': 'Amazon'
        }

        # 5. Pre-validation Debugging
        # This will print to your console exactly which field is empty BEFORE the base scraper rejects it
        if not job['job_id']: logger.error(f"⚠️ Missing ID for: {job['title']}")
        if not job['location']: logger.error(f"⚠️ Missing Location for: {job['title']}")
        if not job['apply_url']: logger.error(f"⚠️ Missing URL for: {job['title']}")

        return job