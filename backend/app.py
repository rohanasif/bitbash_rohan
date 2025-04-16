from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

# Initialize database
db = SQLAlchemy(app)

# Job Listing Model
class JobListing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    salary = db.Column(db.String(100))
    job_type = db.Column(db.String(50))
    posted_date = db.Column(db.DateTime, default=datetime.utcnow)
    application_url = db.Column(db.String(500))
    source = db.Column(db.String(100), default='manual')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'description': self.description,
            'salary': self.salary,
            'job_type': self.job_type,
            'posted_date': self.posted_date.isoformat(),
            'application_url': self.application_url,
            'source': self.source
        }

# Create all database tables
with app.app_context():
    db.create_all()

# API Routes
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    # Get query parameters for filtering
    location = request.args.get('location')
    company = request.args.get('company')
    job_type = request.args.get('job_type')

    # Start with base query
    query = JobListing.query

    # Apply filters if provided
    if location:
        query = query.filter(JobListing.location.ilike(f'%{location}%'))
    if company:
        query = query.filter(JobListing.company.ilike(f'%{company}%'))
    if job_type:
        query = query.filter(JobListing.job_type == job_type)

    # Get all jobs and convert to dict
    jobs = query.order_by(JobListing.posted_date.desc()).all()
    return jsonify([job.to_dict() for job in jobs])

@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.json

    # Validate required fields
    required_fields = ['title', 'company', 'location', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Create new job listing
    new_job = JobListing(
        title=data['title'],
        company=data['company'],
        location=data['location'],
        description=data['description'],
        salary=data.get('salary'),
        job_type=data.get('job_type'),
        application_url=data.get('application_url'),
        source='manual'
    )

    # Save to database
    db.session.add(new_job)
    db.session.commit()

    return jsonify(new_job.to_dict()), 201

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = JobListing.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job listing deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)