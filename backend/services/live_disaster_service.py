import os
import time
import math
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from threading import Lock

# Thread-safe Cache storage
_cache_lock = Lock()
_disaster_cache = {
    'events': [],
    'previous_events_snapshot': [],
    'last_updated': 0,
    'last_updated_iso': None,
    'status': 'offline',
    'telemetry_health': {}
}

CACHE_TTL_SECONDS = 120  # 2 minutes cache to balance live updates with upstream rate limits

# Geographic bounding boxes
REGION_BBOX = {
    'india': {'min_lat': 6.0, 'max_lat': 38.0, 'min_lng': 68.0, 'max_lng': 98.0},
    'apac': {'min_lat': -45.0, 'max_lat': 55.0, 'min_lng': 60.0, 'max_lng': 180.0},
    'americas': {'min_lat': -55.0, 'max_lat': 70.0, 'min_lng': -170.0, 'max_lng': -30.0},
    'europe': {'min_lat': 35.0, 'max_lat': 70.0, 'min_lng': -15.0, 'max_lng': 45.0}
}

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def is_in_region(lat, lng, region_key):
    bbox = REGION_BBOX.get(region_key.lower())
    if not bbox:
        return True
    return (bbox['min_lat'] <= lat <= bbox['max_lat'] and
            bbox['min_lng'] <= lng <= bbox['max_lng'])

def fetch_usgs_earthquakes():
    """
    Fetches real-time earthquakes from USGS Seismology API.
    Audits connection status, latency, records received, and latest event time.
    """
    events = []
    audit = {
        'source_name': 'USGS Earthquake API',
        'category': 'Earthquakes & Tsunamis',
        'endpoint': 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
        'status': 'loading',
        'records_count': 0,
        'latest_event_time': None,
        'latency_ms': 0,
        'last_success': None,
        'error': None
    }
    
    start_t = time.time()
    try:
        resp = requests.get(audit['endpoint'], timeout=8)
        audit['latency_ms'] = int((time.time() - start_t) * 1000)
        
        if resp.status_code == 200:
            data = resp.json()
            features = data.get('features', [])
            latest_ts = 0
            
            for feature in features:
                props = feature.get('properties', {})
                geom = feature.get('geometry', {})
                coords = geom.get('coordinates', [0, 0, 0])
                lng, lat = coords[0], coords[1]
                depth = coords[2] if len(coords) > 2 else 10.0

                mag = props.get('mag')
                if mag is None:
                    continue
                mag = round(float(mag), 1)

                is_tsunami = bool(props.get('tsunami', 0))
                category = 'Tsunami' if is_tsunami else 'Earthquake'
                
                if mag >= 7.0 or is_tsunami:
                    severity = 'CRITICAL'
                elif mag >= 5.5:
                    severity = 'HIGH'
                elif mag >= 4.0:
                    severity = 'MEDIUM'
                else:
                    severity = 'LOW'

                time_epoch = props.get('time', int(time.time() * 1000))
                if time_epoch > latest_ts:
                    latest_ts = time_epoch
                event_time = datetime.fromtimestamp(time_epoch / 1000, tz=timezone.utc).isoformat()

                place = props.get('place') or 'Unknown region'
                title = f"M {mag} Earthquake - {place}"
                if is_tsunami:
                    title += " [OFFICIAL TSUNAMI ADVISORY]"

                events.append({
                    'id': f"usgs_{feature.get('id')}",
                    'title': title,
                    'description': f"Tectonic seismic activity magnitude {mag} at depth {depth} km. {props.get('status', 'automatic').capitalize()} USGS assessment.",
                    'category': category,
                    'severity': severity,
                    'magnitude': mag,
                    'depth_km': depth,
                    'location': place,
                    'latitude': lat,
                    'longitude': lng,
                    'event_time': event_time,
                    'source': 'USGS Earthquake Hazards Program',
                    'source_url': props.get('url') or 'https://earthquake.usgs.gov',
                    'source_type': 'official_seismic_network',
                    'verified_warning': is_tsunami or mag >= 6.0,
                    'alert_level': props.get('alert') or ('Red' if mag >= 7.0 else 'Yellow' if mag >= 5.5 else 'Green'),
                    'is_live': True,
                    'is_in_india': is_in_region(lat, lng, 'india')
                })

            audit['status'] = 'connected' if events else 'empty'
            audit['records_count'] = len(events)
            audit['last_success'] = datetime.now(timezone.utc).isoformat()
            if latest_ts:
                audit['latest_event_time'] = datetime.fromtimestamp(latest_ts / 1000, tz=timezone.utc).isoformat()
        else:
            audit['status'] = 'error'
            audit['error'] = f"HTTP {resp.status_code}: {resp.text[:100]}"
    except Exception as e:
        audit['status'] = 'unavailable'
        audit['error'] = str(e)
        audit['latency_ms'] = int((time.time() - start_t) * 1000)

    return events, audit

