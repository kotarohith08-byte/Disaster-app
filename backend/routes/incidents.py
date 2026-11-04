import os
import io
import csv
import json
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, Response
from werkzeug.utils import secure_filename
from backend.models import Incident
from backend.routes.auth import get_current_user_from_token, admin_required

incidents_bp = Blueprint('incidents', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@incidents_bp.route('', methods=['GET'])
def get_incidents():
    session = current_app.db_session()
    try:
        query = session.query(Incident)

        category = request.args.get('category')
        if category and category.lower() != 'all':
            query = query.filter(Incident.category.ilike(category))

        severity = request.args.get('severity')
        if severity and severity.lower() != 'all':
            query = query.filter(Incident.severity == severity.upper())

        status = request.args.get('status')
        if status and status.lower() != 'all':
            query = query.filter(Incident.status.ilike(status))

        search = request.args.get('search')
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Incident.title.ilike(search_term)) |
                (Incident.description.ilike(search_term)) |
                (Incident.location.ilike(search_term))
            )

        # Order by newest first
        query = query.order_by(Incident.created_at.desc())

        limit = request.args.get('limit', type=int)
        if limit:
            query = query.limit(limit)

        incidents = query.all()
        return jsonify([inc.to_dict() for inc in incidents]), 200
    finally:
        session.close()

