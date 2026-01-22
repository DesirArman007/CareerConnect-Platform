"""
Base scraper interface for all job scrapers.
Now integrates with JobNormalizer for schema compliance.
"""

from abc import ABC, abstractmethod
from typing import List, Dict
import logging
# Import the utility class we just built
# Ensure this matches your file name (normalizer.py vs job_normalizer.py)
from utils.normalizer import JobNormalizer 

logger = logging.getLogger(__name__)

class BaseJobScraper(ABC):
    """Abstract base class for all job scrapers."""

    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        self.company_name = company_name
        self.base_url = base_url
        self.config = config or {}

    @abstractmethod
    def scrape(self) -> List[Dict]:
        """
        Fetch raw job data from the source.
        Must return a list of raw job dictionaries.
        """
        pass

    # ---------------------------------------------------------
    # ❌ REMOVED: normalize_job() method
    # Reason: We now use the robust JobNormalizer utility class.
    # ---------------------------------------------------------

    def validate_job(self, job: Dict) -> bool:
        """
        Validate required fields and location eligibility for Indian applicants.
        Includes:
        - India-based locations (cities, states)
        - Global remote jobs (accessible to Indians)
        Excludes:
        - Remote jobs restricted to other countries (US-only, UK-only, etc.)
        """
        required_fields = [
            "job_id",
            "company",
            "title",
            "description",
            "location",
            "apply_url",
            "job_type",       # <--- Added (Critical for filters)
            "employment_type" # <--- Added
        ]

        # 1. Check for missing or empty fields
        if not all(job.get(field) for field in required_fields):
            return False

        # 2. Location eligibility check
        location = str(job.get("location", "")).lower()
        
        # Check if it's a remote job
        if self._is_remote_job(location):
            # Accept global remote, reject country-restricted remote
            return self._is_remote_accessible_to_india(location)
        
        # 3. India-based location check
        return self._is_india_location(location)
    
    def _is_remote_job(self, location: str) -> bool:
        """Check if location indicates a remote position."""
        remote_indicators = ['remote', 'work from home', 'wfh', 'anywhere', 'distributed']
        return any(indicator in location for indicator in remote_indicators)
    
    def _is_remote_accessible_to_india(self, location: str) -> bool:
        """
        Check if a remote job is accessible to Indian applicants.
        Accepts: Remote, Remote - Worldwide, Remote (APAC), Remote (India), etc.
        Rejects: Remote - US, Remote (United States), Remote - UK only, etc.
        """
        # Exclusion patterns - remote jobs restricted to other countries
        excluded_patterns = [
            'remote - us', 'remote (us)', 'remote us', 'remote - united states',
            'remote (united states)', 'us only', 'usa only', 'us-only',
            'remote - uk', 'remote (uk)', 'uk only', 'united kingdom only',
            'remote - canada', 'remote (canada)', 'canada only',
            'remote - australia', 'remote (australia)', 'australia only',
            'remote - europe', 'remote (europe)', 'europe only', 'eu only',
            'remote - germany', 'remote - france', 'remote - spain',
            'remote - americas', 'americas only', 'north america only',
            'remote - emea', 'emea only',
            'remote - latam', 'latam only',
            'us-based', 'uk-based', 'eu-based',
            'united states', 'california', 'new york', 'texas', 'washington',
            'san francisco', 'seattle', 'austin', 'boston', 'denver',
            'london', 'berlin', 'paris', 'toronto', 'sydney', 'melbourne'
        ]
        
        # Check for exclusion patterns
        if any(pattern in location for pattern in excluded_patterns):
            return False
        
        # Explicit inclusion patterns - definitely accessible to Indians
        included_patterns = [
            'india', 'apac', 'asia', 'worldwide', 'global', 'anywhere',
            'bangalore', 'bengaluru', 'mumbai', 'hyderabad', 'delhi',
            'chennai', 'pune', 'kolkata', 'gurgaon', 'noida'
        ]
        
        # If has India/APAC mention, definitely include
        if any(pattern in location for pattern in included_patterns):
            return True
        
        # Generic "Remote" without country restriction - include
        # (e.g., "Remote", "Fully Remote", "100% Remote")
        if location.strip() in ['remote', 'fully remote', '100% remote', 'remote work']:
            return True
            
        # If just "Remote" followed by nothing restrictive, include
        if location.startswith('remote') and len(location) < 20:
            return True
            
        return False
    
    def _is_india_location(self, location: str) -> bool:
        """Check if location is in India."""
        india_keywords = [
            "india", "bangalore", "bengaluru", "mumbai", "delhi",
            "hyderabad", "chennai", "pune", "kolkata", "gurgaon",
            "noida", "karnataka", "maharashtra", "tamil nadu", "haryana",
            "gurugram", "jaipur", "lucknow", "kochi", "thiruvananthapuram",
            "ahmedabad", "chandigarh", "indore", "bhopal", "nagpur",
            "coimbatore", "vadodara", "surat", "rajkot", "visakhapatnam"
        ]
        return any(keyword in location for keyword in india_keywords)

    def get_jobs(self) -> List[Dict]:
        """
        Full scraping pipeline:
        scrape (Raw) → JobNormalizer (Clean) → validate (Filter)
        """
        logger.info(f"Starting scrape for {self.company_name}")

        try:
            raw_jobs = self.scrape()
            normalized_jobs = []

            for raw_job in raw_jobs:
                try:
                    # ✅ USE THE NEW UTILITY CLASS
                    # This cleans HTML, fixes Enums, and adds timestamps
                    job = JobNormalizer.normalize_job(raw_job)
                    
                    # Ensure company name matches the scraper
                    job["company"] = self.company_name

                    if self.validate_job(job):
                        normalized_jobs.append(job)
                    else:
                        # Log why it failed (optional, keeps logs clean)
                        pass

                except Exception as e:
                    logger.error(f"Error processing job: {e}")

            logger.info(
                f"Scraped {len(normalized_jobs)} valid jobs from {self.company_name}"
            )
            return normalized_jobs

        except Exception as e:
            logger.error(f"Scrape failed for {self.company_name}: {e}")
            return []