from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from models import Job, Base

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

# Routes
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    session = Session()
    try:
        # Get filter parameters
        location = request.args.get('location')
        company = request.args.get('company')

        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Build query
        query = session.query(Job)
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))
        if company:
            query = query.filter(Job.company.ilike(f'%{company}%'))

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
            title=data['title'],
            company=data['company'],
            location=data.get('location', ''),
            tags=data.get('tags', ''),
            date_posted=data.get('date_posted', ''),
            link=data.get('link', ''),
            logo=data.get('logo', '')
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