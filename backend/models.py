from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import declarative_base

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

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'tags': self.tags,
            'date_posted': self.date_posted,
            'link': self.link,
            'logo': self.logo
        }