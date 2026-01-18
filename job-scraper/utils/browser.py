"""
Browser utilities for Selenium-based scraping.
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import logging

logger = logging.getLogger(__name__)


def get_driver(headless: bool = True, disable_images: bool = True):
    """
    Create and configure a Chrome WebDriver instance.
    
    Args:
        headless: Run browser in headless mode
        disable_images: Disable image loading for faster scraping
        
    Returns:
        Configured WebDriver instance
    """
    options = Options()
    
    if headless:
        options.add_argument('--headless=new')
        
    # Performance optimizations
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-software-rasterizer')
    
    # Memory optimization
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--window-size=1920,1080')
    
    # Disable images to speed up loading
    if disable_images:
        prefs = {
            'profile.managed_default_content_settings.images': 2,
            'profile.default_content_setting_values': {
                'images': 2
            }
        }
        options.add_experimental_option('prefs', prefs)
    
    # User agent to avoid detection
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        
        logger.info("WebDriver initialized successfully")
        return driver
        
    except Exception as e:
        logger.error(f"Error initializing WebDriver: {e}")
        raise


def get_firefox_driver(headless: bool = True):
    """
    Alternative Firefox driver (lighter on resources).
    
    Args:
        headless: Run browser in headless mode
        
    Returns:
        Configured Firefox WebDriver
    """
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from selenium.webdriver.firefox.service import Service as FirefoxService
    from webdriver_manager.firefox import GeckoDriverManager
    
    options = FirefoxOptions()
    
    if headless:
        options.add_argument('--headless')
    
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-gpu')
    
    try:
        service = FirefoxService(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=options)
        
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        
        logger.info("Firefox WebDriver initialized")
        return driver
        
    except Exception as e:
        logger.error(f"Error initializing Firefox: {e}")
        raise