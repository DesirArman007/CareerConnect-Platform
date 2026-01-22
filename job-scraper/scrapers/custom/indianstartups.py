"""
Indian Startups Job Aggregator Scraper.
Aggregates jobs from multiple Indian startup job sources:
- Instahyre
- Cutshort
- Naukri Startups
- YCombinator companies in India
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging
import json
import re
import hashlib

logger = logging.getLogger(__name__)


class IndianStartupsScraper(BaseJobScraper):
    """Aggregator scraper for Indian startup jobs from multiple sources."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9'
        })
        self.seen_jobs = set()
        
    def scrape(self) -> List[Dict]:
        """Aggregate jobs from multiple Indian startup sources."""
        all_jobs = []
        
        logger.info("Starting Indian Startups aggregator scrape...")
        
        # Scrape from each source
        sources = [
            ('Instahyre', self._scrape_instahyre),
            ('Cutshort', self._scrape_cutshort),
            ('YCombinator', self._scrape_ycombinator_india),
        ]
        
        for source_name, scrape_func in sources:
            try:
                logger.info(f"Scraping {source_name}...")
                jobs = scrape_func()
                
                # Deduplicate
                new_jobs = 0
                for job in jobs:
                    job_key = f"{job.get('title', '')}|{job.get('company', '')}".lower()
                    if job_key not in self.seen_jobs:
                        self.seen_jobs.add(job_key)
                        all_jobs.append(job)
                        new_jobs += 1
                
                logger.info(f"{source_name}: Found {new_jobs} unique jobs")
                
            except Exception as e:
                logger.error(f"Error scraping {source_name}: {e}")
        
        logger.info(f"Total Indian startup jobs aggregated: {len(all_jobs)}")
        return all_jobs
    
    # =========================================================================
    # Instahyre Scraper
    # =========================================================================
    
    def _scrape_instahyre(self) -> List[Dict]:
        """Scrape jobs from Instahyre."""
        jobs = []
        
        # Instahyre API/search endpoint
        url = "https://www.instahyre.com/api/v1/candidate/search/"
        
        try:
            # POST request with filters
            payload = {
                "experience": {"min": 0, "max": 15},
                "locations": [1, 2, 3, 4, 5, 6],  # Major Indian cities
                "job_type": ["full_time"],
                "offset": 0,
                "limit": 50
            }
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                job_listings = data.get('jobs', []) or data.get('results', [])
                
                for job_data in job_listings:
                    job = self._parse_instahyre_job(job_data)
                    if job:
                        jobs.append(job)
            else:
                # Fallback to HTML
                jobs = self._scrape_instahyre_html()
                
        except Exception as e:
            logger.debug(f"Instahyre API failed: {e}")
            jobs = self._scrape_instahyre_html()
        
        return jobs
    
    def _scrape_instahyre_html(self) -> List[Dict]:
        """Fallback HTML scraping for Instahyre."""
        jobs = []
        
        url = "https://www.instahyre.com/jobs/"
        
        try:
            response = self.session.get(url, timeout=30)
            if response.status_code != 200:
                return jobs
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job cards
            job_cards = soup.find_all('div', class_=re.compile(r'job-card|listing'))
            
            for card in job_cards[:30]:
                try:
                    title_elem = card.find(['h2', 'h3', 'a'])
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    
                    company_elem = card.find(class_=re.compile(r'company'))
                    company = company_elem.get_text(strip=True) if company_elem else 'Startup'
                    
                    link = card.find('a', href=True)
                    apply_url = link['href'] if link else ''
                    if apply_url and not apply_url.startswith('http'):
                        apply_url = f"https://www.instahyre.com{apply_url}"
                    
                    loc_elem = card.find(class_=re.compile(r'location'))
                    location = loc_elem.get_text(strip=True) if loc_elem else 'India'
                    
                    job_id = hashlib.md5(f"{title}|{company}".encode()).hexdigest()[:12]
                    
                    jobs.append({
                        'job_id': job_id,
                        'company': company,
                        'title': title,
                        'description': 'Description available on apply page',
                        'location': location,
                        'employment_type': 'Full-time',
                        'apply_url': apply_url,
                        'source': 'Instahyre',
                        'department': 'Startup'
                    })
                    
                except Exception:
                    continue
                    
        except Exception as e:
            logger.debug(f"Instahyre HTML failed: {e}")
        
        return jobs
    
    def _parse_instahyre_job(self, job_data: Dict) -> Dict:
        """Parse Instahyre job data."""
        company = job_data.get('company', {})
        company_name = company.get('name', '') if isinstance(company, dict) else str(company)
        
        if not company_name:
            return None
        
        location = job_data.get('location', '') or job_data.get('city', 'India')
        if isinstance(location, list):
            location = ', '.join(str(l) for l in location)
        
        job_id = job_data.get('id', '') or job_data.get('job_id', '')
        title = job_data.get('title', '') or job_data.get('job_title', '')
        
        if not title:
            return None
        
        slug = job_data.get('slug', '')
        apply_url = f"https://www.instahyre.com/job/{slug}/" if slug else ''
        
        return {
            'job_id': str(job_id) if job_id else hashlib.md5(f"{title}|{company_name}".encode()).hexdigest()[:12],
            'company': company_name,
            'title': title,
            'description': job_data.get('description', 'Description available on apply page'),
            'location': location,
            'employment_type': job_data.get('job_type', 'Full-time'),
            'apply_url': apply_url,
            'source': 'Instahyre',
            'department': job_data.get('function', 'Startup')
        }
    
    # =========================================================================
    # Cutshort Scraper
    # =========================================================================
    
    def _scrape_cutshort(self) -> List[Dict]:
        """Scrape jobs from Cutshort."""
        jobs = []
        
        url = "https://cutshort.io/jobs"
        
        try:
            response = self.session.get(url, timeout=30)
            if response.status_code != 200:
                return jobs
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find embedded data
            scripts = soup.find_all('script', type='application/json')
            for script in scripts:
                if script.string:
                    try:
                        data = json.loads(script.string)
                        extracted = self._extract_cutshort_jobs(data)
                        jobs.extend(extracted)
                    except:
                        continue
            
            # Fallback: parse HTML
            if not jobs:
                job_cards = soup.find_all(['div', 'article'], class_=re.compile(r'job|card|listing'))
                
                for card in job_cards[:30]:
                    try:
                        title_elem = card.find(['h2', 'h3', 'a'])
                        if not title_elem:
                            continue
                        
                        title = title_elem.get_text(strip=True)
                        
                        company_elem = card.find(class_=re.compile(r'company|org'))
                        company = company_elem.get_text(strip=True) if company_elem else 'Startup'
                        
                        link = card.find('a', href=True)
                        apply_url = link['href'] if link else ''
                        if apply_url and not apply_url.startswith('http'):
                            apply_url = f"https://cutshort.io{apply_url}"
                        
                        job_id = hashlib.md5(f"{title}|{company}".encode()).hexdigest()[:12]
                        
                        jobs.append({
                            'job_id': job_id,
                            'company': company,
                            'title': title,
                            'description': 'Description available on apply page',
                            'location': 'India',
                            'employment_type': 'Full-time',
                            'apply_url': apply_url,
                            'source': 'Cutshort',
                            'department': 'Startup'
                        })
                        
                    except Exception:
                        continue
                        
        except Exception as e:
            logger.debug(f"Cutshort scrape failed: {e}")
        
        return jobs
    
    def _extract_cutshort_jobs(self, data: dict, results: list = None) -> List[Dict]:
        """Extract jobs from Cutshort JSON data."""
        if results is None:
            results = []
        
        if isinstance(data, dict):
            if 'title' in data and ('company' in data or 'companyName' in data):
                company = data.get('company', {})
                company_name = company.get('name', '') if isinstance(company, dict) else data.get('companyName', 'Startup')
                
                results.append({
                    'job_id': str(data.get('id', ''))[:12] or hashlib.md5(data.get('title', '').encode()).hexdigest()[:12],
                    'company': company_name,
                    'title': data.get('title', ''),
                    'description': data.get('description', 'Description available on apply page'),
                    'location': data.get('location', 'India'),
                    'employment_type': 'Full-time',
                    'apply_url': data.get('url', '') or f"https://cutshort.io/job/{data.get('slug', '')}",
                    'source': 'Cutshort',
                    'department': 'Startup'
                })
            else:
                for value in data.values():
                    self._extract_cutshort_jobs(value, results)
                    
        elif isinstance(data, list):
            for item in data:
                self._extract_cutshort_jobs(item, results)
        
        return results
    
    # =========================================================================
    # YCombinator India Companies
    # =========================================================================
    
    def _scrape_ycombinator_india(self) -> List[Dict]:
        """Scrape YCombinator companies hiring in India."""
        jobs = []
        
        # YC Work at a Startup - India filter
        url = "https://www.workatastartup.com/companies?locations=India"
        
        try:
            response = self.session.get(url, timeout=30)
            if response.status_code != 200:
                return jobs
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find company/job cards
            cards = soup.find_all(['div', 'article'], class_=re.compile(r'company|job|startup'))
            
            for card in cards[:30]:
                try:
                    # Company name
                    company_elem = card.find(['h2', 'h3', 'a'], class_=re.compile(r'name|title'))
                    if not company_elem:
                        continue
                    company = company_elem.get_text(strip=True)
                    
                    # Job roles
                    role_elems = card.find_all(['span', 'div'], class_=re.compile(r'role|job|position'))
                    
                    for role_elem in role_elems[:3]:  # Limit roles per company
                        title = role_elem.get_text(strip=True)
                        if not title or len(title) < 3:
                            continue
                        
                        link = card.find('a', href=True)
                        apply_url = link['href'] if link else ''
                        if apply_url and not apply_url.startswith('http'):
                            apply_url = f"https://www.workatastartup.com{apply_url}"
                        
                        job_id = hashlib.md5(f"{title}|{company}".encode()).hexdigest()[:12]
                        
                        jobs.append({
                            'job_id': job_id,
                            'company': company,
                            'title': title,
                            'description': 'YCombinator startup - India',
                            'location': 'India',
                            'employment_type': 'Full-time',
                            'apply_url': apply_url,
                            'source': 'YCombinator',
                            'department': 'YC Startup'
                        })
                    
                    # If no specific roles, add general entry
                    if not role_elems:
                        link = card.find('a', href=True)
                        apply_url = link['href'] if link else ''
                        if apply_url and not apply_url.startswith('http'):
                            apply_url = f"https://www.workatastartup.com{apply_url}"
                        
                        job_id = hashlib.md5(f"Jobs|{company}".encode()).hexdigest()[:12]
                        
                        jobs.append({
                            'job_id': job_id,
                            'company': company,
                            'title': 'Multiple Positions',
                            'description': 'YCombinator startup hiring in India',
                            'location': 'India',
                            'employment_type': 'Full-time',
                            'apply_url': apply_url,
                            'source': 'YCombinator',
                            'department': 'YC Startup'
                        })
                        
                except Exception:
                    continue
                    
        except Exception as e:
            logger.debug(f"YCombinator scrape failed: {e}")
        
        return jobs
    
    # Override to preserve company from scrape
    def get_jobs(self) -> List[Dict]:
        """Override to preserve company names from scraped data."""
        logger.info(f"Starting Indian Startups aggregator")
        
        try:
            raw_jobs = self.scrape()
            return raw_jobs
        except Exception as e:
            logger.error(f"Scrape failed: {e}")
            return []
