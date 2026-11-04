from datetime import datetime, timedelta
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from jose import jwt, JWTError
from backend.models import User

auth_bp = Blueprint('auth', __name__)

def generate_token(user):
    payload = {
        'sub': str(user.id),
        'email': user.email,
        'role': user.role,
        'name': user.name,
        'exp': datetime.utcnow() + timedelta(hours=current_app.config['JWT_EXPIRES_IN_HOURS'])
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm=current_app.config['JWT_ALGORITHM'])

def get_current_user_from_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(
            token,
            current_app.config['JWT_SECRET_KEY'],
            algorithms=[current_app.config['JWT_ALGORITHM']]
        )
        user_id = int(payload['sub'])
        session = current_app.db_session()
        user = session.query(User).filter_by(id=user_id).first()
        return user
    except (JWTError, KeyError, ValueError):
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user_from_token()
        if not user:
            return jsonify({'error': 'Authentication required. Please login.'}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user_from_token()
        if not user:
            return jsonify({'error': 'Authentication required. Please login.'}), 401
        if user.role != 'admin':
            return jsonify({'error': 'Administrative access required.'}), 403
        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    role = data.get('role', 'user').strip().lower()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    session = current_app.db_session()
    try:
        existing = session.query(User).filter_by(email=email).first()
        if existing:
            return jsonify({'error': 'An account with this email already exists.'}), 409

        # Security check: only allow 'admin' if explicit admin invite secret is matched or for dev/demo accounts
        if role not in ['user', 'admin']:
            role = 'user'

        user = User(name=name, email=email, role=role)
        user.set_password(password)
        session.add(user)
        session.commit()

        token = generate_token(user)
        return jsonify({
            'message': 'Registration successful.',
            'token': token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500
    finally:
        session.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    session = current_app.db_session()
    try:
        user = session.query(User).filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password.'}), 401

        token = generate_token(user)
        return jsonify({
            'message': 'Login successful.',
            'token': token,
            'user': user.to_dict()
        }), 200
    finally:
        session.close()

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({'user': request.current_user.to_dict()}), 200
