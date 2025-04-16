# Job Listings Web Application

A full-stack web application for managing job listings, built with Flask, React, and PostgreSQL.

## Backend Setup

### Prerequisites

- Python 3.8 or higher
- PostgreSQL
- Chrome browser (for Selenium scraping)

### Installation

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Set up PostgreSQL database:

```bash
createdb job_listings
```

4. Configure environment variables:

- Copy `.env.example` to `.env`
- Update the database URL and secret key in `.env`

### Running the Backend

1. Start the Flask server (from the project root):

```bash
flask run
```

2. Start the job scraper (from the project root):

```bash
python backend/scraper.py
```

The backend will be available at `http://localhost:5000`

## API Endpoints

### GET /api/jobs

- Fetch all job listings
- Query parameters:
  - location: Filter by location
  - company: Filter by company
  - job_type: Filter by job type

### POST /api/jobs

- Add a new job listing
- Required fields:
  - title
  - company
  - location
  - description

### DELETE /api/jobs/{id}

- Delete a specific job listing

## Features

- RESTful API with Flask
- PostgreSQL database with SQLAlchemy ORM
- Automated job scraping with Selenium
- Scheduled scraping every 3 minutes
- Comprehensive logging system
- CORS enabled for frontend integration

## Logging

The scraper logs are stored in `backend/scraper.log` and include:

- Start and end times
- Number of jobs scraped
- Errors and exceptions
- Scraping duration
