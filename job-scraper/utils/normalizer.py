import re
from typing import Dict, List, Optional
import logging
from datetime import datetime
from bs4 import BeautifulSoup 

logger = logging.getLogger(__name__)

class JobNormalizer:
    """
    Normalize and clean job data to match the MERN Job Schema.
    Ensures strict Enums for job_type and employment_type.
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

    @staticmethod
    def clean_html(html_text: str) -> str:
        """
        Robust cleaning using BeautifulSoup.
        Removes tags, scripts, styles, and fixes entities automatically.
        """
        if not html_text:
            return ""

        try:
            # 1. Parse HTML
            soup = BeautifulSoup(html_text, "html.parser")

            # 2. Remove script and style elements completely
            for script_or_style in soup(["script", "style"]):
                script_or_style.decompose()

            # 3. Get text and collapse whitespace
            text = soup.get_text(separator=" ", strip=True)

            # 4. Final cleanup of extra spaces
            return " ".join(text.split())
            
        except Exception as e:
            logger.error(f"Error cleaning HTML: {e}")
            return html_text # Fallback to raw text if BS4 fails

    # ---------------------------------------------------------
    # MAIN PIPELINE
    # ---------------------------------------------------------

    @staticmethod
    def normalize_job(raw_job: Dict) -> Dict:
        """
        Transform raw scraper data into a Schema-compliant dictionary.
        """
        normalized = {}
        
        # 1. Identity & Meta
        normalized["job_id"] = str(raw_job.get("job_id"))
        normalized["company"] = raw_job.get("company", "Unknown").strip()
        normalized["apply_url"] = raw_job.get("apply_url")
        normalized["source"] = raw_job.get("source", "Scraper")
        normalized["department"] = raw_job.get("department")

        # 2. Text Content
        raw_title = raw_job.get("title", "")
        normalized["title"] = " ".join(raw_title.split()) # Simple clean
        
        raw_desc = raw_job.get("description", "")
        normalized["description"] = JobNormalizer.clean_html(raw_desc)

        # 3. Location (Returns String now)
        normalized["location"] = JobNormalizer.normalize_location(raw_job.get("location"))

        # 4. Employment Type (Enum Enforcement)
        raw_emp_type = raw_job.get("employment_type", "")
        normalized["employment_type"] = JobNormalizer.normalize_employment_type(raw_emp_type)

        # 5. Job Type (New Field Calculation)
        normalized["job_type"] = JobNormalizer.derive_job_type(
            normalized["title"], 
            normalized["employment_type"]
        )

        # 6. Timestamps (For Upsert compatibility)
        # Note: In Python, use datetime.utcnow()
        normalized["last_seen"] = datetime.utcnow()
        # 'createdAt' is handled by $setOnInsert in your main loop

        return normalized