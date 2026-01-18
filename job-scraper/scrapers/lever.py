"""
Lever ATS scraper (Hybrid: API + HTML Fallback).
Handles companies using Lever. If API is disabled (404), it scrapes the HTML page.
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class LeverScraper(BaseJobScraper):
    """Scraper for Lever-based career sites with HTML fallback."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        self.company_identifier = self._extract_company_id()
        
    def _extract_company_id(self) -> str:
        """Extract company identifier from base URL."""
        # Example: https://jobs.lever.co/swiggy -> swiggy
        if 'jobs.lever.co' in self.base_url:
            parts = self.base_url.rstrip('/').split('/')
            return parts[-1]
        return self.company_name.lower().replace(' ', '')
    
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Lever API or HTML fallback."""
        jobs = []
        
        # 1. Try API First
        api_url = f"https://api.lever.co/v0/postings/{self.company_identifier}"
        params = {'mode': 'json', 'limit': 500}
        
        try:
            logger.info(f"Trying Lever API: {api_url}")
            response = self.session.get(api_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"API Success. Parsing {len(data)} jobs...")
                for job_data in data:
                    job = self._parse_api_job(job_data)
                    if job: jobs.append(job)
                return jobs
            elif response.status_code == 404:
                logger.warning("Lever API returned 404 (Disabled). Switching to HTML scrape...")
            else:
                response.raise_for_status()
                
        except Exception as e:
            logger.error(f"API failed ({e}). Switching to HTML scrape...")

        # 2. Fallback to HTML Scraping
        if not jobs:
            jobs = self._scrape_html()
            
        logger.info(f"Total jobs scraped: {len(jobs)}")
        return jobs

    def _scrape_html(self) -> List[Dict]:
        """Scrape the public HTML career page directly."""
        jobs = []
        # Ensure we are hitting the public page, not the API
        target_url = self.base_url
        if "api.lever.co" in target_url:
            target_url = f"https://jobs.lever.co/{self.company_identifier}"
            
        try:
            logger.info(f"Scraping HTML page: {target_url}")
            response = self.session.get(target_url, timeout=20)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            postings = soup.find_all('div', class_='posting')
            
            logger.info(f"Found {len(postings)} job elements in HTML")
            
            for posting in postings:
                try:
                    job = self._parse_html_job(posting)
                    if job: jobs.append(job)
                except Exception as e:
                    continue
                    
        except Exception as e:
            logger.error(f"HTML scraping failed: {e}")
            
        return jobs
    
    # --- Parsers ---
    
    def _parse_api_job(self, job_data: Dict) -> Dict:
        """Parse JSON data from API."""
        categories = job_data.get('categories', {})
        location = categories.get('location', '')
        if not location:
            location = "Remote" if categories.get('commitment') == 'Remote' else "Unspecified"
            
        if not self._is_india_location(location):
            return None

        return {
            'title': job_data.get('text', 'Untitled'),
            'location': location,
            'apply_url': job_data.get('hostedUrl', ''),
            'job_id': job_data.get('id', ''),
            'department': categories.get('team', '') or categories.get('department', ''),
            'employment_type': categories.get('commitment', 'Full-time'),
            'description': job_data.get('descriptionPlain', 'See link'),
            'source': 'Lever'
        }

    def _parse_html_job(self, soup_element) -> Dict:
        """Parse a 'div.posting' HTML element."""
        # Title & URL
        title_elem = soup_element.find('a', class_='posting-title')
        if not title_elem: return None
        
        title_h5 = title_elem.find('h5', attrs={'data-qa': 'posting-name'})
        title = title_h5.text.strip() if title_h5 else title_elem.text.strip()
        apply_url = title_elem.get('href')
        
        # Metadata
        location_span = soup_element.find('span', class_='sort-by-location')
        location = location_span.text.strip() if location_span else "Unspecified"
        
        # Filter India
        if not self._is_india_location(location):
            return None
            
        team_span = soup_element.find('span', class_='sort-by-team')
        department = team_span.text.strip() if team_span else ""
        
        commit_span = soup_element.find('span', class_='sort-by-commitment')
        emp_type = commit_span.text.strip() if commit_span else "Full-time"
        
        job_id = apply_url.split('/')[-1] if apply_url else ""

        return {
            'title': title,
            'location': location,
            'apply_url': apply_url,
            'job_id': job_id,
            'department': department,
            'employment_type': emp_type,
            'description': f"Apply at {apply_url}", # HTML list doesn't have full desc
            'source': 'Lever'
        }

    def _is_india_location(self, location: str) -> bool:
        if not location: return False
        india_keywords = [
            'india', 'bangalore', 'bengaluru', 'hyderabad', 'mumbai', 
            'delhi', 'noida', 'gurgaon', 'gurugram', 'pune', 'chennai',
            'kolkata', 'ahmedabad', 'remote'
        ]
        return any(k in location.lower() for k in india_keywords)