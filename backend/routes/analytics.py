from collections import defaultdict
from datetime import datetime
from flask import Blueprint, jsonify, current_app
from sqlalchemy import func
from backend.models import Incident

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('', methods=['GET'])
def get_analytics():
    session = current_app.db_session()
    try:
        total = session.query(Incident).count()
        active = session.query(Incident).filter(Incident.status.in_(['Active', 'Under Review'])).count()
        critical = session.query(Incident).filter_by(severity='CRITICAL').count()
        resolved = session.query(Incident).filter_by(status='Resolved').count()
        verified = session.query(Incident).filter_by(status='Verified').count()

        # Category distribution
        categories = ['Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Other']
        cat_counts = (
            session.query(Incident.category, func.count(Incident.id))
            .group_by(Incident.category)
            .all()
        )
        cat_map = {c: 0 for c in categories}
        for cat, cnt in cat_counts:
            cat_map[cat] = cnt
        category_distribution = [{'name': k, 'count': v} for k, v in cat_map.items()]

        # Severity distribution
        sev_counts = (
            session.query(Incident.severity, func.count(Incident.id))
            .group_by(Incident.severity)
            .all()
        )
        sev_colors = {
            'CRITICAL': '#ef4444',
            'HIGH': '#f97316',
            'MEDIUM': '#eab308',
            'LOW': '#3b82f6'
        }
        sev_map = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0}
        for sev, cnt in sev_counts:
            if sev in sev_map:
                sev_map[sev] = cnt
        severity_distribution = [
            {'name': k, 'count': v, 'color': sev_colors.get(k, '#94a3b8')}
            for k, v in sev_map.items()
        ]

        # Status distribution
        stat_counts = (
            session.query(Incident.status, func.count(Incident.id))
            .group_by(Incident.status)
            .all()
        )
        status_distribution = [{'name': stat, 'count': cnt} for stat, cnt in stat_counts]

        # Monthly trends (last 6-12 months aggregation)
        all_incidents = session.query(Incident.created_at, Incident.status).all()
        month_buckets = defaultdict(lambda: {'total': 0, 'resolved': 0, 'active': 0})
        for inc_date, inc_status in all_incidents:
            if inc_date:
                m_key = inc_date.strftime('%b %Y')
            else:
                m_key = datetime.utcnow().strftime('%b %Y')
            month_buckets[m_key]['total'] += 1
            if inc_status == 'Resolved':
                month_buckets[m_key]['resolved'] += 1
            else:
                month_buckets[m_key]['active'] += 1

        # Format monthly trends list
        monthly_trends = [
            {'month': k, 'total': v['total'], 'resolved': v['resolved'], 'active': v['active']}
            for k, v in month_buckets.items()
        ]
        if not monthly_trends:
            monthly_trends = [{'month': datetime.utcnow().strftime('%b %Y'), 'total': total, 'resolved': resolved, 'active': active}]

        # Recent incidents (latest 6)
        recent = session.query(Incident).order_by(Incident.created_at.desc()).limit(6).all()

        return jsonify({
            'summary': {
                'total_incidents': total,
                'active_incidents': active,
                'critical_incidents': critical,
                'resolved_incidents': resolved,
                'verified_incidents': verified
            },
            'category_distribution': category_distribution,
            'severity_distribution': severity_distribution,
            'status_distribution': status_distribution,
            'monthly_trends': monthly_trends,
            'recent_incidents': [inc.to_dict() for inc in recent]
        }), 200
    finally:
        session.close()
