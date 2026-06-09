"""
Custom scraper for Apple Jobs.
Apple uses a custom API for their careers site.
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
import logging

logger = logging.getLogger(__name__)


class AppleScraper(BaseJobScraper):
    """Custom scraper for Apple Jobs."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Origin': 'https://jobs.apple.com',
            'Referer': 'https://jobs.apple.com/'
        })
        
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Apple Jobs API."""
        jobs = []
        page = 0
        page_size = 100
        max_pages = 5
        max_jobs = 50  # Max jobs per company
        
        # Apple's job search API endpoint
        api_url = "https://jobs.apple.com/api/v1/search"
        
        while page < max_pages:
            try:
                # Payload for India jobs
                payload = {
                    "filters": {
                        "locations": {
                            "location": ["India"]
                        }
                    },
                    "page": page,
                    "locale": "en-us",
                    "sort": "newest"
                }
                
                logger.info(f"Fetching Apple jobs page {page + 1}...")
                
                response = self.session.post(api_url, json=payload, timeout=30)
                
                if response.status_code != 200:
                    logger.warning(f"API returned status {response.status_code}")
                    break
                
                data = response.json()
                
                # Extract jobs from response
                job_listings = data.get('searchResults', [])
                
                if not job_listings:
                    logger.info(f"No jobs found on page {page + 1}")
                    break
                
                for job_data in job_listings:
                    try:
                        job = self._parse_job(job_data)
                        if job:
                            jobs.append(job)
                            if len(jobs) >= max_jobs:
                                logger.info(f"Hit max job limit of {max_jobs}")
                                return jobs
                    except Exception as e:
                        logger.debug(f"Error parsing job: {e}")
                
                logger.info(f"Page {page + 1}: Fetched {len(job_listings)} jobs (Total: {len(jobs)})")
                
                # Check total results to see if we should continue
                total_results = data.get('totalRecords', 0)
                if len(jobs) >= total_results:
                    logger.info("Fetched all available jobs")
                    break
                
                # Check if we got fewer results (last page)
                if len(job_listings) < page_size:
                    break
                
                page += 1
                time.sleep(1)  # Rate limiting
                
            except requests.RequestException as e:
                logger.error(f"Error fetching page {page + 1}: {e}")
                break
        
        logger.info(f"Total Apple India jobs scraped: {len(jobs)}")
        return jobs
    
    def _parse_job(self, job_data: Dict) -> Dict:
        """Parse an Apple job posting."""
        try:
            # Extract location
            location_obj = job_data.get('locations', {})
            
            # Location can be in different formats
            if isinstance(location_obj, dict):
                location = location_obj.get('location', '')
            elif isinstance(location_obj, list) and location_obj:
                location = location_obj[0].get('location', '') if isinstance(location_obj[0], dict) else str(location_obj[0])
            else:
                location = str(location_obj)
            
            # Also check positionLocation field
            if not location:
                location = job_data.get('positionLocation', '')
            
            # Filter for India jobs only
            if not self._is_eligible_location(location):
                return None
            
            # Extract job ID
            job_id = job_data.get('positionId', '') or job_data.get('id', '')
            
            # Build apply URL
            apply_url = job_data.get('url', '')
            if not apply_url and job_id:
                apply_url = f"https://jobs.apple.com/en-us/details/{job_id}"
            
            # Make URL absolute
            if apply_url and not apply_url.startswith('http'):
                apply_url = f"https://jobs.apple.com{apply_url}"
            
            # Extract title
            title = job_data.get('postingTitle', 'Untitled Position') or job_data.get('title', 'Untitled Position')
            
            # Extract department/team
            department = job_data.get('team', 'Apple')
            if not department or department == 'Apple':
                department = job_data.get('jobFunction', 'Apple') or job_data.get('businessUnit', 'Apple')
            
            # Extract employment type
            employment_type = job_data.get('employmentType', 'Full-time')
            if not employment_type or employment_type == 'Full-time':
                # Check if internship or other type
                if 'intern' in title.lower():
                    employment_type = 'Internship'
                elif 'contract' in title.lower():
                    employment_type = 'Contract'
                else:
                    employment_type = 'Full-time'
            
            # Extract description
            description = job_data.get('description', 'No description available.')
            if not description or description == 'No description available.':
                description = job_data.get('summary', 'No description available.')
            
            # Construct the job object
            job = {
                'title': title,
                'location': location,
                'apply_url': apply_url,
                'job_id': str(job_id),
                'department': department,
                'employment_type': employment_type,
                'description': description,
                'source': 'Apple'
            }
            
            return job
            
        except Exception as e:
            logger.debug(f"Error in _parse_job: {e}")
            return None
    
    def _is_eligible_location(self, location: str) -> bool:
        """Check if location is in India."""
        if not location:
            return False
            
        location_lower = location.lower()
        india_keywords = [
            'india', 'bangalore', 'bengaluru', 'hyderabad', 'mumbai',
            'delhi', 'noida', 'gurgaon', 'gurugram', 'pune', 'chennai',
            'kolkata', 'goa', 'ahmedabad', 'chandigarh'
        ]
        return any(keyword in location_lower for keyword in india_keywords)