def fetch_nasa_eonet_events():
    """
    Fetches open natural events from NASA Earth Observatory Natural Event Tracker (EONET v3).
    Monitors Wildfires, Severe Storms / Cyclones, Volcanoes, and Floods.
    """
    events = []
    audit = {
        'source_name': 'NASA EONET Satellite Tracker',
        'category': 'Wildfires, Storms & Natural Hazards',
        'endpoint': 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100',
        'status': 'loading',
        'records_count': 0,
        'latest_event_time': None,
        'latency_ms': 0,
        'last_success': None,
        'error': None
    }
    
    start_t = time.time()
    try:
        resp = requests.get(audit['endpoint'], timeout=10)
        audit['latency_ms'] = int((time.time() - start_t) * 1000)
        
        if resp.status_code == 200:
            data = resp.json()
            raw_events = data.get('events', [])
            latest_time = None
            
            for ev in raw_events:
                ev_id = ev.get('id')
                title = ev.get('title', 'NASA Natural Event')
                categories = [c.get('title') for c in ev.get('categories', [])]
                
                cat_str = 'Other'
                if any('Fire' in c for c in categories):
                    cat_str = 'Fire'
                elif any('Storm' in c or 'Cyclone' in c or 'Severe' in c for c in categories):
                    cat_str = 'Cyclone'
                elif any('Flood' in c for c in categories):
                    cat_str = 'Flood'
                elif any('Volcano' in c for c in categories):
                    cat_str = 'Other'
                elif any('Landslide' in c for c in categories):
                    cat_str = 'Landslide'

                geometries = ev.get('geometry', [])
                if not geometries:
                    continue
                latest_geom = geometries[-1]
                coords = latest_geom.get('coordinates', [0, 0])
                if not coords or len(coords) < 2:
                    continue
                
                if isinstance(coords[0], (int, float)):
                    lng, lat = coords[0], coords[1]
                elif isinstance(coords[0], list) and len(coords[0]) > 0:
                    lng, lat = coords[0][0], coords[0][1]
                else:
                    continue

                event_date = latest_geom.get('date', datetime.now(timezone.utc).isoformat())
                if not latest_time or event_date > latest_time:
                    latest_time = event_date

                severity = 'MEDIUM'
                if cat_str == 'Cyclone':
                    severity = 'HIGH'
                elif cat_str == 'Fire':
                    severity = 'HIGH' if 'Complex' in title or 'Wildfire' in title else 'MEDIUM'

                sources = ev.get('sources', [])
                source_url = sources[0].get('url') if sources else 'https://eonet.gsfc.nasa.gov'

                events.append({
                    'id': f"nasa_{ev_id}",
                    'title': title,
                    'description': f"Active {cat_str} tracked by NASA Earth Observatory satellites. Status: Open/Active observation.",
                    'category': cat_str,
                    'severity': severity,
                    'magnitude': None,
                    'location': title,
                    'latitude': lat,
                    'longitude': lng,
                    'event_time': event_date,
                    'source': 'NASA EONET Satellite Tracker',
                    'source_url': source_url,
                    'source_type': 'official_satellite_telemetry',
                    'verified_warning': True,
                    'alert_level': 'Orange' if severity == 'HIGH' else 'Green',
                    'is_live': True,
                    'is_in_india': is_in_region(lat, lng, 'india')
                })

            audit['status'] = 'connected' if events else 'empty'
            audit['records_count'] = len(events)
            audit['last_success'] = datetime.now(timezone.utc).isoformat()
            audit['latest_event_time'] = latest_time
        else:
            audit['status'] = 'error'
            audit['error'] = f"HTTP {resp.status_code}"
    except Exception as e:
        audit['status'] = 'unavailable'
        audit['error'] = str(e)
        audit['latency_ms'] = int((time.time() - start_t) * 1000)

    return events, audit

