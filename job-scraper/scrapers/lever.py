"""
Lever ATS scraper.
Handles companies using Lever (e.g., Figma, Atlassian, Swiggy).
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging
import urllib.parse
import html
from utils.text_cleaner import clean_description

logger = logging.getLogger(__name__)


class LeverScraper(BaseJobScraper):
    """Scraper for Lever-based career sites."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        })
        
        # Extract company identifier from URL
        self.company_identifier = self._extract_company_id()
        logger.info(f"Lever ID extracted: {self.company_identifier}")
        
    def _extract_company_id(self) -> str:
        """Extract company identifier from base URL."""
        try:
            parsed = urllib.parse.urlparse(self.base_url)
            
            # Case 1: jobs.lever.co/company
            if 'jobs.lever.co' in parsed.netloc:
                path_parts = parsed.path.strip('/').split('/')
                if path_parts:
                    return path_parts[0]
            
            # Fallback: Use company name
            return self.company_name.lower().replace(' ', '')
        except:
            return self.company_name.lower().replace(' ', '')
    
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Lever API."""
        jobs = []
        max_jobs = 50  # Max jobs per company
        
        # Lever has a simple JSON API
        api_url = f"https://api.lever.co/v0/postings/{self.company_identifier}?mode=json"
        
        try:
            logger.info(f"Fetching from Lever API: {api_url}")
            response = self.session.get(api_url, timeout=30)
            
            if response.status_code == 404:
                logger.warning("Lever API not found, trying HTML fallback")
                return self._scrape_html()[:max_jobs]
                
            response.raise_for_status()
            job_listings = response.json()
            
            if not isinstance(job_listings, list):
                logger.warning("Unexpected API response format")
                return self._scrape_html()[:max_jobs]
            
            for job_data in job_listings:
                try:
                    job = self._parse_job(job_data)
                    if job:
                        jobs.append(job)
                        if len(jobs) >= max_jobs:
                            logger.info(f"Hit max job limit of {max_jobs}")
                            break
                except Exception as e:
                    logger.error(f"Error parsing job: {e}")
            
            logger.info(f"Fetched {len(jobs)} jobs from {self.company_name}")
            
        except requests.RequestException as e:
            logger.error(f"Error fetching Lever jobs: {e}")
            jobs = self._scrape_html()[:max_jobs]
            
        return jobs
    
    def _parse_job(self, job_data: Dict) -> Dict:
        """Parse a Lever job posting."""
        # Extract location safely
        location = job_data.get('categories', {}).get('location', '')
        
        # Filter for India 
        if not self._is_eligible_location(location):
            return None
        
        # Extract team/department
        team = job_data.get('categories', {}).get('team', '')
        department = job_data.get('categories', {}).get('department', '')
        dept_name = team or department or ''
        
        # Get description - Lever provides descriptionPlain or description (HTML)
        description = job_data.get('descriptionPlain', '')
        if not description:
            html_desc = job_data.get('description', '')
            if html_desc:
                description = clean_description(html_desc)
        
        # Also get lists (responsibilities, requirements)
        lists = job_data.get('lists', [])
        for lst in lists:
            list_name = lst.get('text', '')
            list_content = lst.get('content', '')
            if list_content:
                cleaned_list = clean_description(list_content)
                description += f"\n\n**{list_name}**\n{cleaned_list}"
        
        # Extract commitment (employment type)
        commitment = job_data.get('categories', {}).get('commitment', 'Full-time')
        
        return {
            'title': job_data.get('text', 'Untitled'),
            'location': location,
            'apply_url': job_data.get('hostedUrl', '') or job_data.get('applyUrl', ''),
            'job_id': job_data.get('id', ''),
            'department': dept_name,
            'employment_type': commitment,
            'description': description.strip() if description else 'Description available on apply page',
            'source': 'Lever'
        }
    
    def _is_eligible_location(self, location: str) -> bool:
        """Check if location is eligible."""
        # Returns True for ALL locations (Global scraping)
        return True

    def _scrape_html(self) -> List[Dict]:
        """Fallback HTML scraping method."""
        jobs = []
        logger.info("Attempting Lever HTML fallback scrape...")
        
        try:
            html_url = f"https://jobs.lever.co/{self.company_identifier}"
            response = self.session.get(html_url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job postings
            postings = soup.find_all('div', class_='posting')
            
            for posting in postings:
                try:
                    # Title and URL
                    title_link = posting.find('a', class_='posting-title')
                    if not title_link:
                        continue
                        
                    title = title_link.find('h5')
                    title_text = title.get_text(strip=True) if title else 'Untitled'
                    url = title_link.get('href', '')
                    
                    # Location
                    location_elem = posting.find('span', class_='sort-by-location')
                    location = location_elem.get_text(strip=True) if location_elem else ''
                    
                    if not self._is_eligible_location(location):
                        continue
                    
                    # Department
                    dept_elem = posting.find('span', class_='sort-by-team')
                    department = dept_elem.get_text(strip=True) if dept_elem else ''
                    
                    # Commitment
                    commit_elem = posting.find('span', class_='sort-by-commitment')
                    employment_type = commit_elem.get_text(strip=True) if commit_elem else 'Full-time'
                    
                    # Job ID from URL
                    job_id = url.split('/')[-1] if url else ''
                    
                    jobs.append({
                        'title': title_text,
                        'location': location,
                        'apply_url': url,
                        'job_id': job_id,
                        'department': department,
                        'employment_type': employment_type,
                        'description': 'Description available on apply page',
                        'source': 'Lever'
                    })
                    
                except Exception as e:
                    logger.debug(f"Error parsing posting: {e}")
                    
            logger.info(f"HTML scraping found {len(jobs)} jobs")
            
        except Exception as e:
            logger.error(f"HTML scraping error: {e}")
            
        return jobs
