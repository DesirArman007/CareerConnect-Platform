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
        Validate required fields and India-based location.
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
            # Optional: Log which field is missing for debugging
            # missing = [f for f in required_fields if not job.get(f)]
            # logger.warning(f"Job missing fields: {missing}")
            return False

        # 2. India-only filter (Keep your existing logic)
        location = str(job.get("location", "")).lower()
        
        # If normalizer set it to "Remote", we might want to keep it 
        # OR perform strict checking if you ONLY want India-Remote.
        if location == "remote": 
            return True # Assume global remote is okay, or change to False
            
        india_keywords = [
            "india", "bangalore", "bengaluru", "mumbai", "delhi",
            "hyderabad", "chennai", "pune", "kolkata", "gurgaon",
            "noida", "karnataka", "maharashtra", "tamil nadu", "haryana"
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