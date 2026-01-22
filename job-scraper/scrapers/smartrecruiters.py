"""
SmartRecruiters ATS scraper.
Handles companies using SmartRecruiters platform.
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging
import urllib.parse
import html

logger = logging.getLogger(__name__)


class SmartRecruitersScraper(BaseJobScraper):
    """Scraper for SmartRecruiters-based career sites."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        })
        
        # Extract company identifier from URL
        self.company_identifier = self._extract_company_id()
        logger.info(f"SmartRecruiters ID extracted: {self.company_identifier}")
        
    def _extract_company_id(self) -> str:
        """Extract company identifier from base URL."""
        try:
            parsed = urllib.parse.urlparse(self.base_url)
            
            # Case 1: careers.smartrecruiters.com/Company
            if 'smartrecruiters.com' in parsed.netloc:
                path_parts = parsed.path.strip('/').split('/')
                if path_parts:
                    return path_parts[0]
            
            # Fallback: Use company name
            return self.company_name.replace(' ', '')
        except:
            return self.company_name.replace(' ', '')
    
    def scrape(self) -> List[Dict]:
        """Scrape jobs from SmartRecruiters API."""
        jobs = []
        offset = 0
        limit = 100
        max_jobs = 500
        
        # SmartRecruiters public API
        api_url = f"https://api.smartrecruiters.com/v1/companies/{self.company_identifier}/postings"
        
        logger.info(f"Starting SmartRecruiters scrape for {self.company_name}...")
        
        while len(jobs) < max_jobs:
            try:
                params = {
                    'offset': offset,
                    'limit': limit,
                    'country': 'in'  # Filter for India
                }
                
                response = self.session.get(api_url, params=params, timeout=30)
                
                if response.status_code == 404:
                    logger.warning("SmartRecruiters API not found, trying HTML fallback")
                    return self._scrape_html()
                    
                response.raise_for_status()
                data = response.json()
                
                job_listings = data.get('content', [])
                
                if not job_listings:
                    break
                
                for job_data in job_listings:
                    try:
                        job = self._parse_job(job_data)
                        if job:
                            jobs.append(job)
                    except Exception as e:
                        logger.error(f"Error parsing job: {e}")
                
                # Check pagination
                total_found = data.get('totalFound', 0)
                if offset + limit >= total_found:
                    break
                    
                offset += limit
                time.sleep(0.5)  # Rate limiting
                
                logger.info(f"Fetched {len(jobs)} jobs so far from {self.company_name}")
                
            except requests.RequestException as e:
                logger.error(f"Error fetching SmartRecruiters jobs: {e}")
                break
            
        logger.info(f"Total {len(jobs)} jobs from {self.company_name}")
        return jobs
    
    def _parse_job(self, job_data: Dict) -> Dict:
        """Parse a SmartRecruiters job posting."""
        # Extract location
        location_obj = job_data.get('location', {})
        city = location_obj.get('city', '')
        region = location_obj.get('region', '')
        country = location_obj.get('country', '')
        
        location_parts = [p for p in [city, region, country] if p]
        location = ', '.join(location_parts)
        
        # Filter for India 
        if not self._is_eligible_location(location):
            return None
        
        # Extract department
        department_obj = job_data.get('department', {})
        department = department_obj.get('label', '') if isinstance(department_obj, dict) else str(department_obj)
        
        # Extract employment type
        type_of_employment = job_data.get('typeOfEmployment', {})
        employment_type = type_of_employment.get('label', 'Full-time') if isinstance(type_of_employment, dict) else 'Full-time'
        
        # Get job URL
        ref_number = job_data.get('refNumber', '')
        apply_url = job_data.get('applyUrl', '')
        
        if not apply_url:
            uuid = job_data.get('uuid', '') or job_data.get('id', '')
            apply_url = f"https://jobs.smartrecruiters.com/{self.company_identifier}/{uuid}"
        
        # Get description
        description = job_data.get('jobAd', {}).get('sections', {}).get('jobDescription', {}).get('text', '')
        if not description:
            description = 'Description available on apply page'
        else:
            # Clean HTML
            description = BeautifulSoup(html.unescape(description), 'html.parser').get_text(separator='\n')
        
        return {
            'title': job_data.get('name', 'Untitled'),
            'location': location,
            'apply_url': apply_url,
            'job_id': ref_number or job_data.get('id', ''),
            'department': department,
            'employment_type': employment_type,
            'description': description.strip() if description else 'Description available on apply page',
            'source': 'SmartRecruiters'
        }
    
    def _is_eligible_location(self, location: str) -> bool:
        """Check if location is in India."""
        if not location:
            return False
        
        india_keywords = [
            'india', 'bangalore', 'bengaluru', 'hyderabad', 'mumbai', 
            'delhi', 'noida', 'gurgaon', 'gurugram', 'pune', 'chennai',
            'kolkata', 'goa', 'ahmedabad', 'chandigarh', 'remote'
        ]
        
        loc_lower = location.lower()
        if loc_lower == 'remote':
            return True
            
        return any(keyword in loc_lower for keyword in india_keywords)

    def _scrape_html(self) -> List[Dict]:
        """Fallback HTML scraping method."""
        jobs = []
        logger.info("Attempting SmartRecruiters HTML fallback scrape...")
        
        try:
            html_url = f"https://careers.smartrecruiters.com/{self.company_identifier}"
            response = self.session.get(html_url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job postings
            postings = soup.find_all('li', class_='opening-job') or soup.find_all('a', class_='link--block')
            
            for posting in postings:
                try:
                    # Try to find link
                    link = posting if posting.name == 'a' else posting.find('a')
                    if not link:
                        continue
                        
                    url = link.get('href', '')
                    if url and not url.startswith('http'):
                        url = f"https://careers.smartrecruiters.com{url}"
                    
                    # Title
                    title_elem = link.find('h4') or link.find('h3') or link.find('span', class_='job-title')
                    title = title_elem.get_text(strip=True) if title_elem else link.get_text(strip=True)
                    
                    # Location
                    location_elem = link.find('span', class_='job-location') or link.find('li', class_='location')
                    location = location_elem.get_text(strip=True) if location_elem else ''
                    
                    if not self._is_eligible_location(location):
                        continue
                    
                    # Job ID from URL
                    job_id = url.split('/')[-1] if url else ''
                    
                    jobs.append({
                        'title': title,
                        'location': location,
                        'apply_url': url,
                        'job_id': job_id,
                        'department': '',
                        'employment_type': 'Full-time',
                        'description': 'Description available on apply page',
                        'source': 'SmartRecruiters'
                    })
                    
                except Exception as e:
                    logger.debug(f"Error parsing posting: {e}")
                    
            logger.info(f"HTML scraping found {len(jobs)} jobs")
            
        except Exception as e:
            logger.error(f"HTML scraping error: {e}")
            
        return jobs
