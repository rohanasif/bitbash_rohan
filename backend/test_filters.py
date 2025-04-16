from app import app, db, Job
from sqlalchemy import func

with app.app_context():
    print('Total jobs:', Job.query.count())
    print('Jobs with location containing "New York":', Job.query.filter(Job.location.ilike('%New York%')).count())

    # Check company values
    print('\nUnique company values (first 10):')
    companies = db.session.query(Job.company).distinct().limit(10).all()
    for company in companies:
        print(f"- {company[0]}")

    # Check job_type values
    print('\nUnique job_type values (first 10):')
    job_types = db.session.query(Job.job_type).distinct().limit(10).all()
    for job_type in job_types:
        print(f"- {job_type[0]}")

    # Check if there are any non-empty job_type values
    print('\nJobs with non-empty job_type:', Job.query.filter(Job.job_type != None, Job.job_type != '').count())

    # Print a few examples of jobs with non-empty job_type
    print('\nExample jobs with non-empty job_type:')
    for job in Job.query.filter(Job.job_type != None, Job.job_type != '').limit(3):
        print(f"- {job.title} at {job.company} with job_type: '{job.job_type}'")

    # Check job type statistics
    print('\nJob type statistics:')
    job_type_stats = db.session.query(Job.job_type, func.count(Job.id)).group_by(Job.job_type).all()
    for job_type, count in job_type_stats:
        print(f"- {job_type}: {count} jobs")

    # Print examples for each job type
    job_types = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship']
    for job_type in job_types:
        print(f"\nExample {job_type} jobs:")
        jobs = Job.query.filter(Job.job_type == job_type).limit(2).all()
        for job in jobs:
            print(f"- {job.title} at {job.company} in {job.location}")