from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from dotenv import load_dotenv
from datetime import datetime

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

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize Flask-SQLAlchemy and Flask-Migrate
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Models
class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    company = db.Column(db.String)
    location = db.Column(db.String)
    job_type = db.Column(db.String)
    tags = db.Column(db.Text)
    date_posted = db.Column(db.String)
    link = db.Column(db.String)
    logo = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'job_type': self.job_type,
            'tags': self.tags,
            'date_posted': self.date_posted or datetime.utcnow().strftime('%Y-%m-%d'),
            'link': self.link,
            'logo': self.logo,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Routes
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        # Get filter parameters
        location = request.args.get('location')
        company = request.args.get('company')
        job_type = request.args.get('job_type')

        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Build query
        query = Job.query
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))
        if company:
            query = query.filter(Job.company.ilike(f'%{company}%'))
        if job_type:
            query = query.filter(Job.job_type.ilike(f'%{job_type}%'))

        # Get total count for pagination
        total_jobs = query.count()

        # Calculate total pages
        total_pages = (total_jobs + per_page - 1) // per_page if total_jobs > 0 else 1

        # Ensure page is within valid range
        if page < 1:
            page = 1
        elif page > total_pages:
            page = total_pages

        # Apply pagination
        jobs = query.paginate(page=page, per_page=per_page)

        return jsonify({
            'jobs': [job.to_dict() for job in jobs.items],
            'pagination': {
                'total': total_jobs,
                'page': page,
                'per_page': per_page,
                'total_pages': total_pages
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['POST'])
def create_job():
    try:
        data = request.json
        current_time = datetime.utcnow()

        new_job = Job(
            title=data['title'],
            company=data['company'],
            location=data.get('location', ''),
            job_type=data.get('job_type', ''),
            tags=data.get('tags', ''),
            date_posted=data.get('date_posted', current_time.strftime('%Y-%m-%d')),
            link=data.get('link', ''),
            logo=data.get('logo', ''),
            created_at=current_time
        )
        db.session.add(new_job)
        db.session.commit()

        # Calculate which page this job will appear on
        per_page = 10  # Default page size
        total_jobs = Job.query.count()
        total_pages = (total_jobs + per_page - 1) // per_page if total_jobs > 0 else 1

        # The new job will be on the first page since we're not ordering by created_at anymore
        job_page = 1

        return jsonify({
            'job': new_job.to_dict(),
            'page': job_page,
            'total_pages': total_pages
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    try:
        job = Job.query.get(job_id)
        if job is None:
            return jsonify({'error': 'Job not found'}), 404
        db.session.delete(job)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)