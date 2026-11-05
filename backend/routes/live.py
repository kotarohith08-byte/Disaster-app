from flask import Blueprint, request, jsonify
from backend.services.live_disaster_service import (
    get_live_disasters,
    fetch_open_meteo_weather,
    search_locations_geocoding,
    generate_ai_disaster_intelligence,
    haversine_km
)

live_bp = Blueprint('live', __name__)

@live_bp.route('/disasters', methods=['GET'])
def get_disasters():
    force_refresh = request.args.get('refresh', '').lower() == 'true'
    cache = get_live_disasters(force_refresh=force_refresh)
    events = cache['events']

    # Filter by region
    region = request.args.get('region', 'global').lower()
    if region == 'india':
        events = [e for e in events if e.get('is_in_india')]

    # Filter by category
    category = request.args.get('category', 'All')
    if category and category != 'All':
        events = [e for e in events if e.get('category', '').lower() == category.lower()]

    # Filter by severity
    severity = request.args.get('severity', 'All')
    if severity and severity != 'All':
        events = [e for e in events if e.get('severity') == severity.upper()]

    # Proximity filter (lat, lng, radius_km)
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius_km', type=float)
    if lat is not None and lng is not None and radius:
        filtered = []
        for e in events:
            dist = haversine_km(lat, lng, e['latitude'], e['longitude'])
            if dist <= radius:
                e_copy = dict(e)
                e_copy['distance_km'] = round(dist, 1)
                filtered.append(e_copy)
        filtered.sort(key=lambda x: x['distance_km'])
        events = filtered

    return jsonify({
        'status': cache['status'],
        'last_updated': cache.get('last_updated_iso'),
        'total_count': len(events),
        'sources_status': cache.get('sources_status'),
        'events': events
    }), 200

@live_bp.route('/summary', methods=['GET'])
def get_summary():
    cache = get_live_disasters()
    events = cache['events']

    total = len(events)
    critical = sum(1 for e in events if e.get('severity') == 'CRITICAL')
    high = sum(1 for e in events if e.get('severity') == 'HIGH')
    medium = sum(1 for e in events if e.get('severity') == 'MEDIUM')
    low = sum(1 for e in events if e.get('severity') == 'LOW')

    # Categories count
    cat_counts = {}
    for e in events:
        cat = e.get('category', 'Other')
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    # India specific
    india_events = [e for e in events if e.get('is_in_india')]

    # Sources count
    source_counts = {}
    for e in events:
        src = e.get('source', 'Unknown')
        source_counts[src] = source_counts.get(src, 0) + 1

    return jsonify({
        'status': cache['status'],
        'last_updated': cache.get('last_updated_iso'),
        'total_monitored': total,
        'critical_alerts': critical,
        'high_alerts': high,
        'medium_alerts': medium,
        'low_alerts': low,
        'india_events_count': len(india_events),
        'categories': [{'name': k, 'count': v} for k, v in cat_counts.items()],
        'sources': [{'name': k, 'count': v} for k, v in source_counts.items()],
        'sources_status': cache.get('sources_status')
    }), 200

@live_bp.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat', default=28.6139, type=float)
    lng = request.args.get('lng', default=77.2090, type=float)
    result = fetch_open_meteo_weather(lat, lng)
    return jsonify(result), 200

@live_bp.route('/geocode', methods=['GET'])
def geocode():
    query = request.args.get('query', '')
    results = search_locations_geocoding(query)
    return jsonify({'results': results}), 200

@live_bp.route('/alerts', methods=['GET'])
def get_alerts():
    cache = get_live_disasters()
    events = cache['events']
    # Return Critical and High severity events as active alerts
    alerts = [e for e in events if e.get('severity') in ['CRITICAL', 'HIGH']]
    return jsonify({
        'count': len(alerts),
        'alerts': alerts[:20]  # Top 20 prominent alerts
    }), 200

@live_bp.route('/ai-intelligence', methods=['POST'])
def ai_intelligence():
    data = request.get_json() or {}
    region = data.get('region', 'global')
    location_name = data.get('location', '')

    cache = get_live_disasters()
    events = cache['events']
    if region == 'india':
        events = [e for e in events if e.get('is_in_india')]

    intelligence = generate_ai_disaster_intelligence(
        events=events,
        location_name=location_name,
        region=region
    )
    return jsonify(intelligence), 200
