import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from backend.config import Config
from backend.models import init_db
from backend.ml.disaster_classifier import DisasterAIEngine

def create_app(config_class=Config):
    # Frontend build directory
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

    app = Flask(__name__, static_folder=frontend_dist, static_url_path='')
    app.config.from_object(config_class)

    # Enable CORS for all frontend origins
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Ensure uploads directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize SQLAlchemy database
    Session, engine = init_db(app.config['SQLALCHEMY_DATABASE_URI'])
    app.db_session = Session
    app.db_engine = engine

    # Initialize and attach ML Engine
    app.ml_engine = DisasterAIEngine(app.config['ML_MODEL_PATH'])

    # Register Blueprints
    from backend.routes.auth import auth_bp
    from backend.routes.incidents import incidents_bp
    from backend.routes.ai import ai_bp
    from backend.routes.analytics import analytics_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(incidents_bp, url_prefix='/api/incidents')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'project': 'DisasterAI - Intelligent Disaster Response & Management System',
            'ml_model_loaded': app.ml_engine.pipeline is not None,
            'ml_model_classes': app.ml_engine.classes,
            'version': '1.0.0-capstone'
        }), 200

    # Serve React SPA in production / standalone mode
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({
            'message': 'DisasterAI REST API is active. Frontend build not found in frontend/dist.',
            'docs': '/api/health'
        }), 200

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[*] Starting DisasterAI backend on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