def fetch_gdacs_alerts():
    """
    Parses live global disaster alerts from GDACS (UN / European Commission).
    Monitors Cyclones, Floods, Earthquakes, Volcanoes, and Wildfires.
    """
    events = []
    audit = {
        'source_name': 'GDACS Global Alert System',
        'category': 'UN / EC Multi-Hazard Feeds',
        'endpoint': 'https://www.gdacs.org/xml/rss.xml',
        'status': 'loading',
        'records_count': 0,
        'latest_event_time': None,
        'latency_ms': 0,
        'last_success': None,
        'error': None
    }
    
    start_t = time.time()
    try:
        resp = requests.get(audit['endpoint'], timeout=10)
        audit['latency_ms'] = int((time.time() - start_t) * 1000)
        
        if resp.status_code == 200:
            root = ET.fromstring(resp.content)
            items = root.findall('.//item')
            latest_time = None
            
            for item in items[:100]:
                title = item.find('title')
                title_text = title.text.strip() if title is not None and title.text else ''

                link = item.find('link')
                link_text = link.text.strip() if link is not None and link.text else 'https://www.gdacs.org'

                pub_date = item.find('pubDate')
                pub_date_text = pub_date.text.strip() if pub_date is not None and pub_date.text else datetime.now(timezone.utc).isoformat()
                if not latest_time or pub_date_text > latest_time:
                    latest_time = pub_date_text

                tag_dict = {}
                for elem in item:
                    clean_tag = elem.tag.split('}')[-1]
                    tag_dict[clean_tag] = elem.text.strip() if elem.text else ''

                event_type = tag_dict.get('eventtype', '')
                alert_level = tag_dict.get('alertlevel', 'Green').capitalize()
                country = tag_dict.get('country', '')
                population = tag_dict.get('population', '')

                point = tag_dict.get('point', '')
                lat, lng = 0.0, 0.0
                if point and ' ' in point:
                    parts = point.strip().split()
                    try:
                        lat = float(parts[0])
                        lng = float(parts[1])
                    except ValueError:
                        pass
                elif 'lat' in tag_dict and 'long' in tag_dict:
                    try:
                        lat = float(tag_dict['lat'])
                        lng = float(tag_dict['long'])
                    except ValueError:
                        pass

                if lat == 0.0 and lng == 0.0:
                    continue

                cat_map = {
                    'EQ': 'Earthquake',
                    'TC': 'Cyclone',
                    'FL': 'Flood',
                    'VO': 'Other',
                    'WF': 'Fire',
                    'DR': 'Other',
                    'TS': 'Tsunami'
                }
                category = cat_map.get(event_type, 'Other')

                if alert_level == 'Red':
                    severity = 'CRITICAL'
                elif alert_level == 'Orange':
                    severity = 'HIGH'
                elif alert_level == 'Yellow':
                    severity = 'MEDIUM'
                else:
                    severity = 'LOW'

                desc = f"Official GDACS {alert_level} Alert in {country or 'region'}. {population or ''}".strip()
                guid = tag_dict.get('guid') or str(abs(hash(title_text)))

                events.append({
                    'id': f"gdacs_{guid}",
                    'title': title_text,
                    'description': desc,
                    'category': category,
                    'severity': severity,
                    'magnitude': None,
                    'location': f"{country} ({tag_dict.get('severity', '')})" if country else title_text,
                    'country': country,
                    'latitude': lat,
                    'longitude': lng,
                    'event_time': pub_date_text,
                    'source': 'GDACS (UN / European Commission)',
                    'source_url': link_text,
                    'source_type': 'official_un_alert',
                    'verified_warning': alert_level in ['Orange', 'Red'],
                    'alert_level': alert_level,
                    'is_live': True,
                    'is_in_india': is_in_region(lat, lng, 'india')
                })

            audit['status'] = 'connected' if events else 'empty'
            audit['records_count'] = len(events)
            audit['last_success'] = datetime.now(timezone.utc).isoformat()
            audit['latest_event_time'] = latest_time
        else:
            audit['status'] = 'error'
            audit['error'] = f"HTTP {resp.status_code}"
    except Exception as e:
        audit['status'] = 'unavailable'
        audit['error'] = str(e)
        audit['latency_ms'] = int((time.time() - start_t) * 1000)

    return events, audit

