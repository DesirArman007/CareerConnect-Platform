"""
Custom scraper for Uber Careers.
Uber uses a custom API for their careers site.
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging
import html
import json

logger = logging.getLogger(__name__)


class UberScraper(BaseJobScraper):
    """Custom scraper for Uber Careers."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://www.uber.com',
            'Referer': 'https://www.uber.com/us/en/careers/list/'
        })
        
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Uber Careers API."""
        jobs = []
        page = 1
        page_size = 50
        max_pages = 20
        
        # Uber's job search API
        api_url = "https://www.uber.com/api/loadSearchJobsResults"
        
        logger.info(f"Starting Uber scrape...")
        
        while page <= max_pages:
            try:
                # Uber uses query parameters
                params = {
                    'localeCode': 'en',
                    'location': 'India',
                    'page': page,
                    'pageSize': page_size
                }
                
                response = self.session.get(api_url, params=params, timeout=30)
                
                if response.status_code != 200:
                    # Try alternative API endpoint
                    logger.info("Trying alternative Uber API...")
                    jobs = self._scrape_html()
                    break
                    
                data = response.json()
                
                job_listings = data.get('data', {}).get('results', [])
                
                if not job_listings:
                    # If API returns empty, try HTML scraping
                    if page == 1:
                        logger.info("API empty, trying HTML fallback...")
                        jobs = self._scrape_html()
                    break
                
                for job_data in job_listings:
                    try:
                        job = self._parse_job(job_data)
                        if job:
                            jobs.append(job)
                    except Exception as e:
                        logger.error(f"Error parsing job: {e}")
                
                logger.info(f"Page {page}: Fetched {len(job_listings)} jobs (Total: {len(jobs)})")
                
                # Check pagination
                total_pages = data.get('data', {}).get('totalPages', 1)
                if page >= total_pages:
                    break
                    
                page += 1
                time.sleep(1)
                
            except requests.RequestException as e:
                logger.error(f"Error fetching Uber jobs: {e}")
                if page == 1:
                    jobs = self._scrape_html()
                break
        
        logger.info(f"Total Uber India jobs scraped: {len(jobs)}")
        return jobs
    
    def _parse_job(self, job_data: Dict) -> Dict:
        """Parse an Uber job posting."""
        # Location
        location = job_data.get('location', '') or job_data.get('locationName', '')
        
        # Filter for India
        if not self._is_eligible_location(location):
            return None
        
        # Job ID
        job_id = job_data.get('id', '') or job_data.get('jobId', '')
        
        # Title
        title = job_data.get('title', 'Untitled Position')
        
        # Apply URL
        slug = job_data.get('slug', '') or job_data.get('url', '')
        if slug and not slug.startswith('http'):
            apply_url = f"https://www.uber.com/us/en/careers/list/{slug}"
        else:
            apply_url = slug or f"https://www.uber.com/us/en/careers/list/?search={job_id}"
        
        # Department/Team
        team = job_data.get('team', '') or job_data.get('department', '')
        
        # Employment Type
        employment_type = job_data.get('employmentType', 'Full-time') or 'Full-time'
        
        # Description
        description = job_data.get('description', '') or job_data.get('summary', '')
        if description:
            description = BeautifulSoup(html.unescape(description), 'html.parser').get_text(separator='\n')
        else:
            description = 'Description available on apply page'
        
        return {
            'title': title,
            'location': location,
            'apply_url': apply_url,
            'job_id': str(job_id),
            'department': team,
            'employment_type': employment_type,
            'description': description,
            'source': 'Uber'
        }
    
    def _scrape_html(self) -> List[Dict]:
        """Fallback HTML scraping for Uber careers page."""
        jobs = []
        logger.info("Attempting Uber HTML scrape...")
        
        try:
            # Uber careers page for India
            html_url = "https://www.uber.com/in/en/careers/list/"
            
            response = self.session.get(html_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job cards - Uber uses React, so we look for data in scripts
            scripts = soup.find_all('script', type='application/json')
            
            for script in scripts:
                try:
                    data = json.loads(script.string) if script.string else {}
                    
                    # Look for job data in the script content
                    jobs_data = self._extract_jobs_from_json(data)
                    
                    for job_data in jobs_data:
                        job = self._parse_job(job_data)
                        if job:
                            jobs.append(job)
                            
                except json.JSONDecodeError:
                    continue
            
            # Also try finding job links directly
            if not jobs:
                job_links = soup.find_all('a', href=lambda h: h and '/careers/' in h and '/list/' not in h)
                
                for link in job_links[:50]:  # Limit
                    try:
                        url = link.get('href', '')
                        if not url.startswith('http'):
                            url = f"https://www.uber.com{url}"
                        
                        title_elem = link.find(['h3', 'h4', 'span']) or link
                        title = title_elem.get_text(strip=True)
                        
                        if not title or len(title) < 3:
                            continue
                        
                        # Job ID from URL
                        job_id = url.split('/')[-1]
                        
                        jobs.append({
                            'title': title,
                            'location': 'India',
                            'apply_url': url,
                            'job_id': job_id,
                            'department': 'Uber',
                            'employment_type': 'Full-time',
                            'description': 'Description available on apply page',
                            'source': 'Uber'
                        })
                        
                    except Exception as e:
                        logger.debug(f"Error parsing link: {e}")
            
            logger.info(f"HTML scraping found {len(jobs)} jobs")
            
        except Exception as e:
            logger.error(f"HTML scraping error: {e}")
            
        return jobs
    
    def _extract_jobs_from_json(self, data: dict, results: list = None) -> List[Dict]:
        """Recursively extract job data from JSON."""
        if results is None:
            results = []
            
        if isinstance(data, dict):
            # Check if this looks like a job
            if 'title' in data and ('jobId' in data or 'id' in data):
                results.append(data)
            else:
                for value in data.values():
                    self._extract_jobs_from_json(value, results)
                    
        elif isinstance(data, list):
            for item in data:
                self._extract_jobs_from_json(item, results)
                
        return results
    
    def _is_eligible_location(self, location: str) -> bool:
        """Check if location is in India."""
        if not location:
            return False
        
        india_keywords = [
            'india', 'bangalore', 'bengaluru', 'hyderabad', 'mumbai', 
            'delhi', 'noida', 'gurgaon', 'gurugram', 'pune', 'chennai',
            'kolkata', 'goa', 'ahmedabad', 'chandigarh'
        ]
        
        loc_lower = location.lower()
        return any(keyword in loc_lower for keyword in india_keywords)
