"""
Greenhouse ATS scraper.
Handles companies using Greenhouse (e.g., Airbnb, Stripe, Coinbase).
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


class GreenhouseScraper(BaseJobScraper):
    """Scraper for Greenhouse-based career sites."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Extract company identifier from URL
        self.company_identifier = self._extract_company_id()
        logger.info(f"Greenhouse ID extracted: {self.company_identifier}")
        
    def _extract_company_id(self) -> str:
        """Robustly extract company identifier from base URL."""
        try:
            parsed = urllib.parse.urlparse(self.base_url)
            
            # Case 1: boards.greenhouse.io/company
            if 'boards.greenhouse.io' in parsed.netloc:
                path_parts = parsed.path.strip('/').split('/')
                if path_parts:
                    return path_parts[0]
            
            # Case 2: company.greenhouse.io
            if '.greenhouse.io' in parsed.netloc and 'boards' not in parsed.netloc:
                return parsed.netloc.split('.')[0]
                
            # Fallback: Use company name
            return self.company_name.lower().replace(' ', '')
        except:
            return self.company_name.lower().replace(' ', '')
    
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Greenhouse API."""
        jobs = []
        
        # API URL with content=true to get descriptions
        api_url = f"https://boards-api.greenhouse.io/v1/boards/{self.company_identifier}/jobs?content=true"
        
        try:
            logger.info(f"Fetching from API: {api_url}")
            response = self.session.get(api_url, timeout=30)
            
            if response.status_code == 404:
                logger.warning("API not found, falling back to HTML scraping")
                return self._scrape_html()
                
            response.raise_for_status()
            data = response.json()
            
            # Greenhouse wraps jobs in a 'jobs' key
            job_listings = data.get('jobs', [])
            
            for job_data in job_listings:
                try:
                    job = self._parse_job(job_data)
                    if job:
                        jobs.append(job)
                except Exception as e:
                    logger.error(f"Error parsing job: {e}")
            
            logger.info(f"Fetched {len(jobs)} jobs from {self.company_name}")
            
        except requests.RequestException as e:
            logger.error(f"Error fetching Greenhouse jobs: {e}")
            jobs = self._scrape_html()
            
        return jobs
    
    def _parse_job(self, job_data: Dict) -> Dict:
        """Parse a Greenhouse job posting."""
        # Extract location safely
        location_obj = job_data.get('location') or {} 
        location_name = location_obj.get('name', '') if isinstance(location_obj, dict) else str(location_obj)
        
        # Filter for India 
        if not self._is_eligible_location(location_name):
            return None
            
        # Extract Department safely
        departments = job_data.get('departments') or []
        department_name = departments[0].get('name', '') if departments else ''
        
        # --- IMPROVED CLEANING LOGIC ---
        raw_content = job_data.get('content', '')
        html_content = html.unescape(raw_content)
        
        # 1. Get text with newlines
        text = BeautifulSoup(html_content, 'html.parser').get_text(separator='\n')
        
        # 2. Split by lines, strip whitespace from each line, and remove empty lines
        clean_lines = [line.strip() for line in text.splitlines() if line.strip()]
        
        # 3. Join back with double newlines (paragraphs) or single (list style)
        # Using double newline '\n\n' makes it look like nice paragraphs
        clean_description = '\n\n'.join(clean_lines)
        # --- CLEANING LOGIC END ---
        
        return {
            'title': job_data.get('title', 'Untitled'),
            'location': location_name,
            'apply_url': job_data.get('absolute_url', ''),
            'job_id': str(job_data.get('id', '')),
            'department': department_name,
            'employment_type': self._extract_employment_type(job_data),
            'description': clean_description,
            'source': 'Greenhouse'
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

    def _extract_employment_type(self, job_data: Dict) -> str:
        """Extract employment type from job data."""
        # FIXED: Added 'or []' to handle case where metadata is null
        metadata = job_data.get('metadata') or []
        
        for meta in metadata:
            if isinstance(meta, dict):
                name = meta.get('name', '').lower()
                value = meta.get('value', '')
                if 'employment' in name or 'type' in name:
                    return value
        return 'Full-time' 
    
    def _scrape_html(self) -> List[Dict]:
        """Fallback HTML scraping method."""
        jobs = []
        logger.info("Attempting HTML fallback scrape...")
        
        try:
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            job_sections = soup.find_all('div', class_='opening')
            
            for section in job_sections:
                try:
                    link = section.find('a')
                    if not link: continue
                        
                    title = link.get_text(strip=True)
                    url = link.get('href', '')
                    if url.startswith('/'):
                        url = f"https://boards.greenhouse.io{url}"
                    
                    location_elem = section.find('span', class_='location')
                    location = location_elem.get_text(strip=True) if location_elem else ''
                    
                    if not self._is_eligible_location(location):
                        continue
                        
                    jobs.append({
                        'title': title,
                        'location': location,
                        'apply_url': url,
                        'job_id': url.split('/')[-1].split('?')[0] if '/' in url else '',
                        'department': '',
                        'employment_type': 'Full-time',
                        'description': 'Description available on apply page',
                        'source': 'Greenhouse'
                    })
                    
                except Exception as e:
                    pass
                    
            logger.info(f"HTML scraping found {len(jobs)} jobs")
            
        except Exception as e:
            logger.error(f"HTML scraping error: {e}")
            
        return jobs