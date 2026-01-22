"""
Custom scraper for Spotify Careers (Life at Spotify).
Spotify uses a custom platform for their careers site.
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging
import html
import json
import re

logger = logging.getLogger(__name__)


class SpotifyScraper(BaseJobScraper):
    """Custom scraper for Spotify Careers."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/html,application/xhtml+xml',
            'Origin': 'https://www.lifeatspotify.com',
            'Referer': 'https://www.lifeatspotify.com/jobs'
        })
        
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Spotify Careers."""
        jobs = []
        
        logger.info(f"Starting Spotify scrape...")
        
        # Try API first
        api_jobs = self._scrape_api()
        if api_jobs:
            jobs.extend(api_jobs)
        else:
            # Fallback to HTML
            jobs = self._scrape_html()
        
        logger.info(f"Total Spotify India jobs scraped: {len(jobs)}")
        return jobs
    
    def _scrape_api(self) -> List[Dict]:
        """Try to scrape from Spotify's API."""
        jobs = []
        page = 0
        page_size = 50
        max_pages = 10
        
        # Spotify API endpoint
        api_url = "https://www.lifeatspotify.com/api/jobs"
        
        while page < max_pages:
            try:
                params = {
                    'location': 'India',
                    'page': page,
                    'limit': page_size
                }
                
                response = self.session.get(api_url, params=params, timeout=30)
                
                if response.status_code != 200:
                    logger.info(f"Spotify API returned {response.status_code}")
                    break
                
                try:
                    data = response.json()
                except json.JSONDecodeError:
                    logger.info("Spotify API did not return JSON")
                    break
                
                job_listings = data.get('jobs', []) or data.get('results', []) or data.get('data', [])
                
                if not job_listings:
                    break
                
                for job_data in job_listings:
                    try:
                        job = self._parse_api_job(job_data)
                        if job:
                            jobs.append(job)
                    except Exception as e:
                        logger.error(f"Error parsing job: {e}")
                
                logger.info(f"Page {page}: Fetched {len(job_listings)} jobs (Total: {len(jobs)})")
                
                # Check if more pages
                if len(job_listings) < page_size:
                    break
                    
                page += 1
                time.sleep(0.5)
                
            except requests.RequestException as e:
                logger.error(f"Error fetching Spotify API: {e}")
                break
        
        return jobs
    
    def _parse_api_job(self, job_data: Dict) -> Dict:
        """Parse a Spotify job from API response."""
        # Location
        location = job_data.get('location', '') or job_data.get('locationName', '')
        
        # Filter for India
        if not self._is_eligible_location(location):
            return None
        
        # Job ID
        job_id = job_data.get('id', '') or job_data.get('jobId', '')
        
        # Title
        title = job_data.get('title', '') or job_data.get('name', 'Untitled Position')
        
        # Apply URL
        slug = job_data.get('slug', '') or job_data.get('url', '')
        if slug and not slug.startswith('http'):
            apply_url = f"https://www.lifeatspotify.com/jobs/{slug}"
        else:
            apply_url = slug or f"https://www.lifeatspotify.com/jobs?search={job_id}"
        
        # Department/Category
        category = job_data.get('category', '') or job_data.get('department', '') or job_data.get('team', '')
        
        # Employment Type
        employment_type = job_data.get('employmentType', 'Full-time') or 'Full-time'
        
        # Description
        description = job_data.get('description', '') or job_data.get('content', '')
        if description:
            description = BeautifulSoup(html.unescape(description), 'html.parser').get_text(separator='\n')
        else:
            description = 'Description available on apply page'
        
        return {
            'title': title,
            'location': location,
            'apply_url': apply_url,
            'job_id': str(job_id),
            'department': category,
            'employment_type': employment_type,
            'description': description,
            'source': 'Spotify'
        }
    
    def _scrape_html(self) -> List[Dict]:
        """Fallback HTML scraping for Spotify careers page."""
        jobs = []
        logger.info("Attempting Spotify HTML scrape...")
        
        try:
            html_url = "https://www.lifeatspotify.com/jobs"
            
            response = self.session.get(html_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for job data in scripts (Next.js/React apps store data here)
            scripts = soup.find_all('script', id='__NEXT_DATA__')
            
            for script in scripts:
                try:
                    if script.string:
                        data = json.loads(script.string)
                        
                        # Navigate to find jobs in the props
                        props = data.get('props', {})
                        page_props = props.get('pageProps', {})
                        
                        # Try various keys where jobs might be stored
                        job_list = (
                            page_props.get('jobs', []) or
                            page_props.get('initialJobs', []) or
                            page_props.get('allJobs', [])
                        )
                        
                        for job_data in job_list:
                            job = self._parse_html_job(job_data)
                            if job:
                                jobs.append(job)
                                
                except json.JSONDecodeError:
                    continue
            
            # Also try finding job links directly
            if not jobs:
                # Find job cards/links
                job_links = soup.find_all('a', href=re.compile(r'/jobs/'))
                
                seen_urls = set()
                for link in job_links:
                    try:
                        url = link.get('href', '')
                        if url in seen_urls or '/jobs' not in url:
                            continue
                        seen_urls.add(url)
                        
                        if not url.startswith('http'):
                            url = f"https://www.lifeatspotify.com{url}"
                        
                        # Find title
                        title_elem = link.find(['h2', 'h3', 'h4', 'span', 'p'])
                        if title_elem:
                            title = title_elem.get_text(strip=True)
                        else:
                            title = link.get_text(strip=True)
                        
                        if not title or len(title) < 3 or title.lower() in ['view job', 'apply', 'see all']:
                            continue
                        
                        # Location - try to find nearby
                        location = 'India'
                        location_elem = link.find_next(['span', 'p'], string=re.compile(r'India|Remote', re.I))
                        if location_elem:
                            location = location_elem.get_text(strip=True)
                        
                        if not self._is_eligible_location(location):
                            continue
                        
                        # Job ID from URL
                        job_id = url.split('/')[-1]
                        
                        jobs.append({
                            'title': title,
                            'location': location,
                            'apply_url': url,
                            'job_id': job_id,
                            'department': 'Spotify',
                            'employment_type': 'Full-time',
                            'description': 'Description available on apply page',
                            'source': 'Spotify'
                        })
                        
                    except Exception as e:
                        logger.debug(f"Error parsing link: {e}")
            
            logger.info(f"HTML scraping found {len(jobs)} jobs")
            
        except Exception as e:
            logger.error(f"HTML scraping error: {e}")
            
        return jobs
    
    def _parse_html_job(self, job_data: Dict) -> Dict:
        """Parse job data extracted from HTML/Next.js data."""
        # Location
        location = job_data.get('location', '') or job_data.get('locations', [''])[0] if isinstance(job_data.get('locations'), list) else ''
        
        # Filter for India
        if not self._is_eligible_location(location):
            return None
        
        # Job ID
        job_id = job_data.get('id', '') or job_data.get('slug', '')
        
        # Title
        title = job_data.get('title', '') or job_data.get('name', 'Untitled Position')
        
        # Apply URL
        slug = job_data.get('slug', '') or str(job_id)
        apply_url = f"https://www.lifeatspotify.com/jobs/{slug}"
        
        # Category
        category = job_data.get('category', '') or job_data.get('team', '')
        
        return {
            'title': title,
            'location': location,
            'apply_url': apply_url,
            'job_id': str(job_id),
            'department': category,
            'employment_type': 'Full-time',
            'description': job_data.get('description', 'Description available on apply page'),
            'source': 'Spotify'
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
