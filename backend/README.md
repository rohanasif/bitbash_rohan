# Job Listings Backend

This is the backend service for the Job Listings application. It provides a RESTful API for managing job listings.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL database:

- Create a database named 'joblistings'
- Update the DATABASE_URL in .env file if your PostgreSQL credentials are different

4. Run the application:

```bash
flask run
```

The server will start at http://localhost:5000

## API Endpoints

- GET /api/jobs - Get all job listings
- POST /api/jobs - Create a new job listing
- DELETE /api/jobs/{id} - Delete a job listing

## Job Listing Schema

```json
{
  "title": "string",
  "company": "string",
  "location": "string",
  "description": "string",
  "salary": "string",
  "job_type": "string",
  "url": "string"
}
```
