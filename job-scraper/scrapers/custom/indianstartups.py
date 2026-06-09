
"""
Indian Startups Job Aggregator Scraper.
Currently focuses on YCombinator companies in India.
Former Instahyre/Cutshort logic has been moved to dedicated Selenium scrapers.
"""

import requests
import hashlib
import logging
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import re
import time
import random

logger = logging.getLogger(__name__)

class IndianStartupsScraper(BaseJobScraper):
    """
    Scraper for YCombinator (Work at a Startup), filtering for India.
    Previously handled Instahyre/Cutshort (now deprecated here).
    """
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def scrape(self) -> List[Dict]:
        """Scrape jobs from YCombinator."""
        # For legacy config reasons, if company_name is 'Indian Startups Aggregator', we just do YC
        # If it's specifically 'YCombinator', we do YC.
        return self._scrape_ycombinator_india()

    def _scrape_ycombinator_india(self) -> List[Dict]:
        """Scrape YCombinator companies hiring in India."""
        jobs = []
        url = "https://www.workatastartup.com/companies?locations=India"
        
        try:
            logger.info(f"Scraping YCombinator at {url}...")
            response = self.session.get(url, timeout=30)
            if response.status_code != 200:
                logger.warning(f"YC returned status {response.status_code}")
                return jobs
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # YC structure: Check for job or company cards
            # This logic is approximate as YC changes classes often
            job_divs = soup.find_all('div', class_=lambda c: c and 'company' in c)
            
            if not job_divs:
                # Fallback to finding generic blocks with text
                job_divs = soup.find_all('div', class_='mb-5')

            logger.info(f"YCombinator: Found {len(job_divs)} potential company blocks")
            
            for div in job_divs[:20]: # Limit to avoid flooding
                try:
                    name_elem = div.find(['h4', 'span'], text=True)
                    if not name_elem: continue
                    company = name_elem.get_text(strip=True)
                    
                    # Try to find specific roles listed under company
                    roles = div.find_all('div', class_=lambda c: c and 'job' in c)
                    
                    if roles:
                        for role in roles:
                            # Extract title and link
                            title_a = role.find('a')
                            if title_a:
                                title = title_a.get_text(strip=True)
                                job_url = title_a.get('href', '')
                                if job_url and not job_url.startswith('http'):
                                    job_url = f"https://www.workatastartup.com{job_url}"
                            else:
                                title = role.get_text(strip=True)
                                job_url = url
                                
                            self._add_job_with_detail(jobs, company, title, job_url)
                    else:
                        # Just list the company itself as having roles
                        self._add_job_with_detail(jobs, company, "Software Engineer (General)", url)
                        
                except Exception:
                    continue
                    
        except Exception as e:
            logger.error(f"YCombinator scrape failed: {e}")
        
        return jobs

    def _add_job_with_detail(self, jobs, company, title, url):
        description = 'See YCombinator Work at a Startup' # Default
        location = 'India'  # Default, will be overwritten if we find actual location
        
        # If we have a specific job URL (not just the main list URL), fetch it
        if url and "workatastartup.com/jobs/" in url:
            try:
                # Add delay to be polite
                time.sleep(random.uniform(1, 3))
                
                logger.debug(f"Fetching details for {title} at {company}...")
                resp = self.session.get(url, timeout=20)
                if resp.status_code == 200:
                    detail_soup = BeautifulSoup(resp.content, 'html.parser')
                    
                    # Try to find description in meta tag as analyzed
                    desc_meta = detail_soup.find('meta', property='og:description')
                    if not desc_meta:
                        desc_meta = detail_soup.find('meta', attrs={'name': 'description'})
                        
                    if desc_meta and desc_meta.get('content'):
                         description = desc_meta.get('content')
                    
                    # Extract actual location from the job detail page
                    location = self._extract_location(detail_soup, description)
                        
            except Exception as e:
                logger.warning(f"Failed to fetch detail for {title}: {e}")

        job_id = hashlib.md5(f"{company}|{title}".encode()).hexdigest()[:12]
        jobs.append({
            'job_id': job_id,
            'company': company,
            'title': title,
            'description': description,
            'location': location,
            'employment_type': 'Full-time',
            'apply_url': url,
            'source': 'YCombinator',
            'department': 'Engineering'
        })

    def _add_job(self, jobs, company, title, url):
         self._add_job_with_detail(jobs, company, title, url)

    def _extract_location(self, soup, description):
        """Extract actual location from job detail page."""
        # Try 1: Look for location in common page elements
        location_patterns = [
            soup.find('span', class_=lambda c: c and 'location' in c.lower() if c else False),
            soup.find('div', class_=lambda c: c and 'location' in c.lower() if c else False),
            soup.find('p', class_=lambda c: c and 'location' in c.lower() if c else False),
        ]
        
        for elem in location_patterns:
            if elem and elem.get_text(strip=True):
                return elem.get_text(strip=True)
        
        # Try 2: Look for location in meta tags
        loc_meta = soup.find('meta', attrs={'name': 'location'})
        if loc_meta and loc_meta.get('content'):
            return loc_meta.get('content')
        
        # Try 3: Check description for common location patterns
        if description:
            # Look for "Location: XYZ" or "Based in XYZ" patterns
            import re
            loc_match = re.search(r'(?:Location|Based in|Office)[:\s]+([A-Za-z\s,]+?)(?:\.|,|$)', description, re.IGNORECASE)
            if loc_match:
                return loc_match.group(1).strip()
            
            # Check if "Remote" is mentioned prominently
            if re.search(r'\bremote\b', description, re.IGNORECASE):
                return 'Remote'
        
        # Default fallback
        return 'India'

