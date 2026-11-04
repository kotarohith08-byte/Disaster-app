from flask import Blueprint, request, jsonify, current_app

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/classify', methods=['POST'])
def classify_incident():
    data = request.get_json() or {}
    description = data.get('description', '').strip()
    affected_people = data.get('affected_people', 0)
    infrastructure_damage = data.get('infrastructure_damage', 'Moderate')

    if not description:
        return jsonify({'error': 'Incident description is required for AI classification.'}), 400

    engine = current_app.ml_engine
    pred = engine.classify(description)
    predicted_cat = pred['category']
    confidence = pred['confidence']

    # Assess severity
    severity_eval = engine.assess_severity(
        text=description,
        category=predicted_cat,
        affected_people=affected_people,
        infrastructure_damage=infrastructure_damage
    )

    return jsonify({
        'predicted_category': predicted_cat,
        'confidence': confidence,
        'probabilities': pred['probabilities'],
        'model_used': pred['model_used'],
        'severity': severity_eval['severity'],
        'severity_score': severity_eval['severity_score'],
        'severity_factors': severity_eval['factors'],
        'recommendations': severity_eval['recommendations'],
        'disclaimer': (
            "NOTICE: Automated AI predictions are designed to provide rapid initial community awareness "
            "and assist response coordination. These predictions do not represent verified government or official disaster warnings."
        )
    }), 200

@ai_bp.route('/severity', methods=['POST'])
def evaluate_severity():
    data = request.get_json() or {}
    description = data.get('description', '').strip()
    category = data.get('category', 'Other')
    affected_people = data.get('affected_people', 0)
    infrastructure_damage = data.get('infrastructure_damage', 'Moderate')

    engine = current_app.ml_engine
    result = engine.assess_severity(
        text=description,
        category=category,
        affected_people=affected_people,
        infrastructure_damage=infrastructure_damage
    )

    return jsonify(result), 200

@ai_bp.route('/recommendations/<category>', methods=['GET'])
def get_category_recommendations(category):
    engine = current_app.ml_engine
    severity = request.args.get('severity', 'HIGH').upper()
    recs = engine.get_recommendations(category, severity)
    return jsonify({
        'category': category,
        'severity': severity,
        'recommendations': recs
    }), 200
