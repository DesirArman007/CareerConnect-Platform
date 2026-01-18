"""
Clean Google Careers scraper.
Uses scroll-based pagination for React SPA.
Compatible with refactored BaseJobScraper.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time
import hashlib
from typing import List, Dict
from scrapers.base import BaseJobScraper
import logging

logger = logging.getLogger(__name__)


class GoogleScraper(BaseJobScraper):
    """Google Careers scraper using Selenium + infinite scroll."""

    def __init__(self, company_name: str, base_url: str, config: Dict = None):
        super().__init__(company_name, base_url, config)
        self.driver = None
        self.seen_job_ids = set()

    # -------------------------------------------------
    # Driver
    # -------------------------------------------------

    def _init_driver(self):
        from utils.browser import get_driver
        self.driver = get_driver(headless=True)

    # -------------------------------------------------
    # Public API
    # -------------------------------------------------

    def scrape(self) -> List[Dict]:
        jobs = []

        try:
            self._init_driver()

            # IMPORTANT: India filter MUST be present
            url = self.config.get(
                "url",
                "https://www.google.com/about/careers/applications/jobs/results/?location=India"
            )

            logger.info(f"Loading Google Careers page: {url}")
            self.driver.get(url)

            WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            time.sleep(6)  # allow React to render

            jobs = self._scroll_and_collect_jobs()

            logger.info(f"Scraped {len(jobs)} Google jobs")

        except Exception as e:
            logger.error(f"Google scraping failed: {e}", exc_info=True)

        finally:
            if self.driver:
                self.driver.quit()

        return jobs

    # -------------------------------------------------
    # Scroll-based pagination (CORRECT for Google)
    # -------------------------------------------------

    def _scroll_and_collect_jobs(self) -> List[Dict]:
        all_jobs = []
        stable_rounds = 0

        target_jobs = self.config.get("target_jobs", 300)
        max_stable_rounds = self.config.get("max_stable_rounds", 2)

        logger.info(f"Target Google jobs: {target_jobs}")

        while len(all_jobs) < target_jobs and stable_rounds < max_stable_rounds:
            visible_jobs = self._extract_visible_jobs()
            new_jobs = 0

            for job in visible_jobs:
                job_id = job.get("job_id")
                if job_id and job_id not in self.seen_job_ids:
                    self.seen_job_ids.add(job_id)
                    all_jobs.append(job)
                    new_jobs += 1

                    # Stop immediately if target reached
                    if len(all_jobs) >= target_jobs:
                        break

            if new_jobs == 0:
                stable_rounds += 1
                logger.info(
                    f"No new jobs found "
                    f"({stable_rounds}/{max_stable_rounds})"
                )
            else:
                stable_rounds = 0
                logger.info(f"Collected {len(all_jobs)} jobs so far")

            # Trigger lazy loading
            self.driver.execute_script(
                "window.scrollTo(0, document.body.scrollHeight);"
            )
            time.sleep(4)

        logger.info(
            f"Finished Google scraping: "
            f"{len(all_jobs)} jobs collected"
        )

        return all_jobs


    # -------------------------------------------------
    # Extraction
    # -------------------------------------------------

    def _extract_visible_jobs(self) -> List[Dict]:
        jobs = []

        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "h2"))
            )
        except TimeoutException:
            return jobs

        # Google keeps titles stable even when containers change
        title_elements = self.driver.find_elements(By.TAG_NAME, "h2")

        for title_elem in title_elements:
            try:
                container = title_elem.find_element(
                    By.XPATH,
                    "./ancestor::div[contains(@class,'VfPpkd') "
                    "or contains(@class,'job') "
                    "or contains(@class,'card') "
                    "or contains(@role,'listitem')]"
                )

                job = self._parse_job_card(container)
                if job:
                    jobs.append(job)

            except Exception:
                continue

        return jobs

    # -------------------------------------------------
    # Parsing
    # -------------------------------------------------

    def _parse_job_card(self, element) -> Dict | None:
        text = element.text.strip()
        if not text or len(text) < 10:
            return None

        # Title
        try:
            title = element.find_element(By.CSS_SELECTOR, "h2, h3").text.strip()
        except:
            title = text.split("\n")[0].strip()

        if not title or len(title) > 200:
            return None

        # Location
        location = self._extract_location(text)

        # Apply URL
        apply_url = ""
        try:
            link = element.find_element(By.TAG_NAME, "a")
            apply_url = link.get_attribute("href") or ""
        except:
            pass

        # Job ID
        job_id = self._generate_job_id(title, location, apply_url, text)

        if not apply_url:
            apply_url = (
                f"https://www.google.com/about/careers/applications/jobs/results/{job_id}"
            )

        return {
            "job_id": job_id,
            "title": title,
            "description": text[:500],
            "location": location,
            "apply_url": apply_url,
            "department": "",
            "employment_type": "Full-time",
            "source": "Google"
        }

    # -------------------------------------------------
    # Helpers
    # -------------------------------------------------

    def _extract_location(self, text: str) -> str:
        text_lower = text.lower()

        cities = [
            "bangalore", "bengaluru", "pune", "mumbai", "delhi",
            "hyderabad", "chennai", "kolkata", "gurgaon", "noida"
        ]

        for city in cities:
            if city in text_lower:
                return f"{city.title()}, India"

        if "india" in text_lower:
            return "India"

        return "Unknown Location"

    def _generate_job_id(self, title: str, location: str, url: str, text: str) -> str:
        if url and "/" in url:
            return url.split("/")[-1].split("?")[0]

        unique = f"{title}|{location}|{text[:100]}"
        return hashlib.md5(unique.encode()).hexdigest()[:12]
