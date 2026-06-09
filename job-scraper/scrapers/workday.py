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
        
        # Get max jobs from config (default 50)
        max_jobs = self.config.get('limit', 50)
        
        logger.info(f"Starting scrape for {self.company_name}... (max: {max_jobs} jobs)")
        
        consecutive_filtered_batches = 0
        
        while True:
            try:
                batch = self._fetch_page(offset, limit)
                if not batch:
                    break
                
                # Check if we are finding valid jobs
                valid_jobs_start_count = len(jobs)
                
                # CRITICAL FIX: Parse each raw posting into our schema
                for posting in batch:
                    try:
                        parsed_job = self._parse_job(posting)
                        if parsed_job:
                            jobs.append(parsed_job)
                            # Check max_jobs limit
                            if max_jobs and len(jobs) >= max_jobs:
                                logger.info(f"Hit max job limit of {max_jobs}")
                                return jobs
                    except Exception as e:
                        # Skip individual parsing failures
                        pass
                
                # Loop Protection: If we fetched a full batch but found 0 valid jobs (all filtered)
                # repeat this for 5 batches (100 jobs), then give up to avoid infinite scraping of US jobs
                if len(jobs) == valid_jobs_start_count:
                    consecutive_filtered_batches += 1
                else:
                    consecutive_filtered_batches = 0
                    
                if consecutive_filtered_batches >= 5:
                    logger.info(f"Stopping after {consecutive_filtered_batches} batches with 0 valid jobs (Location filtering active)")
                    break
                    
                offset += limit
                
                # Rate limiting
                time.sleep(1)
                
                logger.info(f"Fetched {len(jobs)} jobs so far from {self.company_name}")
                
            except Exception as e:
                logger.error(f"Error fetching page at offset {offset}: {e}")
                break
                
        
        return jobs
    
    def _fetch_page(self, offset: int, limit: int) -> List[Dict]:
        """Fetch a single page of jobs."""
        if self.base_url.endswith('/jobs'):
            api_url = self.base_url
        else:
            api_url = f"{self.base_url}/jobs"
        
        # Optimization: Use server-side filtering if country is specified
        search_text = ''
        if self.config and self.config.get('filter_country'):
            search_text = self.config.get('filter_country')

        payload = {
            'appliedFacets': {},
            'limit': limit,
            'offset': offset,
            'searchText': search_text
        }
        
        try:
            # logger.debug(f"Fetching {api_url} with payload {payload}")
            response = self.session.post(api_url, json=payload, timeout=30)
            
            # If 422 (Unprocessable Entity), try a simpler payload
            if response.status_code == 422:
                logger.warning(f"Got 422 for {self.company_name}, retrying with minimal payload...")
                minimal_payload = {
                    'limit': limit,
                    'offset': offset
                }
                response = self.session.post(api_url, json=minimal_payload, timeout=30)

            response.raise_for_status()
            data = response.json()
            return data.get('jobPostings', [])
            
        except requests.RequestException as e:
            logger.error(f"Request error: {e}")
            if hasattr(e, 'response') and e.response:
                logger.debug(f"Response Content: {e.response.text[:200]}")
            return []
    
    def _parse_job(self, posting: Dict) -> Dict:
        """Parse a Workday job posting."""
        title = posting.get('title', 'Untitled')
        
        # 1. Location Logic
        location = posting.get('locationsText', '')
        if not location:
            location = "Unspecified"
            
        if not self._is_eligible_location(location):
            return None
            
        # 2. Robust URL Construction
        # APIBase: https://{host}/wday/cxs/{tenant}/{site}/jobs
        # FrontURL: https://{host}/en-US/{tenant}/{site}/job/{slug}
        # But externalPath usually looks like: "/job/slug" or "/job/location/slug"
        
        try:
            # Extract base parts: .../wday/cxs/{tenant}/{site}/...
            if '/wday/cxs/' in self.base_url:
                base_parts = self.base_url.split('/wday/cxs/')
                host = base_parts[0]
                # path_part is like "nvidia/NVIDIAExternalCareerSite"
                # But frontend URL only needs the SITE name, not tenant!
                # So we split and take the last part
                path_part = base_parts[1].replace('/jobs', '').strip('/')
                site_name = path_part.split('/')[-1] if '/' in path_part else path_part
                
                ext = posting.get('externalPath') or ''
                # Frontend URL: /{site}{externalPath}
                # Example: /NVIDIAExternalCareerSite/job/India-Pune/Senior-Engineer_JR123
                
                apply_url = f"{host}/{site_name}{ext}"
            else:
                # Fallback
                apply_url = posting.get('externalPath') or ''
                
        except Exception as e:
            logger.error(f"URL Gen Error: {e}")
            apply_url = posting.get('externalPath') or ''
            
        # 3. Description Fetching
        description = self._get_full_description(posting)
        
        if not description or len(description) < 50:
            bullets = posting.get('bulletFields', [])
            if bullets:
                # Format bullet points nicely for Markdown/Display
                description = "\n".join([f"• {str(x)}" for x in bullets])
        
        if not description or len(description) < 20:
             return None

        # 4. Job ID
        job_id = posting.get('bulletinOrderId') or posting.get('externalPath', '').split('/')[-1]
        
        # DEBUG TRACE - Removed for production
        # print(f"DEBUG: Parsed job '{title}' | URL: {apply_url[:30]}... | DescLen: {len(description)}")

        return {
            'title': title,
            'location': location,
            'apply_url': apply_url,
            'job_id': str(job_id),
            'department': posting.get('subtitleText', ''),
            'employment_type': self._extract_employment_type(posting),
            'description': description,
            'source': 'Workday'
        }

    def _get_full_description(self, posting: Dict) -> str:
        """
        Attempt to fetch full description from the job detail API.
        The detail API is usually at {base_url}/{job_slug}
        """
        try:
            # externalPath is like "/job-slug"
            slug = posting.get('externalPath', '')
            if not slug:
                return ""
                
            # Construct detail API URL
            # Base: .../jobs 
            # Detail: .../{slug} (without /jobs)
            if self.base_url.endswith('/jobs'):
                base_without_jobs = self.base_url[:-5]
            else:
                base_without_jobs = self.base_url
                
            detail_url = f"{base_without_jobs}{slug}"
            
            resp = self.session.get(detail_url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                # Workday detail JSON usually has 'jobPostingInfo' -> 'jobDescription'
                return data.get('jobPostingInfo', {}).get('jobDescription', '')
        except Exception as e:
            # Be silent on individual detail fetch failures to avoid spamming logs
            pass
            
        return ""

    def _is_eligible_location(self, location: str) -> bool:
        """
        Check if location is eligible.
        Updated: Returns True for ALL locations (Global scraping).
        """
        return True
    
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
            
        return 'Full-time'