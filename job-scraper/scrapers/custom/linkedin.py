"""
Advanced LinkedIn Guest Scraper (Deep Mode).
Features:
- Configurable via JSON (Keywords/Locations)
- Deep Scraping (Fetches Description, Job Type, Employment Type)
- Bypass Engine Renaming (Preserves real company names)
- Windows Compatible (No Emojis)
"""

from curl_cffi import requests
from bs4 import BeautifulSoup
import logging
import time
import random
import json
import os
from typing import List, Dict
from scrapers.base import BaseJobScraper

logger = logging.getLogger(__name__)

class LinkedInScraper(BaseJobScraper):
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        
        self.user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
        
        self.search_config = self._load_search_config()

    def _load_search_config(self) -> Dict:
        """Load keywords and locations from JSON file using absolute path."""
        # Calculate the correct path regardless of where the script runs
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(current_dir))
        config_path = os.path.join(project_root, "config", "linkedin_keywords.json")
        
        defaults = {"keywords": ["Software Engineer"], "locations": ["India"], "max_jobs_per_search": 25}
        
        try:
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    return json.load(f)
            else:
                logger.warning(f"Config file not found at: {config_path}")
                return defaults
        except Exception as e:
            logger.error(f"Error loading LinkedIn config: {e}")
            return defaults

    # ✅ CRITICAL: Bypass the parent class logic to preserve company names
    def get_jobs(self) -> List[Dict]:
        return self.scrape()

    def scrape(self) -> List[Dict]:
        """Scrape LinkedIn using loaded configuration."""
        jobs = []
        seen_ids = set()

        keywords = self.search_config.get('keywords', [])
        locations = self.search_config.get('locations', [])
        max_jobs = self.search_config.get('max_jobs_per_search', 25)
        
        logger.info(f"Loaded {len(keywords)} keywords and {len(locations)} locations.")
        
        for keyword in keywords:
            for loc in locations:
                logger.info(f"Scanning: '{keyword}' in '{loc}'...")
                
                start = 0
                while start < max_jobs:
                    try:
                        headers = {
                            'User-Agent': random.choice(self.user_agents),
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Referer': 'https://www.linkedin.com/'
                        }

                        # 1. Search List URL
                        url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={keyword}&location={loc}&start={start}"
                        
                        response = requests.get(url, headers=headers, impersonate="chrome", timeout=30)
                        
                        if response.status_code == 429:
                            logger.warning(f"Rate Limit (429) on {loc}. Pausing 60s...")
                            time.sleep(60)
                            break 
                        
                        if response.status_code != 200:
                            break 

                        soup = BeautifulSoup(response.text, 'html.parser')
                        job_cards = soup.find_all('li')
                        
                        if not job_cards:
                            break 
                        
                        new_found = 0
                        for card in job_cards:
                            # Parse basic info from card
                            basic_info = self._parse_card(card)
                            
                            if basic_info and basic_info['job_id'] not in seen_ids:
                                # -------------------------------------------
                                # ✅ DEEP SCRAPE: Fetch full details
                                # -------------------------------------------
                                details = self._get_job_details(basic_info['job_id'])
                                
                                # Merge basic info with deep details
                                full_job = {**basic_info, **details}
                                
                                seen_ids.add(full_job['job_id'])
                                jobs.append(full_job)
                                new_found += 1
                                logger.info(f"   -> [LINKEDIN] {full_job['title']} @ {full_job['company']}")
                                
                                # Sleep slightly between detail fetches to be safe
                                time.sleep(random.uniform(1, 3))
                        
                        if new_found == 0:
                            break 
                            
                        start += 25
                        time.sleep(random.uniform(3, 6))
                        
                    except Exception as e:
                        logger.error(f"Error: {e}")
                        break
            
            # Sleep longer between different Keywords
            time.sleep(random.uniform(5, 10))
                
        return jobs

    def _parse_card(self, card) -> Dict:
        """Parse the search result card (Basic Info)."""
        try:
            title_tag = card.find('h3', class_='base-search-card__title')
            title = title_tag.get_text(strip=True) if title_tag else "Untitled"
            
            company_tag = card.find('h4', class_='base-search-card__subtitle')
            company = company_tag.get_text(strip=True) if company_tag else "Unknown"
            
            loc_tag = card.find('span', class_='job-search-card__location')
            location = loc_tag.get_text(strip=True) if loc_tag else "India"
            
            link_tag = card.find('a', class_='base-card__full-link')
            if not link_tag: return None
            
            apply_url = link_tag['href'].split('?')[0]
            
            job_id = "0"
            if '-' in apply_url:
                job_id = apply_url.split('-')[-1]
            
            return {
                "title": title,
                "company": company,
                "job_id": job_id,
                "location": location,
                "apply_url": apply_url,
                "source": "LinkedIn"
            }
        except Exception:
            return None

    def _get_job_details(self, job_id: str) -> Dict:
        """
        Fetch the full job description and criteria from the guest API.
        Target URL: https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{id}
        """
        details = {
            "description": "See LinkedIn for details",
            "employment_type": "Full-time",
            "job_type": "job",
            "department": ""
        }
        
        try:
            url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
            headers = {'User-Agent': random.choice(self.user_agents)}
            
            resp = requests.get(url, headers=headers, impersonate="chrome", timeout=10)
            if resp.status_code != 200:
                return details
                
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            # 1. Get Full HTML Description
            desc_box = soup.find('div', class_='show-more-less-html__markup')
            if desc_box:
                # Convert HTML to clean text with spacing
                details['description'] = desc_box.get_text(separator='\n\n', strip=True)
            
            # 2. Get Criteria (Seniority, Employment Type, Function)
            criteria_list = soup.find('ul', class_='description__job-criteria-list')
            if criteria_list:
                items = criteria_list.find_all('li')
                for item in items:
                    header = item.find('h3')
                    val = item.find('span')
                    if header and val:
                        key = header.get_text(strip=True).lower()
                        value = val.get_text(strip=True)
                        
                        if 'employment' in key:
                            details['employment_type'] = value
                        elif 'function' in key:
                            details['department'] = value
                        elif 'seniority' in key and 'intern' in value.lower():
                            details['job_type'] = 'internship'

            # 3. Infer Job Type from Title if criteria failed
            if "intern" in details.get('description', '').lower() or "intern" in details.get('title', '').lower():
                 details['job_type'] = 'internship'
                 
        except Exception:
            pass
            
        return details