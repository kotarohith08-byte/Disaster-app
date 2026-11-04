import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'disaster-ai-super-secret-key-capstone-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'disaster-ai-jwt-secret-key-btech-2026')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRES_IN_HOURS = 24

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'disaster_ai.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

    # ML Model directory
    ML_MODEL_PATH = os.path.join(BASE_DIR, 'ml', 'model_artifacts.joblib')
    DATASET_PATH = os.path.join(BASE_DIR, 'ml', 'disaster_data.csv')
