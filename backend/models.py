from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from werkzeug.security import generate_password_hash, check_password_hash
import json

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default='user', nullable=False)  # 'user' or 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)

    incidents = relationship('Incident', back_populates='reporter', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Incident(Base):
    __tablename__ = 'incidents'

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # Flood, Earthquake, Fire, Cyclone, Landslide, Other
    predicted_category = Column(String(50), nullable=True)
    prediction_confidence = Column(Float, default=0.0)
    severity = Column(String(20), default='MEDIUM', nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    severity_score = Column(Float, default=50.0)
    severity_factors = Column(Text, nullable=True)  # JSON encoded factors breakdown
    
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_path = Column(String(255), nullable=True)
    
    # Status: 'Active', 'Under Review', 'Verified', 'Resolved'
    status = Column(String(30), default='Active', nullable=False)
    
    affected_people = Column(Integer, default=0)
    infrastructure_damage = Column(String(50), default='Moderate')  # None, Moderate, Severe, Catastrophic
    admin_notes = Column(Text, nullable=True)
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    reporter = relationship('User', back_populates='incidents')
    
    # Demo flag to transparently highlight synthetic/demo data
    is_demo = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        factors = {}
        if self.severity_factors:
            try:
                factors = json.loads(self.severity_factors)
            except Exception:
                factors = {}

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'predicted_category': self.predicted_category,
            'prediction_confidence': round(self.prediction_confidence, 2) if self.prediction_confidence else 0.0,
            'severity': self.severity,
            'severity_score': round(self.severity_score, 1) if self.severity_score else 50.0,
            'severity_factors': factors,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'image_path': self.image_path,
            'status': self.status,
            'affected_people': self.affected_people,
            'infrastructure_damage': self.infrastructure_damage,
            'admin_notes': self.admin_notes,
            'user_id': self.user_id,
            'reporter_name': self.reporter.name if self.reporter else 'Anonymous Citizen',
            'is_demo': bool(self.is_demo),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


def init_db(database_uri):
    engine = create_engine(database_uri, echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session, engine
