
import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from scrapers.workday import WorkdayScraper

class TestWorkdayFiltering(unittest.TestCase):
    def setUp(self):
        self.scraper = WorkdayScraper("TestCompany", "https://example.com/wd/jobs")

    @patch('requests.Session.post')
    def test_job_filtering(self, mock_post):
        # Mock response data with 2 jobs:
        # Job 1: Has description (should be kept)
        # Job 2: No description (should be dropped)
        mock_response = {
            'jobPostings': [
                {
                    'title': 'Valid Job',
                    'locationsText': 'Bangalore, India',
                    'externalPath': '/job/123',
                    'bulletFields': ['This is a description']
                },
                {
                    'title': 'Invalid Job',
                    'locationsText': 'Bangalore, India', 
                    'externalPath': '/job/456',
                    'bulletFields': [] # Empty description
                }
            ]
        }
        
        mock_post.return_value.json.return_value = mock_response
        mock_post.return_value.status_code = 200
        
        # Run scrape
        jobs = self.scraper.scrape()
        
        # Verifications
        self.assertEqual(len(jobs), 1, "Should filter out the job with no description")
        self.assertEqual(jobs[0]['title'], "Valid Job")
        print("\nVerification PASSED: filtered 1 job with missing description.")

if __name__ == '__main__':
    unittest.main()
