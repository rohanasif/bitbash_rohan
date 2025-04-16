from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import schedule
import time
import logging
from datetime import datetime
import os
import sys
from dotenv import load_dotenv
from backend.app import db, JobListing

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    filename='backend/scraper.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load environment variables
load_dotenv()

def setup_driver():
    """Set up and return a configured Chrome WebDriver."""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in headless mode
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def scrape_jobs():
    """Scrape jobs from actuarylist.com and save to database."""
    logging.info("Starting job scraping process")
    start_time = datetime.now()

    try:
        driver = setup_driver()
        driver.get("https://www.actuarylist.com/")

        # Wait for job listings to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "job-listing"))
        )

        # Get page source and parse with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        job_listings = soup.find_all('div', class_='job-listing')

        jobs_added = 0
        for job in job_listings:
            try:
                # Extract job details
                title = job.find('h2', class_='job-title').text.strip()
                company = job.find('div', class_='company-name').text.strip()
                location = job.find('div', class_='location').text.strip()
                description = job.find('div', class_='description').text.strip()
                salary = job.find('div', class_='salary').text.strip() if job.find('div', class_='salary') else None
                job_type = job.find('div', class_='job-type').text.strip() if job.find('div', class_='job-type') else None
                application_url = job.find('a', class_='apply-link')['href'] if job.find('a', class_='apply-link') else None

                # Check if job already exists
                existing_job = JobListing.query.filter_by(
                    title=title,
                    company=company,
                    location=location
                ).first()

                if not existing_job:
                    # Create new job listing
                    new_job = JobListing(
                        title=title,
                        company=company,
                        location=location,
                        description=description,
                        salary=salary,
                        job_type=job_type,
                        application_url=application_url,
                        source='scraper'
                    )
                    db.session.add(new_job)
                    jobs_added += 1

            except Exception as e:
                logging.error(f"Error processing job listing: {str(e)}")
                continue

        db.session.commit()
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()

        logging.info(f"Scraping completed. Added {jobs_added} new jobs. Duration: {duration} seconds")

    except Exception as e:
        logging.error(f"Error during scraping: {str(e)}")

    finally:
        driver.quit()

def run_scraper():
    """Run the scraper immediately and then schedule it to run every 3 minutes."""
    # Run immediately
    scrape_jobs()

    # Schedule to run every 3 minutes
    schedule.every(3).minutes.do(scrape_jobs)

    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    run_scraper()