from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
PORT = os.getenv("POSTGRES_PORT")

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{PORT}/{DB_NAME}"

# Create SQLAlchemy engine and session
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# Job model
class Job:
    def __init__(self, id, title, company, location, description, salary, job_type, url, tags):
        self.id = id
        self.title = title
        self.company = company
        self.location = location
        self.description = description
        self.salary = salary
        self.job_type = job_type
        self.url = url
        self.tags = tags

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'description': self.description,
            'salary': self.salary,
            'job_type': self.job_type,
            'url': self.url,
            'tags': self.tags
        }

# Routes
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    session = Session()
    try:
        # Get filter parameters
        location = request.args.get('location')
        company = request.args.get('company')
        job_type = request.args.get('job_type')

        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Build query
        query = session.query(Job)
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))
        if company:
            query = query.filter(Job.company.ilike(f'%{company}%'))
        if job_type:
            query = query.filter(Job.job_type == job_type)

        # Get total count for pagination
        total_jobs = query.count()

        # Apply pagination
        jobs = query.offset((page - 1) * per_page).limit(per_page).all()

        # Calculate total pages
        total_pages = (total_jobs + per_page - 1) // per_page

        return jsonify({
            'jobs': [job.to_dict() for job in jobs],
            'pagination': {
                'total': total_jobs,
                'page': page,
                'per_page': per_page,
                'total_pages': total_pages
            }
        })
    finally:
        session.close()

@app.route('/api/jobs', methods=['POST'])
def create_job():
    session = Session()
    try:
        data = request.json
        new_job = Job(
            id=None,  # Will be set by database
            title=data['title'],
            company=data['company'],
            location=data.get('location', ''),
            description=data.get('description', ''),
            salary=data.get('salary', ''),
            job_type=data.get('job_type', ''),
            url=data.get('url', ''),
            tags=data.get('tags', '')
        )
        session.add(new_job)
        session.commit()
        return jsonify(new_job.to_dict()), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    session = Session()
    try:
        job = session.query(Job).filter_by(id=job_id).first()
        if job is None:
            return jsonify({'error': 'Job not found'}), 404
        session.delete(job)
        session.commit()
        return '', 204
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()

if __name__ == '__main__':
    app.run(debug=True)