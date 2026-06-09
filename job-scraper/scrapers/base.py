"""
Base scraper interface for all job scrapers.
Now integrates with JobNormalizer for schema compliance.
Experience extraction and description formatting are handled by regex utilities (no LLM).
"""

from abc import ABC, abstractmethod
from typing import List, Dict
import logging
from utils.normalizer import JobNormalizer

logger = logging.getLogger(__name__)

class BaseJobScraper(ABC):
    """Abstract base class for all job scrapers."""

    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        self.company_name = company_name
        self.base_url = base_url
        self.config = config or {}
        # NOTE: LLM enricher removed - using regex-based extraction in JobNormalizer

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

        # 2. Location eligibility check - REMOVED (Global Access)
        # Previously filtered for India-based or India-accessible remote jobs.
        # Now accepting all locations.
        return True
    
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

    def _matches_target_level(self, job: Dict) -> bool:
        """
        Check if job matches the configured SCRAPE_TARGET_LEVEL.
        Levels: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, ALL
        """
        import os
        target_level = os.getenv("SCRAPE_TARGET_LEVEL", "ALL").upper()
        logger.info(f"DEBUG: SCRAPE_TARGET_LEVEL = {target_level}")
        
        if target_level == "ALL":
            return True
            
        title = job.get("title", "").lower()
        if not title: 
            return False # Can't judge without title
            
        # Extract experience years if available (populated by JobNormalizer)
        exp_min = job.get("experience_min_years")
        
        # --- ENTRY LEVEL LOGIC ---
        if target_level == "ENTRY_LEVEL":
            # 1. Experience Check (if available) -> Max 3 years
            if exp_min is not None and exp_min > 3:
                return False
                
            # 2. Negative Keywords (Dealbreakers)
            if any(k in title for k in ["senior", "lead", "principal", "manager", "head", "director", "vp", "architect", "staff", "iii", "iv", "sr."]):
                return False
                
            # 3. Positive Keywords (Always include if no dealbreakers)
            if any(k in title for k in ["intern", "trainee", "fresher", "grad", "junior", "associate", "entry", "0-", "early"]):
                return True
                
            # Default for unknown titles: If it looks neutral (e.g. "Software Engineer"), allow it for now 
            # unless scraper is strictly only for identified early roles. 
            # Let's be slightly permissive but strict on experience if known.
            return True

        # --- MID LEVEL LOGIC ---
        elif target_level == "MID_LEVEL":
            # 1. Experience Check -> 3-5 years (approx)
            if exp_min is not None:
                if exp_min < 2 or exp_min > 6: # Buffer
                    return False
            
            # 2. Negative Keywords
            if any(k in title for k in ["intern", "trainee", "fresher", "director", "head", "vp", "chief", "principal"]):
                return False
                
            return True

        # --- SENIOR LEVEL LOGIC ---
        elif target_level == "SENIOR_LEVEL":
            # 1. Experience Check -> Min 5 years
            if exp_min is not None and exp_min < 4: # Buffer
                return False
                
            # 2. Positive Keywords (Strong signal)
            if any(k in title for k in ["senior", "lead", "principal", "architect", "staff", "manager", "head", "director", "sr."]):
                return True
                
            # 3. Negative Keywords
            if any(k in title for k in ["intern", "junior", "associate", "trainee", "entry"]):
                return False
                
            # If neutral title (e.g. "Software Engineer") but no experience data, 
            # we might default to excluded if we want STRICT senior only.
            # But usually "Senior" is explicit in title.
            return False

        return True

    def validate_job(self, job: Dict) -> bool:
        """
        Validate required fields only - no filtering by experience level.
        """
        required_fields = [
            "job_id",
            "company",
            "title",
            "description",
            "location",
            "apply_url",
            "job_type",       
            "employment_type" 
        ]

        # Check for missing or empty fields
        if not all(job.get(field) for field in required_fields):
            return False

        return True
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
                    # It also handles regex-based experience extraction and description formatting
                    job = JobNormalizer.normalize_job(raw_job)
                    
                    # Ensure company name matches the scraper
                    job["company"] = self.company_name

                    if self.validate_job(job):
                        normalized_jobs.append(job)
                    else:
                        logger.warning(f"Job validation failed for '{job.get('title')}': Missing fields or target level mismatch.")
                        # Debug: Print missing fields
                        required_fields = ["job_id", "company", "title", "description", "location", "apply_url", "job_type", "employment_type"]
                        missing = [f for f in required_fields if not job.get(f)]
                        if missing:
                            logger.warning(f"  -> Missing fields: {missing}")
                        if not self._matches_target_level(job):
                            logger.warning(f"  -> Failed target level check")

                except Exception as e:
                    logger.error(f"Error processing job: {e}")

            # Limit removed - return all valid jobs
            logger.info(
                f"Scraped {len(normalized_jobs)} valid jobs from {self.company_name}"
            )
            return normalized_jobs

        except Exception as e:
            logger.error(f"Scrape failed for {self.company_name}: {e}")
            return []