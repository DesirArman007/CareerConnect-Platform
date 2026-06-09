"""
Ashby ATS scraper.
Handles companies using Ashby (e.g., Notion).
Ashby uses a GraphQL API for job listings.
"""

import requests
import time
from typing import List, Dict
from scrapers.base import BaseJobScraper
from bs4 import BeautifulSoup
import logging
import urllib.parse
import html
import json

logger = logging.getLogger(__name__)


class AshbyScraper(BaseJobScraper):
    """Scraper for Ashby-based career sites."""
    
    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        
        # Extract company identifier from URL
        self.company_identifier = self._extract_company_id()
        logger.info(f"Ashby ID extracted: {self.company_identifier}")
        
    def _extract_company_id(self) -> str:
        """Extract company identifier from base URL."""
        try:
            parsed = urllib.parse.urlparse(self.base_url)
            
            # Case 1: jobs.ashbyhq.com/company
            if 'jobs.ashbyhq.com' in parsed.netloc:
                path_parts = parsed.path.strip('/').split('/')
                if path_parts:
                    return path_parts[0]
            
            # Fallback: Use company name
            return self.company_name.lower().replace(' ', '')
        except:
            return self.company_name.lower().replace(' ', '')
    
    def scrape(self) -> List[Dict]:
        """Scrape jobs from Ashby GraphQL API."""
        jobs = []
        max_jobs = 50  # Max jobs per company
        
        # Ashby uses GraphQL API
        api_url = "https://jobs.ashbyhq.com/api/non-user-graphql"
        
        # GraphQL query for job listings
        query = """
        query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
          jobBoard: jobBoardWithTeams(
            organizationHostedJobsPageName: $organizationHostedJobsPageName
          ) {
            teams {
              id
              name
              parentTeamId
              __typename
            }
            jobPostings {
              id
              title
              teamId
              locationId
              locationName
              employmentType
              secondaryLocations {
                locationId
                locationName
                __typename
              }
              compensationTierSummary
              __typename
            }
            __typename
          }
        }
        """
        
        payload = {
            "operationName": "ApiJobBoardWithTeams",
            "variables": {
                "organizationHostedJobsPageName": self.company_identifier
            },
            "query": query
        }
        
        try:
            logger.info(f"Fetching from Ashby GraphQL API for {self.company_identifier}")
            response = self.session.post(api_url, json=payload, timeout=30)
            
            if response.status_code != 200:
                logger.warning(f"Ashby API returned status {response.status_code}, trying HTML fallback")
                return self._scrape_html()[:max_jobs]
                
            data = response.json()
            
            job_board = data.get('data', {}).get('jobBoard', {})
            job_postings = job_board.get('jobPostings', [])
            teams = {t['id']: t['name'] for t in job_board.get('teams', [])}
            
            for job_data in job_postings:
                try:
                    job = self._parse_job(job_data, teams)
                    if job:
                        jobs.append(job)
                        if len(jobs) >= max_jobs:
                            logger.info(f"Hit max job limit of {max_jobs}")
                            break
                except Exception as e:
                    logger.error(f"Error parsing job: {e}")
            
            logger.info(f"Fetched {len(jobs)} jobs from {self.company_name}")
            
        except requests.RequestException as e:
            logger.error(f"Error fetching Ashby jobs: {e}")
            jobs = self._scrape_html()[:max_jobs]
            
        return jobs
    
    def _parse_job(self, job_data: Dict, teams: Dict) -> Dict:
        """Parse an Ashby job posting."""
        # Extract location
        location = job_data.get('locationName', '')
        
        # Also check secondary locations
        secondary_locs = job_data.get('secondaryLocations', [])
        all_locations = [location] + [loc.get('locationName', '') for loc in secondary_locs]
        
        # Check if any location is in India
        india_location = None
        for loc in all_locations:
            if self._is_eligible_location(loc):
                india_location = loc
                break
        
        if not india_location:
            return None
        
        # Get team/department name
        team_id = job_data.get('teamId')
        department = teams.get(team_id, '') if team_id else ''
        
        # Employment type
        employment_type = job_data.get('employmentType', 'FullTime')
        # Normalize employment type
        employment_type_map = {
            'FullTime': 'Full-time',
            'PartTime': 'Part-time',
            'Contract': 'Contract',
            'Intern': 'Internship',
            'Temporary': 'Temporary'
        }
        employment_type = employment_type_map.get(employment_type, employment_type)
        
        # Build apply URL
        job_id = job_data.get('id', '')
        apply_url = f"https://jobs.ashbyhq.com/{self.company_identifier}/{job_id}"
        
        return {
            'title': job_data.get('title', 'Untitled'),
            'location': india_location,
            'apply_url': apply_url,
            'job_id': job_id,
            'department': department,
            'employment_type': employment_type,
            'description': self._fetch_job_description(job_id),
            'source': 'Ashby'
        }
    
    def _fetch_job_description(self, job_id: str) -> str:
        """Fetch full job description for a specific job."""
        try:
            # GraphQL query for job details
            query = """
            query ApiJobPosting($organizationHostedJobsPageName: String!, $jobPostingId: String!) {
              jobPosting(
                organizationHostedJobsPageName: $organizationHostedJobsPageName
                jobPostingId: $jobPostingId
              ) {
                id
                title
                descriptionHtml
                __typename
              }
            }
            """
            
            payload = {
                "operationName": "ApiJobPosting",
                "variables": {
                    "organizationHostedJobsPageName": self.company_identifier,
                    "jobPostingId": job_id
                },
                "query": query
            }
            
            api_url = "https://jobs.ashbyhq.com/api/non-user-graphql"
            response = self.session.post(api_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                html_desc = data.get('data', {}).get('jobPosting', {}).get('descriptionHtml', '')
                if html_desc:
                    # Convert HTML to clean text
                    text = BeautifulSoup(html.unescape(html_desc), 'html.parser').get_text(separator='\n')
                    clean_lines = [line.strip() for line in text.splitlines() if line.strip()]
                    return '\n\n'.join(clean_lines)
            
            time.sleep(0.5)  # Rate limiting
            
        except Exception as e:
            logger.debug(f"Error fetching description for job {job_id}: {e}")
        
        return 'Description available on apply page'
    
    def _is_eligible_location(self, location: str) -> bool:
        """Check if location is eligible."""
        # Returns True for ALL locations (Global scraping)
        return True

    def _scrape_html(self) -> List[Dict]:
        """Fallback HTML scraping method."""
        jobs = []
        logger.info("Attempting Ashby HTML fallback scrape...")
        
        try:
            html_url = f"https://jobs.ashbyhq.com/{self.company_identifier}"
            response = self.session.get(html_url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job postings - Ashby uses data attributes
            postings = soup.find_all('a', {'data-ashby-job-posting-id': True})
            
            for posting in postings:
                try:
                    job_id = posting.get('data-ashby-job-posting-id', '')
                    url = posting.get('href', '')
                    
                    if url and not url.startswith('http'):
                        url = f"https://jobs.ashbyhq.com{url}"
                    
                    # Title
                    title_elem = posting.find('h3') or posting.find('span')
                    title = title_elem.get_text(strip=True) if title_elem else 'Untitled'
                    
                    # Location - usually in a separate element
                    location_elem = posting.find('p') or posting.find_next_sibling()
                    location = location_elem.get_text(strip=True) if location_elem else ''
                    
                    if not self._is_eligible_location(location):
                        continue
                    
                    jobs.append({
                        'title': title,
                        'location': location,
                        'apply_url': url,
                        'job_id': job_id,
                        'department': '',
                        'employment_type': 'Full-time',
                        'description': 'Description available on apply page',
                        'source': 'Ashby'
                    })
                    
                except Exception as e:
                    logger.debug(f"Error parsing posting: {e}")
                    
            logger.info(f"HTML scraping found {len(jobs)} jobs")
            
        except Exception as e:
            logger.error(f"HTML scraping error: {e}")
            
        return jobs
