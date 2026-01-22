"""
Wellfound (AngelList) Scraper for Indian Startup Jobs.
Scrapes startup jobs from Wellfound's public API.
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging
import json
import re

logger = logging.getLogger(__name__)


class WellfoundScraper(BaseJobScraper):
    """Scraper for Wellfound (AngelList) Indian startup jobs."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9'
        })
        
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Wellfound (AngelList)."""
        jobs = []
        page = 1
        max_pages = 20
        
        logger.info("Starting Wellfound (AngelList) India startup scrape...")
        
        while page <= max_pages:
            try:
                page_jobs = self._fetch_page(page)
                
                if not page_jobs:
                    logger.info(f"No more jobs found on page {page}")
                    break
                
                jobs.extend(page_jobs)
                logger.info(f"Page {page}: Found {len(page_jobs)} jobs (Total: {len(jobs)})")
                
                page += 1
                time.sleep(1)  # Rate limiting
                
            except Exception as e:
                logger.error(f"Error on page {page}: {e}")
                break
        
        logger.info(f"Total Wellfound India jobs scraped: {len(jobs)}")
        return jobs
    
    def _fetch_page(self, page: int) -> List[Dict]:
        """Fetch a page of jobs."""
        jobs = []
        
        # Wellfound/AngelList jobs page for India
        url = f"https://wellfound.com/role/l/software-engineer/india?page={page}"
        
        try:
            response = self.session.get(url, timeout=30)
            
            if response.status_code != 200:
                return jobs
            
            # Wellfound embeds job data in scripts
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find embedded JSON data
            scripts = soup.find_all('script', type='application/json')
            for script in scripts:
                if script.string:
                    try:
                        data = json.loads(script.string)
                        extracted = self._extract_jobs_from_data(data)
                        jobs.extend(extracted)
                    except:
                        continue
            
            # Also try finding job cards directly
            if not jobs:
                jobs = self._parse_html_jobs(soup)
                
        except Exception as e:
            logger.error(f"Error fetching page {page}: {e}")
        
        return jobs
    
    def _extract_jobs_from_data(self, data: dict, results: list = None) -> List[Dict]:
        """Recursively extract job data from JSON."""
        if results is None:
            results = []
        
        if isinstance(data, dict):
            # Check if this looks like a job
            if 'title' in data and ('companyName' in data or 'company' in data):
                job = self._parse_job_data(data)
                if job:
                    results.append(job)
            else:
                for value in data.values():
                    self._extract_jobs_from_data(value, results)
                    
        elif isinstance(data, list):
            for item in data:
                self._extract_jobs_from_data(item, results)
        
        return results
    
    def _parse_job_data(self, job_data: Dict) -> Dict:
        """Parse job from extracted data."""
        # Company
        company = job_data.get('companyName', '') or job_data.get('company', {}).get('name', '')
        if not company:
            return None
        
        # Location
        location = job_data.get('location', '') or job_data.get('locationNames', '')
        if isinstance(location, list):
            location = ', '.join(location)
        
        # Filter for India
        if not self._is_eligible_location(location):
            return None
        
        # Job ID
        job_id = job_data.get('id', '') or job_data.get('slug', '')
        
        # Title
        title = job_data.get('title', '') or job_data.get('jobTitle', '')
        if not title:
            return None
        
        # Apply URL
        slug = job_data.get('slug', '') or job_data.get('jobSlug', '')
        company_slug = job_data.get('companySlug', '') or job_data.get('company', {}).get('slug', '')
        
        if slug and company_slug:
            apply_url = f"https://wellfound.com/company/{company_slug}/jobs/{slug}"
        else:
            apply_url = f"https://wellfound.com/jobs/{job_id}"
        
        # Salary
        salary_min = job_data.get('salaryMin', '')
        salary_max = job_data.get('salaryMax', '')
        salary = f"{salary_min}-{salary_max}" if salary_min and salary_max else ''
        
        # Employment type
        employment_type = job_data.get('jobType', 'Full-time') or 'Full-time'
        
        return {
            'job_id': str(job_id),
            'company': company,
            'title': title,
            'description': job_data.get('description', 'Description available on apply page'),
            'location': location,
            'employment_type': employment_type,
            'apply_url': apply_url,
            'source': 'Wellfound',
            'department': job_data.get('role', 'Startup'),
            'salary': salary
        }
    
    def _parse_html_jobs(self, soup: BeautifulSoup) -> List[Dict]:
        """Parse jobs from HTML elements."""
        jobs = []
        
        # Find job cards
        job_cards = soup.find_all('div', class_=re.compile(r'job|styles_component'))
        
        for card in job_cards[:50]:  # Limit
            try:
                # Title
                title_elem = card.find(['h2', 'h3', 'a'], class_=re.compile(r'title|name'))
                if not title_elem:
                    continue
                title = title_elem.get_text(strip=True)
                
                if not title or len(title) < 3:
                    continue
                
                # Company
                company_elem = card.find(['span', 'a', 'div'], class_=re.compile(r'company|startup'))
                company = company_elem.get_text(strip=True) if company_elem else 'Startup'
                
                # Location
                loc_elem = card.find(['span', 'div'], class_=re.compile(r'location'))
                location = loc_elem.get_text(strip=True) if loc_elem else 'India'
                
                if not self._is_eligible_location(location):
                    continue
                
                # URL
                link = card.find('a', href=True)
                apply_url = link['href'] if link else ''
                if apply_url and not apply_url.startswith('http'):
                    apply_url = f"https://wellfound.com{apply_url}"
                
                # Job ID
                job_id = apply_url.split('/')[-1] if apply_url else title[:20]
                
                jobs.append({
                    'job_id': str(job_id),
                    'company': company,
                    'title': title,
                    'description': 'Description available on apply page',
                    'location': location,
                    'employment_type': 'Full-time',
                    'apply_url': apply_url,
                    'source': 'Wellfound',
                    'department': 'Startup'
                })
                
            except Exception as e:
                continue
        
        return jobs
    
    def _is_eligible_location(self, location: str) -> bool:
        """Check if location is in India."""
        if not location:
            return False
        
        india_keywords = [
            'india', 'bangalore', 'bengaluru', 'mumbai', 'delhi',
            'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon',
            'gurugram', 'noida', 'remote'
        ]
        
        loc_lower = location.lower()
        if loc_lower == 'remote':
            return True
        
        return any(keyword in loc_lower for keyword in india_keywords)
    
    # Override to preserve company from scrape (not from config)
    def get_jobs(self) -> List[Dict]:
        """Override to preserve company names from scraped data."""
        logger.info(f"Starting scrape for Indian Startups (Wellfound)")
        
        try:
            raw_jobs = self.scrape()
            # Skip the base class normalization that overwrites company
            return raw_jobs
        except Exception as e:
            logger.error(f"Scrape failed: {e}")
            return []
