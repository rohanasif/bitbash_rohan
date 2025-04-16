import time
import logging
import schedule
import psycopg2
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ---------- LOAD ENV ----------
load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
PORT = os.getenv("POSTGRES_PORT")
TARGET_URL = os.getenv("TARGET_URL")
SCRAPE_INTERVAL = int(os.getenv("SCRAPE_INTERVAL", 3))  # Default to 3 minutes if not set
RATE_LIMIT_DELAY = int(os.getenv("RATE_LIMIT_DELAY", 2))  # Default to 2 seconds if not set

# Use DATABASE_URL from env if available, otherwise construct it
DATABASE_URL = os.getenv("DATABASE_URL") or f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{PORT}/{DB_NAME}"
POSTGRES_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{PORT}/postgres"

# ---------- LOGGING ----------
logging.basicConfig(
    filename='scraper.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# ---------- CREATE DATABASE ----------
def create_database():
    try:
        conn = psycopg2.connect(POSTGRES_URL)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cur.fetchone()

        if not exists:
            cur.execute(f"CREATE DATABASE {DB_NAME}")
            logging.info(f"Database '{DB_NAME}' created.")
        else:
            logging.info(f"Database '{DB_NAME}' already exists.")

        cur.close()
        conn.close()
    except Exception as e:
        logging.error(f"Error creating DB: {e}")

# ---------- SQLALCHEMY TABLE ----------
Base = declarative_base()

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(Integer, primary_key=True)
    title = Column(String)
    company = Column(String)
    location = Column(String)
    tags = Column(Text)
    date_posted = Column(String)
    link = Column(String)
    logo = Column(String)

def create_tables():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    return engine

# ---------- SCRAPE JOBS ----------
def scrape_jobs():
    logging.info("Starting job scrape...")
    start_time = time.time()
    session = Session()

    try:
        options = Options()
        options.add_argument('--headless')
        driver = webdriver.Chrome(options=options)
        driver.get(TARGET_URL)

        total_jobs_scraped = 0
        page_number = 1

        while True:
            logging.info(f"Scraping page {page_number}...")

            wait = WebDriverWait(driver, 15)
            wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "Job_job-card__YgDAV")))

            job_cards = driver.find_elements(By.CLASS_NAME, "Job_job-card__YgDAV")
            logging.info(f"Found {len(job_cards)} job cards on page {page_number}.")

            count = 0
            for card in job_cards:
                try:
                    title = card.find_element(By.CLASS_NAME, "Job_job-card__position__ic1rc").text
                    company = card.find_element(By.CLASS_NAME, "Job_job-card__company__7T9qY").text
                    location_links = card.find_elements(By.CLASS_NAME, "Job_job-card__location__bq7jX")
                    locations = ", ".join([loc.text for loc in location_links])
                    tags = ", ".join([tag.text for tag in card.find_elements(By.CLASS_NAME, "Job_job-card__location__bq7jX")])
                    date_posted = card.find_element(By.CLASS_NAME, "Job_job-card__posted-on__NCZaJ").text
                    link = card.find_element(By.CLASS_NAME, "Job_job-page-link__a5I5g").get_attribute("href")
                    logo_img = card.find_element(By.TAG_NAME, "img").get_attribute("src")

                    full_link = f"https://www.actuarylist.com{link}" if link.startswith("/") else link

                    existing = session.query(Job).filter_by(title=title, company=company).first()
                    if existing:
                        continue

                    job = Job(
                        title=title,
                        company=company,
                        location=locations,
                        tags=tags,
                        date_posted=date_posted,
                        link=full_link,
                        logo=logo_img
                    )
                    session.add(job)
                    count += 1

                    # Commit after each job to ensure data is saved
                    session.commit()
                    logging.info(f"Saved job: {title} at {company}")

                except Exception as e:
                    logging.error(f"Error parsing job card: {e}")
                    continue

            total_jobs_scraped += count
            logging.info(f"Scraped {count} new jobs from page {page_number}.")

            # Try to find and click the Next button
            try:
                # Find the Next button using XPath that looks for a button with text "Next"
                next_button = driver.find_element(By.XPATH, "//button[text()='Next']")

                # Check if the button is disabled
                if next_button.get_attribute("disabled"):
                    logging.info("Reached the last page. No more jobs to scrape.")
                    break

                # Click the Next button
                next_button.click()
                page_number += 1

                # Wait for the page to load
                time.sleep(RATE_LIMIT_DELAY)

            except Exception as e:
                logging.info(f"No more pages to scrape: {e}")
                break

        driver.quit()
        logging.info(f"Scraped {total_jobs_scraped} new jobs in {round(time.time() - start_time, 2)} seconds.")

    except Exception as e:
        logging.error(f"Scraping failed: {e}")
    finally:
        session.close()

# ---------- SCHEDULER ----------
def start_scheduler():
    logging.info(f"Starting job scheduler (runs every {SCRAPE_INTERVAL} minutes)...")
    schedule.every(SCRAPE_INTERVAL).minutes.do(scrape_jobs)
    scrape_jobs()  # run immediately on startup

    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except Exception as e:
            logging.error(f"Scheduler error: {e}")
            logging.info("Restarting scheduler in 60 seconds...")
            time.sleep(60)  # Wait a minute before trying again

# ---------- MAIN ----------
if __name__ == "__main__":
    create_database()
    engine = create_tables()
    Session = sessionmaker(bind=engine)
    start_scheduler()