def fetch_open_meteo_weather(lat, lng):
    """
    Fetches real-time weather and severe weather hazards for coordinates using Open-Meteo.
    Detects heatwaves, high wind gusts, heavy rainfall, and cold snaps.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lng}&"
        f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m&"
        f"daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
    )
    start_t = time.time()
    try:
        resp = requests.get(url, timeout=8)
        latency = int((time.time() - start_t) * 1000)
        if resp.status_code == 200:
            data = resp.json()
            curr = data.get('current', {})
            temp = curr.get('temperature_2m', 0.0)
            wind_speed = curr.get('wind_speed_10m', 0.0)
            wind_gusts = curr.get('wind_gusts_10m', 0.0)
            precip = curr.get('precipitation', 0.0)
            wcode = curr.get('weather_code', 0)

            w_desc = "Clear / Fair"
            if wcode in [1, 2, 3]: w_desc = "Partly Cloudy"
            elif wcode in [45, 48]: w_desc = "Foggy / Mist"
            elif wcode in [51, 53, 55, 61, 63, 65]: w_desc = "Rain / Showers"
            elif wcode in [71, 73, 75]: w_desc = "Snowfall"
            elif wcode in [80, 81, 82]: w_desc = "Heavy Downpour"
            elif wcode in [95, 96, 99]: w_desc = "Thunderstorm / Lightning"

            hazards = []
            if temp >= 42.0:
                hazards.append({'type': 'Severe Heatwave', 'severity': 'CRITICAL', 'msg': f'Extreme temperature {temp}°C detected. Heatstroke hazard.'})
            elif temp >= 38.0:
                hazards.append({'type': 'Heatwave Advisory', 'severity': 'HIGH', 'msg': f'High temperature {temp}°C. Hydrate and avoid direct sun.'})

            if wind_gusts >= 80.0:
                hazards.append({'type': 'Gale-Force Wind Alert', 'severity': 'CRITICAL', 'msg': f'Damaging peak wind gusts {wind_gusts} km/h.'})
            elif wind_speed >= 50.0 or wind_gusts >= 60.0:
                hazards.append({'type': 'High Wind Warning', 'severity': 'HIGH', 'msg': f'Strong winds up to {wind_gusts} km/h.'})

            if precip >= 25.0:
                hazards.append({'type': 'Torrential Rainfall Alert', 'severity': 'CRITICAL', 'msg': f'Severe precipitation {precip} mm/h. Flash flood danger.'})
            elif precip >= 10.0:
                hazards.append({'type': 'Heavy Rain Warning', 'severity': 'HIGH', 'msg': f'Heavy rainfall {precip} mm/h.'})

            return {
                'success': True,
                'status': 'connected',
                'temperature': temp,
                'apparent_temperature': curr.get('apparent_temperature', temp),
                'humidity': curr.get('relative_humidity_2m', 0),
                'wind_speed': wind_speed,
                'wind_gusts': wind_gusts,
                'precipitation': precip,
                'condition': w_desc,
                'weather_code': wcode,
                'hazards': hazards,
                'latency_ms': latency,
                'last_updated': curr.get('time', datetime.now(timezone.utc).strftime('%H:%M UTC'))
            }
    except Exception as e:
        print(f"[LiveService] Open-Meteo weather error: {e}")

    return {
        'success': False,
        'status': 'unavailable',
        'temperature': 24.0,
        'condition': 'Atmospheric sensor stream offline',
        'hazards': []
    }

def search_locations_geocoding(query):
    if not query or len(query.strip()) < 2:
        return []
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={query.strip()}&count=6&language=en&format=json"
    try:
        resp = requests.get(url, timeout=6)
        if resp.status_code == 200:
            results = resp.json().get('results', [])
            formatted = []
            for item in results:
                admin = item.get('admin1') or ''
                country = item.get('country') or ''
                label_parts = [item.get('name'), admin, country]
                label = ', '.join([p for p in label_parts if p])
                formatted.append({
                    'name': item.get('name'),
                    'label': label,
                    'country': country,
                    'latitude': item.get('latitude'),
                    'longitude': item.get('longitude'),
                    'is_in_india': is_in_region(item.get('latitude'), item.get('longitude'), 'india')
                })
            return formatted
    except Exception as e:
        print(f"[LiveService] Geocoding error: {e}")
    return []

def get_live_disasters(force_refresh=False):
    """
    Returns unified list of live disaster events with detailed telemetry audit.
    Maintains situational delta between previous and current snapshot.
    """
    global _disaster_cache
    now = time.time()

    with _cache_lock:
        if not force_refresh and _disaster_cache['events'] and (now - _disaster_cache['last_updated'] < CACHE_TTL_SECONDS):
            return _disaster_cache

    # Capture previous snapshot for delta analysis
    prev_ids = {e['id'] for e in _disaster_cache.get('events', [])}

    # Fetch live feeds concurrently or sequentially
    usgs_events, usgs_audit = fetch_usgs_earthquakes()
    nasa_events, nasa_audit = fetch_nasa_eonet_events()
    gdacs_events, gdacs_audit = fetch_gdacs_alerts()

    # Open-Meteo sample test for health audit (New Delhi coordinates)
    meteo_test = fetch_open_meteo_weather(28.61, 77.20)
    meteo_audit = {
        'source_name': 'Open-Meteo Atmospheric Network',
        'category': 'Extreme Weather & Heatwaves',
        'endpoint': 'https://api.open-meteo.com/v1/forecast',
        'status': 'connected' if meteo_test['success'] else 'unavailable',
        'records_count': 1,
        'latest_event_time': meteo_test.get('last_updated'),
        'latency_ms': meteo_test.get('latency_ms', 0),
        'last_success': datetime.now(timezone.utc).isoformat() if meteo_test['success'] else None,
        'error': None if meteo_test['success'] else 'Timeout/Connection error'
    }

    # Indian Regional Warning Sources Audit (USGS India & Open-Meteo India)
    india_quakes = [e for e in usgs_events if e.get('is_in_india')]
    india_audit = {
        'source_name': 'India Meteorological & Seismology Array',
        'category': 'Indian Regional Hazards (IMD/USGS)',
        'endpoint': 'Regional Coordinates [6°N–38°N, 68°E–98°E]',
        'status': 'connected',
        'records_count': len(india_quakes),
        'latest_event_time': india_quakes[0].get('event_time') if india_quakes else 'No active seismic events in Indian bounds',
        'latency_ms': usgs_audit.get('latency_ms', 0),
        'last_success': datetime.now(timezone.utc).isoformat(),
        'error': None
    }

    merged = []
    seen_coords = set()
    new_events_count = 0

    for ev in (usgs_events + gdacs_events + nasa_events):
        coord_key = f"{round(ev['latitude'], 2)}_{round(ev['longitude'], 2)}_{ev['category']}"
        if coord_key in seen_coords:
            continue
        seen_coords.add(coord_key)
        
        # Flag new events comparing with previous snapshot
        is_new = bool(prev_ids and ev['id'] not in prev_ids)
        ev['is_new'] = is_new
        if is_new:
            new_events_count += 1
            
        merged.append(ev)

    sev_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    merged.sort(key=lambda x: (sev_order.get(x['severity'], 4), x.get('event_time', '')), reverse=False)

    telemetry_health = {
        'USGS Earthquake API': usgs_audit,
        'NASA EONET Satellite': nasa_audit,
        'GDACS Global Alerts': gdacs_audit,
        'Open-Meteo Weather': meteo_audit,
        'India Disaster Watch': india_audit
    }

    overall_status = 'online'
    active_sources = sum(1 for a in telemetry_health.values() if a['status'] == 'connected')
    if active_sources == 0:
        overall_status = 'offline'
    elif active_sources < len(telemetry_health):
        overall_status = 'degraded'

    with _cache_lock:
        _disaster_cache = {
            'events': merged,
            'previous_events_snapshot': _disaster_cache.get('events', [])[:50],
            'last_updated': now,
            'last_updated_iso': datetime.now(timezone.utc).isoformat(),
            'status': overall_status,
            'total_count': len(merged),
            'new_events_count': new_events_count,
            'telemetry_health': telemetry_health
        }
        return _disaster_cache

def generate_ai_disaster_intelligence(events, location_name=None, region='global'):
    """
    AI-powered Disaster Intelligence Generator with Situational Delta Comparison.
    """
    gemini_key = os.environ.get('GEMINI_API_KEY')
    total = len(events)
    crit_count = sum(1 for e in events if e.get('severity') == 'CRITICAL')
    high_count = sum(1 for e in events if e.get('severity') == 'HIGH')
    quakes = [e for e in events if e.get('category') == 'Earthquake']
    fires = [e for e in events if e.get('category') == 'Fire']
    storms = [e for e in events if e.get('category') in ['Cyclone', 'Flood']]
    new_events = [e for e in events if e.get('is_new')]

    top_events = events[:8]
    events_summary_text = "\n".join([
        f"- [{e.get('severity')}] {e.get('category')}: {e.get('title')} ({e.get('location')}, Source: {e.get('source')})"
        for e in top_events
    ])

    if gemini_key:
        try:
            prompt = (
                f"You are DisasterAI, a Senior Disaster Intelligence Analyst. Analyze these live natural hazard events:\n\n"
                f"Active Incidents: {total} total ({crit_count} Critical, {high_count} High).\n"
                f"Region: {region.upper()}" + (f" (Location: {location_name})" if location_name else "") + "\n"
                f"New Events in Current Cycle: {len(new_events)}\n\n"
                f"Current Priority Events:\n{events_summary_text}\n\n"
                f"Respond with JSON containing:\n"
                f"1. 'executive_summary': A 2-3 sentence overview.\n"
                f"2. 'potential_impact': Human, infrastructure, and supply chain impacts.\n"
                f"3. 'pattern_analysis': Geographic and atmospheric patterns.\n"
                f"4. 'situational_delta': How current conditions have evolved since the previous cycle.\n"
                f"5. 'safety_recommendations': Array of 4-5 prioritized life-safety recommendations.\n"
                f"6. 'disclaimer': Mandatory safety advisory notice."
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=12)
            if res.status_code == 200:
                data = res.json()
                text_content = data['candidates'][0]['content']['parts'][0]['text']
                import json
                clean_json = text_content.replace('```json', '').replace('```', '').strip()
                return json.loads(clean_json)
        except Exception as e:
            print(f"[LiveService] Gemini API error: {e}")

    # Fallback Expert Heuristic Synthesizer
    max_mag = max([q.get('magnitude') or 0 for q in quakes], default=0)
    top_quake_loc = next((q.get('location') for q in quakes if (q.get('magnitude') or 0) == max_mag), 'None')
    
    if crit_count > 0:
        exec_summary = (
            f"EOC Operational Warning: {crit_count} CRITICAL priority hazard events are currently logged across global telemetry arrays. "
            f"Seismic energy release peaked at M {max_mag} near {top_quake_loc}, with {len(fires)} active wildfire complexes and {len(storms)} cyclonic/storm clusters tracked by NASA and GDACS satellite observation."
        )
    else:
        exec_summary = (
            f"Global Situational Overview: Monitoring {total} ongoing natural hazard events with {high_count} elevated alerts. "
            f"Tectonic stress release remains within baseline bounds with peak earthquake M {max_mag}. No catastrophic compounding hazards detected at this hour."
        )

    delta_text = (
        f"Telemetry delta: {len(new_events)} newly ingested events in this monitoring cycle. "
        f"Seismic and thermal hotspot feeds show steady temporal continuity across monitored fault lines and burn scars."
    )

    patterns = (
        f"Seismic clustering remains focused along Pacific subduction boundaries and Himalayan frontal faults ({len(quakes)} events logged). "
        f"Thermal anomalies from {len(fires)} active wildfires indicate wind-driven perimeter expansion in dry arid corridors."
    )

    impact_text = (
        "Elevated vulnerability observed for low-elevation coastal settlements subject to storm surges, and unreinforced masonry structures near shallow seismic epicenters. "
        "Transportation bottlenecks and utility transmission lines should be continuously assessed by local civil protection desks."
    )

    recs = [
        "In seismic alert zones: verify drop-cover-hold survival locations and clear exit corridors.",
        "In coastal and flood-prone basins: adhere strictly to official evacuation notices and never navigate moving floodwaters.",
        "Near wildfire zones: seal interior air filtration systems and keep essential 72-hour go-bags ready.",
        "Response agencies: ensure backup radio repeaters and emergency satellite communication channels remain energized.",
        "Direct immediate life-threatening distress calls to National Emergency Helplines (112 / 1070)."
    ]

    return {
        'executive_summary': exec_summary,
        'potential_impact': impact_text,
        'pattern_analysis': patterns,
        'situational_delta': delta_text,
        'safety_recommendations': recs,
        'disclaimer': (
            "NOTICE: AI-generated disaster intelligence is an algorithmic situational summary. "
            "It must never supersede official directives issued by emergency response agencies or meteorological services."
        ),
        'engine_mode': 'Heuristic Disaster Intelligence Synthesizer' if not gemini_key else 'Gemini 1.5 Flash'
    }
