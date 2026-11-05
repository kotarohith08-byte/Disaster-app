from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify
from backend.services.live_disaster_service import (
    get_live_disasters,
    fetch_open_meteo_weather,
    search_locations_geocoding,
    generate_ai_disaster_intelligence,
    haversine_km,
    is_in_region
)

live_bp = Blueprint('live', __name__)

@live_bp.route('/disasters', methods=['GET'])
def get_disasters():
    force_refresh = request.args.get('refresh', '').lower() == 'true'
    cache = get_live_disasters(force_refresh=force_refresh)
    events = cache['events']

    # Filter by region
    region = request.args.get('region', 'global').lower()
    if region != 'global':
        events = [e for e in events if is_in_region(e['latitude'], e['longitude'], region)]

    # Filter by category
    category = request.args.get('category', 'All')
    if category and category != 'All':
        events = [e for e in events if e.get('category', '').lower() == category.lower()]

    # Filter by severity
    severity = request.args.get('severity', 'All')
    if severity and severity != 'All':
        events = [e for e in events if e.get('severity') == severity.upper()]

    # Filter by time range (24h, 48h, 7d, all)
    time_range = request.args.get('time_range', 'all').lower()
    if time_range != 'all':
        now = datetime.now(timezone.utc)
        hours_map = {'24h': 24, '48h': 48, '7d': 168}
        delta_hours = hours_map.get(time_range, 168)
        cutoff = now - timedelta(hours=delta_hours)
        
        filtered_by_time = []
        for e in events:
            try:
                t_str = e.get('event_time')
                if t_str:
                    # Clean ISO format
                    dt = datetime.fromisoformat(t_str.replace('Z', '+00:00'))
                    if dt >= cutoff:
                        filtered_by_time.append(e)
                else:
                    filtered_by_time.append(e)
            except Exception:
                filtered_by_time.append(e)
        events = filtered_by_time

    # Proximity filter
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
        'new_events_count': cache.get('new_events_count', 0),
        'telemetry_health': cache.get('telemetry_health', {}),
        'events': events
    }), 200

@live_bp.route('/sources-health', methods=['GET'])
def get_sources_health():
    force_refresh = request.args.get('refresh', '').lower() == 'true'
    cache = get_live_disasters(force_refresh=force_refresh)
    return jsonify({
        'overall_status': cache['status'],
        'last_sync': cache.get('last_updated_iso'),
        'total_events': cache.get('total_count', 0),
        'new_events_this_cycle': cache.get('new_events_count', 0),
        'sources': cache.get('telemetry_health', {})
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

    cat_counts = {}
    for e in events:
        cat = e.get('category', 'Other')
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    india_events = [e for e in events if is_in_region(e['latitude'], e['longitude'], 'india')]

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
        'new_events_count': cache.get('new_events_count', 0),
        'categories': [{'name': k, 'count': v} for k, v in cat_counts.items()],
        'sources': [{'name': k, 'count': v} for k, v in source_counts.items()],
        'telemetry_health': cache.get('telemetry_health', {})
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
    alerts = [e for e in events if e.get('severity') in ['CRITICAL', 'HIGH']]
    return jsonify({
        'count': len(alerts),
        'alerts': alerts[:25]
    }), 200

@live_bp.route('/ai-intelligence', methods=['POST'])
def ai_intelligence():
    data = request.get_json() or {}
    region = data.get('region', 'global')
    location_name = data.get('location', '')

    cache = get_live_disasters()
    events = cache['events']
    if region != 'global':
        events = [e for e in events if is_in_region(e['latitude'], e['longitude'], region)]

    intelligence = generate_ai_disaster_intelligence(
        events=events,
        location_name=location_name,
        region=region
    )
    return jsonify(intelligence), 200
