from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(Integer, primary_key=True)
    title = Column(String)
    company = Column(String)
    location = Column(String)
    job_type = Column(String)
    tags = Column(Text)
    date_posted = Column(String)
    link = Column(String)
    logo = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

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