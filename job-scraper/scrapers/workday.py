"""
Workday ATS scraper.
Handles companies using Workday career sites (e.g., Netflix, Adobe, Intel).
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
import logging

logger = logging.getLogger(__name__)


class WorkdayScraper(BaseJobScraper):
    """Scraper for Workday-based career sites."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Workday API."""
        jobs = []
        offset = 0
        limit = 20
        max_jobs = 1500 # Safety limit - increased to capture more India jobs
        
        logger.info(f"Starting scrape for {self.company_name}...")
        
        while True:
            try:
                batch = self._fetch_page(offset, limit)
                if not batch:
                    break
                    
                jobs.extend(batch)
                offset += limit
                
                # Stop if we hit safety limit
                if len(jobs) >= max_jobs:
                    logger.info(f"Hit max job limit of {max_jobs}")
                    break
                
                # Rate limiting
                time.sleep(1)
                
                logger.info(f"Fetched {len(jobs)} jobs so far from {self.company_name}")
                
            except Exception as e:
                logger.error(f"Error fetching page at offset {offset}: {e}")
                break
                
        return jobs
    
    def _fetch_page(self, offset: int, limit: int) -> List[Dict]:
        """Fetch a single page of jobs."""
        # FIXED: Don't append '/jobs' if it's already in the config URL
        if self.base_url.endswith('/jobs'):
            api_url = self.base_url
        else:
            api_url = f"{self.base_url}/jobs"
        
        payload = {
            'appliedFacets': {},
            'limit': limit,
            'offset': offset,
            'searchText': ''
        }
        
        try:
            response = self.session.post(api_url, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            job_postings = data.get('jobPostings', [])
            
            # Check if we've reached the end
            if not job_postings:
                return []
            
            jobs = []
            for posting in job_postings:
                try:
                    job = self._parse_job(posting)
                    if job:
                        jobs.append(job)
                except Exception as e:
                    pass
                    
            return jobs
            
        except requests.RequestException as e:
            logger.error(f"Request error: {e}")
            return []
    
    def _parse_job(self, posting: Dict) -> Dict:
        """Parse a Workday job posting."""
        # 1. Title
        title = posting.get('title', 'Untitled')
        
        # 2. Location & India Filter
        location = posting.get('locationsText', '')
        # Fallback if locationsText is empty/generic
        if not location:
            location = "Unspecified"
            
        # FILTER: Only keep India jobs and global remote jobs
        if not self._is_eligible_location(location):
            return None
            
        # 3. Apply URL
        # We need the "client" part of the URL (e.g. adobe.wd5...)
        # Usually base_url is '.../wday/cxs/adobe/external/jobs'
        # We need '.../en-US/adobe/job/...'
        # This is tricky to reconstruct generically, so we approximate:
        external_path = posting.get('externalPath', '')
        
        # Try to guess the frontend URL from the API URL
        # Convert: https://adobe.../wday/cxs/adobe/external/jobs 
        # To:      https://adobe.../en-US/adobe/job{external_path}
        
        # Simple fallback: use the API base, the user will be redirected or can copy ID
        apply_url = self.base_url.replace('/wday/cxs/', '/en-US/').replace('/jobs', '') + f"/job{external_path}"

        # 4. Job ID
        job_id = posting.get('bulletinOrderId') or external_path.split('/')[-1]
        
        # 5. Description
        # Workday list API DOES NOT return full description. 
        # We use a placeholder to avoid making N+1 requests (which is very slow).
        description = posting.get('bulletFields', [])
        
        # VALIDATION: Reject jobs with no description
        if not description:
            return None
            
        desc_text = "\n".join([str(x) for x in description])

        return {
            'title': title,
            'location': location,
            'apply_url': apply_url,
            'job_id': str(job_id),
            'department': posting.get('subtitleText', ''),
            'employment_type': self._extract_employment_type(posting),
            'description': desc_text,
            'source': 'Workday'
        }
    
    def _is_eligible_location(self, location: str) -> bool:
        """
        Check if location is eligible for Indian applicants.
        Includes: India locations + global remote jobs.
        Excludes: Country-specific remote (US-only, UK-only, etc.)
        """
        if not location: 
            return False
        
        loc_lower = location.lower()
        
        # Check for remote jobs
        if self._is_remote_job(loc_lower):
            return self._is_remote_accessible_to_india(loc_lower)
        
        # Check for India-based locations
        india_keywords = [
            'india', 'bangalore', 'bengaluru', 'hyderabad', 'mumbai', 
            'delhi', 'noida', 'gurgaon', 'gurugram', 'pune', 'chennai',
            'kolkata', 'ahmedabad', 'jaipur', 'lucknow', 'kochi', 
            'thiruvananthapuram', 'chandigarh', 'indore', 'bhopal'
        ]
        
        return any(keyword in loc_lower for keyword in india_keywords)
    
    def _is_remote_job(self, location: str) -> bool:
        """Check if location indicates a remote position."""
        remote_indicators = ['remote', 'work from home', 'wfh', 'anywhere', 'distributed']
        return any(indicator in location for indicator in remote_indicators)
    
    def _is_remote_accessible_to_india(self, location: str) -> bool:
        """
        Check if a remote job is accessible to Indian applicants.
        """
        # Exclusion patterns - country-restricted remote jobs
        excluded_patterns = [
            'remote - us', 'remote (us)', 'remote us', 'us only', 'usa only',
            'remote - uk', 'remote (uk)', 'uk only',
            'remote - canada', 'canada only',
            'remote - australia', 'australia only',
            'remote - europe', 'europe only', 'eu only',
            'remote - americas', 'americas only', 'north america only',
            'us-based', 'uk-based', 'eu-based',
            'united states', 'california', 'new york', 'texas',
            'san francisco', 'seattle', 'london', 'berlin', 'paris', 'toronto'
        ]
        
        if any(pattern in location for pattern in excluded_patterns):
            return False
        
        # Inclusion patterns - definitely accessible to Indians
        included_patterns = ['india', 'apac', 'asia', 'worldwide', 'global', 'anywhere']
        if any(pattern in location for pattern in included_patterns):
            return True
        
        # Generic remote without restriction - include
        if location.strip() in ['remote', 'fully remote', '100% remote']:
            return True
        if location.startswith('remote') and len(location) < 20:
            return True
            
        return False
    
    def _extract_employment_type(self, posting: Dict) -> str:
        """Extract employment type from posting."""
        time_type = posting.get('timeType', '')
        if time_type:
            return time_type
            
        # Check bullet fields if standard field is missing
        for field in posting.get('bulletFields', []):
            field_str = str(field).lower()
            if 'full-time' in field_str or 'full time' in field_str:
                return 'Full-time'
            if 'part-time' in field_str:
                return 'Part-time'
                
        return 'Full-time'