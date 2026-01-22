"""
iCIMS ATS scraper.
Handles companies using iCIMS enterprise recruitment platform.
"""

import requests
import time
import re
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging
import urllib.parse
import html

logger = logging.getLogger(__name__)


class iCIMSScraper(BaseJobScraper):
    """Scraper for iCIMS-based career sites."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        })
        
        # Parse the base URL to extract company domain
        self.company_domain = self._extract_domain()
        logger.info(f"iCIMS domain extracted: {self.company_domain}")
        
    def _extract_domain(self) -> str:
        """Extract company iCIMS domain from base URL."""
        try:
            parsed = urllib.parse.urlparse(self.base_url)
            return f"{parsed.scheme}://{parsed.netloc}"
        except:
            return self.base_url
    
    def scrape(self) -> List[Dict]:
        """Scrape jobs from iCIMS career site."""
        jobs = []
        page = 1
        max_pages = 20
        
        logger.info(f"Starting iCIMS scrape for {self.company_name}...")
        
        while page <= max_pages:
            try:
                # iCIMS uses query parameters for pagination
                params = {
                    'pr': page,
                    'searchLocation': 'India',
                    'in_iframe': '1'
                }
                
                search_url = f"{self.company_domain}/jobs/search"
                
                response = self.session.get(search_url, params=params, timeout=30)
                
                if response.status_code != 200:
                    logger.warning(f"iCIMS returned status {response.status_code}")
                    break
                    
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find job listings
                page_jobs = self._parse_job_list(soup)
                
                if not page_jobs:
                    break
                    
                jobs.extend(page_jobs)
                
                logger.info(f"Page {page}: Found {len(page_jobs)} jobs (Total: {len(jobs)})")
                
                # Check if there's a next page
                next_btn = soup.find('a', class_='iCIMS_Paging_Next') or soup.find('a', text=re.compile(r'Next', re.I))
                if not next_btn:
                    break
                    
                page += 1
                time.sleep(1)  # Rate limiting
                
            except requests.RequestException as e:
                logger.error(f"Error fetching iCIMS jobs: {e}")
                break
            
        logger.info(f"Total {len(jobs)} jobs from {self.company_name}")
        return jobs
    
    def _parse_job_list(self, soup: BeautifulSoup) -> List[Dict]:
        """Parse job listings from search results page."""
        jobs = []
        
        # iCIMS uses various class names for job listings
        job_containers = (
            soup.find_all('div', class_='iCIMS_JobsTable') or
            soup.find_all('tr', class_='iCIMS_JobRow') or
            soup.find_all('div', class_='row') or
            soup.find_all('li', class_='job')
        )
        
        # Also try to find jobs in table rows
        if not job_containers:
            table = soup.find('table', class_='iCIMS_JobsTable')
            if table:
                job_containers = table.find_all('tr')[1:]  # Skip header row
        
        for container in job_containers:
            try:
                job = self._parse_job_row(container)
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"Error parsing job row: {e}")
                
        return jobs
    
    def _parse_job_row(self, container) -> Dict:
        """Parse a single job row/container."""
        # Find job link
        link = container.find('a', class_='iCIMS_Anchor') or container.find('a')
        if not link:
            return None
            
        url = link.get('href', '')
        if not url:
            return None
            
        # Make URL absolute
        if url.startswith('/'):
            url = f"{self.company_domain}{url}"
        elif not url.startswith('http'):
            url = f"{self.company_domain}/{url}"
        
        # Title
        title = link.get_text(strip=True)
        if not title or len(title) < 3:
            return None
        
        # Location - look for location cell/element
        location = ''
        location_elem = (
            container.find('span', class_='iCIMS_JobLocation') or
            container.find('td', class_='location') or
            container.find('span', text=re.compile(r'India|Bangalore|Mumbai|Delhi|Hyderabad', re.I))
        )
        if location_elem:
            location = location_elem.get_text(strip=True)
        
        # If no location found, try to find any element with India-related text
        if not location:
            text = container.get_text()
            if self._is_eligible_location(text):
                # Extract city name from text
                location = self._extract_location_from_text(text)
            else:
                return None
        
        if not self._is_eligible_location(location):
            return None
        
        # Job ID from URL
        job_id = ''
        id_match = re.search(r'/jobs/(\d+)', url)
        if id_match:
            job_id = id_match.group(1)
        else:
            job_id = url.split('/')[-1].split('?')[0]
        
        # Department
        dept_elem = container.find('span', class_='iCIMS_JobCategory') or container.find('td', class_='department')
        department = dept_elem.get_text(strip=True) if dept_elem else ''
        
        return {
            'title': title,
            'location': location,
            'apply_url': url,
            'job_id': job_id,
            'department': department,
            'employment_type': 'Full-time',
            'description': 'Description available on apply page',
            'source': 'iCIMS'
        }
    
    def _extract_location_from_text(self, text: str) -> str:
        """Extract location from text content."""
        cities = [
            'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad',
            'Chennai', 'Pune', 'Kolkata', 'Noida', 'Gurgaon', 'Gurugram'
        ]
        
        text_lower = text.lower()
        for city in cities:
            if city.lower() in text_lower:
                return f"{city}, India"
        
        if 'india' in text_lower:
            return 'India'
            
        return ''
    
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