@incidents_bp.route('/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    session = current_app.db_session()
    try:
        incident = session.query(Incident).filter_by(id=incident_id).first()
        if not incident:
            return jsonify({'error': 'Incident not found.'}), 404

        data = incident.to_dict()
        # Attach real-time safety recommendations based on current category and severity
        engine = current_app.ml_engine
        data['safety_guidance'] = engine.get_recommendations(incident.category, incident.severity)
        return jsonify(data), 200
    finally:
        session.close()

@incidents_bp.route('', methods=['POST'])
def create_incident():
    # Support both JSON payload and multipart/form-data with image
    data = {}
    image_filename = None

    if request.is_json:
        data = request.get_json() or {}
    else:
        data = request.form.to_dict()
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                unique_name = f"{uuid.uuid4().hex}.{ext}"
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_name)
                os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
                file.save(save_path)
                image_filename = f"/uploads/{unique_name}"

    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    location = data.get('location', '').strip()

    if not title or not description or not location:
        return jsonify({'error': 'Title, description, and location are required.'}), 400

    try:
        latitude = float(data.get('latitude', 0.0))
        longitude = float(data.get('longitude', 0.0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Valid latitude and longitude are required.'}), 400

    # Latitude/longitude bounds validation
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        return jsonify({'error': 'Latitude must be between -90 and 90, Longitude between -180 and 180.'}), 400

    affected_people = 0
    try:
        affected_people = int(data.get('affected_people', 0))
    except (ValueError, TypeError):
        affected_people = 0

    infrastructure_damage = data.get('infrastructure_damage', 'Moderate')

    # AI Engine Classification & Severity
    engine = current_app.ml_engine
    ai_pred = engine.classify(description)
    predicted_category = ai_pred['category']
    prediction_confidence = ai_pred['confidence']

    # User may choose to provide or correct category, or adopt the predicted one
    user_category = data.get('category', '').strip()
    final_category = user_category if user_category else predicted_category

    # AI Severity assessment
    severity_eval = engine.assess_severity(
        text=description,
        category=final_category,
        affected_people=affected_people,
        infrastructure_damage=infrastructure_damage
    )

    # Optional manual override for severity if user specifies
    req_severity = data.get('severity', '').strip().upper()
    final_severity = req_severity if req_severity in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] else severity_eval['severity']

    # Check authentication (optional for community reporting)
    current_user = get_current_user_from_token()
    user_id = current_user.id if current_user else None

    session = current_app.db_session()
    try:
        incident = Incident(
            title=title,
            description=description,
            category=final_category,
            predicted_category=predicted_category,
            prediction_confidence=prediction_confidence,
            severity=final_severity,
            severity_score=severity_eval['severity_score'],
            severity_factors=json.dumps(severity_eval['factors']),
            location=location,
            latitude=latitude,
            longitude=longitude,
            image_path=image_filename or data.get('image_path'),
            status='Active',
            affected_people=affected_people,
            infrastructure_damage=infrastructure_damage,
            user_id=user_id,
            is_demo=0
        )
        session.add(incident)
        session.commit()

        result = incident.to_dict()
        result['safety_guidance'] = engine.get_recommendations(incident.category, incident.severity)
        return jsonify({
            'message': 'Disaster incident reported successfully.',
            'incident': result
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': f'Failed to submit incident: {str(e)}'}), 500
    finally:
        session.close()

@incidents_bp.route('/<int:incident_id>', methods=['PUT'])
def update_incident(incident_id):
    current_user = get_current_user_from_token()
    if not current_user:
        return jsonify({'error': 'Authentication required.'}), 401

    session = current_app.db_session()
    try:
        incident = session.query(Incident).filter_by(id=incident_id).first()
        if not incident:
            return jsonify({'error': 'Incident not found.'}), 404

        # Non-admins can only update incidents they created (and cannot verify/resolve unless admin)
        if current_user.role != 'admin' and incident.user_id != current_user.id:
            return jsonify({'error': 'You do not have permission to modify this incident.'}), 403

        data = request.get_json() or {}

        if 'title' in data:
            incident.title = data['title'].strip()
        if 'description' in data:
            incident.description = data['description'].strip()
        if 'category' in data:
            incident.category = data['category'].strip()
        if 'location' in data:
            incident.location = data['location'].strip()
        if 'latitude' in data:
            incident.latitude = float(data['latitude'])
        if 'longitude' in data:
            incident.longitude = float(data['longitude'])
        if 'affected_people' in data:
            incident.affected_people = int(data['affected_people'])
        if 'infrastructure_damage' in data:
            incident.infrastructure_damage = data['infrastructure_damage']

        # Admin specific controls: status, severity adjustment, admin notes
        if current_user.role == 'admin':
            if 'status' in data and data['status'] in ['Active', 'Under Review', 'Verified', 'Resolved']:
                incident.status = data['status']
            if 'severity' in data and data['severity'] in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
                incident.severity = data['severity']
            if 'admin_notes' in data:
                incident.admin_notes = data['admin_notes']

        incident.updated_at = datetime.utcnow()
        session.commit()

        return jsonify({
            'message': 'Incident updated successfully.',
            'incident': incident.to_dict()
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': f'Update failed: {str(e)}'}), 500
    finally:
        session.close()

@incidents_bp.route('/<int:incident_id>', methods=['DELETE'])
@admin_required
def delete_incident(incident_id):
    session = current_app.db_session()
    try:
        incident = session.query(Incident).filter_by(id=incident_id).first()
        if not incident:
            return jsonify({'error': 'Incident not found.'}), 404

        session.delete(incident)
        session.commit()
        return jsonify({'message': f'Incident #{incident_id} removed successfully.'}), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': f'Failed to delete incident: {str(e)}'}), 500
    finally:
        session.close()

@incidents_bp.route('/export/csv', methods=['GET'])
def export_csv():
    session = current_app.db_session()
    try:
        incidents = session.query(Incident).order_by(Incident.created_at.desc()).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            'ID', 'Title', 'Category', 'Predicted Category', 'Confidence (%)',
            'Severity', 'Severity Score', 'Location', 'Latitude', 'Longitude',
            'Status', 'Affected People', 'Infrastructure Damage', 'Is Demo', 'Created At'
        ])

        for inc in incidents:
            writer.writerow([
                inc.id,
                inc.title,
                inc.category,
                inc.predicted_category,
                inc.prediction_confidence,
                inc.severity,
                inc.severity_score,
                inc.location,
                inc.latitude,
                inc.longitude,
                inc.status,
                inc.affected_people,
                inc.infrastructure_damage,
                inc.is_demo,
                inc.created_at.strftime('%Y-%m-%d %H:%M:%S') if inc.created_at else ''
            ])

        output.seek(0)
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment;filename=disaster_incidents_report.csv"}
        )
    finally:
        session.close()
