import re
from typing import Dict, List, Optional
import logging
from datetime import datetime
from bs4 import BeautifulSoup

# Import new utilities
from utils.experience_extractor import ExperienceExtractor
from utils.description_formatter import DescriptionFormatter

logger = logging.getLogger(__name__)

class JobNormalizer:
    """
    Normalize and clean job data to match the MERN Job Schema.
    
    Now includes:
    - Experience extraction (regex-based, no LLM)
    - Description formatting (BeautifulSoup-based, no LLM)
    - Strict Enums for job_type and employment_type
    """
    
    # ---------------------------------------------------------
    # CONFIGURATION (Matches your jobEnums.js)
    # ---------------------------------------------------------
    
    EMPLOYMENT_TYPE_MAP = {
        # Full-time variations
        'full-time': 'Full-time', 'full time': 'Full-time', 'fulltime': 'Full-time', 'ft': 'Full-time',
        # Part-time variations
        'part-time': 'Part-time', 'part time': 'Part-time', 'parttime': 'Part-time', 'pt': 'Part-time',
        # Contract variations
        'contract': 'Contract', 'contractor': 'Contract', 'c2c': 'Contract',
        # Internship variations
        'intern': 'Internship', 'internship': 'Internship', 'trainee': 'Internship',
        # Temp
        'temporary': 'Temporary', 'temp': 'Temporary',
        # Freelance
        'freelance': 'Freelance'
    }

    # ---------------------------------------------------------
    # LOGIC HELPERS
    # ---------------------------------------------------------

    @staticmethod
    def derive_job_type(title: str, employment_type: str = "") -> str:
        """
        Derives 'job' or 'internship' based on title and type.
        Matches schema: job_type: { enum: ["job", "internship"] }
        """
        text = (str(title) + " " + str(employment_type)).lower()
        
        if "intern" in text or "trainee" in text:
            return "internship"
            
        return "job"  # Default

    @staticmethod
    def normalize_employment_type(text: str) -> str:
        """Returns standard Enum value or 'Full-time' as fallback."""
        if not text:
            return "Full-time"
        
        clean_text = text.lower().strip()
        # Check explicit map
        if clean_text in JobNormalizer.EMPLOYMENT_TYPE_MAP:
            return JobNormalizer.EMPLOYMENT_TYPE_MAP[clean_text]
            
        # Check partial matches
        for key, value in JobNormalizer.EMPLOYMENT_TYPE_MAP.items():
            if key in clean_text:
                return value
                
        return "Full-time"

    @staticmethod
    def normalize_location(location: str) -> str:
        """
        Cleans location string. 
        Schema expects String, not Dict.
        """
        if not location:
            return "Remote"
            
        # Basic cleanup
        clean_loc = " ".join(location.split())
        
        # Standardize "Remote"
        lower_loc = clean_loc.lower()
        if "remote" in lower_loc or "wfh" in lower_loc:
            return "Remote"
            
        return clean_loc

    # ---------------------------------------------------------
    # MAIN PIPELINE
    # ---------------------------------------------------------

    @staticmethod
    def normalize_job(raw_job: Dict) -> Dict:
        """
        Transform raw scraper data into a Schema-compliant dictionary.
        
        Now includes:
        - Formatted description (BeautifulSoup, no LLM)
        - Experience extraction (regex, no LLM)
        """
        normalized = {}
        
        # 1. Identity & Meta
        normalized["job_id"] = str(raw_job.get("job_id", ""))
        normalized["company"] = raw_job.get("company", "Unknown").strip()
        normalized["apply_url"] = raw_job.get("apply_url", "")
        normalized["source"] = raw_job.get("source", "Scraper")
        normalized["department"] = raw_job.get("department", "")

        # 2. Title
        raw_title = raw_job.get("title", "")
        normalized["title"] = " ".join(raw_title.split())  # Simple clean
        
        # 3. Description - Format using new utility (NO LLM)
        raw_desc = raw_job.get("description", "")
        normalized["description"] = DescriptionFormatter.format(raw_desc)

        # 4. Location
        normalized["location"] = JobNormalizer.normalize_location(raw_job.get("location"))

        # 5. Employment Type (Enum Enforcement)
        raw_emp_type = raw_job.get("employment_type", "")
        normalized["employment_type"] = JobNormalizer.normalize_employment_type(raw_emp_type)

        # 6. Job Type (job vs internship)
        normalized["job_type"] = JobNormalizer.derive_job_type(
            normalized["title"], 
            normalized["employment_type"]
        )

        # 7. Experience Extraction (NEW - regex-based, NO LLM)
        exp_result = ExperienceExtractor.extract(
            text=normalized["description"],
            title=normalized["title"]
        )
        
        # Store experience value if confidence is sufficient
        if exp_result.confidence >= 0.5:
            normalized["experience"] = exp_result.value
            normalized["experience_min_years"] = exp_result.min_years
            normalized["experience_max_years"] = exp_result.max_years
        else:
            normalized["experience"] = None
            normalized["experience_min_years"] = None
            normalized["experience_max_years"] = None

        # 8. Timestamps
        normalized["last_seen"] = datetime.utcnow()
        normalized["joblive"] = True
        # 'createdAt' is handled by $setOnInsert in MongoDB

        return normalized
