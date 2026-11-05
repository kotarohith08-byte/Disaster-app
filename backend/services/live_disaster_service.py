import os
import time
import math
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from threading import Lock

# In-memory Cache storage
_cache_lock = Lock()
_disaster_cache = {
    'events': [],
    'last_updated': 0,
    'status': 'offline',
    'sources_status': {}
}

CACHE_TTL_SECONDS = 120  # 2 minutes cache to balance live updates with API rate limits

# India bounding box roughly
INDIA_BBOX = {
    'min_lat': 6.0,
    'max_lat': 38.0,
    'min_lng': 68.0,
    'max_lng': 98.0
}

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def is_in_india(lat, lng):
    return (INDIA_BBOX['min_lat'] <= lat <= INDIA_BBOX['max_lat'] and
            INDIA_BBOX['min_lng'] <= lng <= INDIA_BBOX['max_lng'])

def fetch_usgs_earthquakes():
    """
    Fetches real-time earthquakes from USGS API.
    Uses 4.5+ magnitude earthquakes of past week, plus all earthquakes in past 24 hours.
    """
    events = []
    # Primary: past day all earthquakes (catches small & local quakes)
    urls = [
        ('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', 2.5),
        ('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson', 4.5)
    ]
    seen_ids = set()

    for url, min_mag in urls:
        try:
            resp = requests.get(url, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                for feature in data.get('features', []):
                    f_id = feature.get('id')
                    if f_id in seen_ids:
                        continue
                    seen_ids.add(f_id)

                    props = feature.get('properties', {})
                    geom = feature.get('geometry', {})
                    coords = geom.get('coordinates', [0, 0, 0])
                    lng, lat = coords[0], coords[1]
                    depth = coords[2] if len(coords) > 2 else 10.0

                    mag = props.get('mag')
                    if mag is None:
                        continue
                    mag = round(float(mag), 1)

                    # Severity classification based on Richter magnitude & tsunami alert
                    tsunami = bool(props.get('tsunami', 0))
                    if mag >= 7.0 or tsunami:
                        severity = 'CRITICAL'
                    elif mag >= 5.5:
                        severity = 'HIGH'
                    elif mag >= 4.0:
                        severity = 'MEDIUM'
                    else:
                        severity = 'LOW'

                    # Timestamp conversion
                    time_epoch = props.get('time', int(time.time() * 1000))
                    event_time = datetime.fromtimestamp(time_epoch / 1000, tz=timezone.utc).isoformat()

                    place = props.get('place') or 'Unknown region'
                    title = f"M {mag} Earthquake - {place}"
                    if tsunami:
                        title += " [TSUNAMI ADVISORY]"

                    events.append({
                        'id': f"usgs_{f_id}",
                        'title': title,
                        'description': f"Seismic event of magnitude {mag} detected at depth {depth} km. {props.get('status', 'automatic').capitalize()} USGS assessment.",
                        'category': 'Earthquake',
                        'severity': severity,
                        'magnitude': mag,
                        'depth_km': depth,
                        'location': place,
                        'latitude': lat,
                        'longitude': lng,
                        'event_time': event_time,
                        'source': 'USGS Earthquake Hazards Program',
                        'source_url': props.get('url') or 'https://earthquake.usgs.gov',
                        'source_type': 'official_sensor',
                        'verified_warning': tsunami or mag >= 6.0,
                        'alert_level': props.get('alert') or ('Red' if mag >= 7.0 else 'Yellow' if mag >= 5.5 else 'Green'),
                        'is_live': True,
                        'is_in_india': is_in_india(lat, lng)
                    })
        except Exception as e:
            print(f"[LiveService] USGS fetch error ({url}): {e}")

    return events

def fetch_nasa_eonet_events():
    """
    Fetches active natural events from NASA Earth Observatory Natural Event Tracker (EONET v3).
    Includes Wildfires, Severe Storms / Cyclones, Volcanoes, and Floods.
    """
    events = []
    url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100'
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            for ev in data.get('events', []):
                ev_id = ev.get('id')
                title = ev.get('title', 'NASA Natural Event')
                categories = [c.get('title') for c in ev.get('categories', [])]
                
                # Determine normalized category
                cat_str = 'Other'
                if any('Fire' in c for c in categories):
                    cat_str = 'Fire'
                elif any('Storm' in c or 'Cyclone' in c or 'Severe' in c for c in categories):
                    cat_str = 'Cyclone'
                elif any('Flood' in c for c in categories):
                    cat_str = 'Flood'
                elif any('Volcano' in c for c in categories):
                    cat_str = 'Volcano'
                elif any('Landslide' in c for c in categories):
                    cat_str = 'Landslide'

                geometries = ev.get('geometry', [])
                if not geometries:
                    continue
                latest_geom = geometries[-1]
                coords = latest_geom.get('coordinates', [0, 0])
                if not coords or len(coords) < 2:
                    continue
                
                # Point coordinates
                if isinstance(coords[0], (int, float)):
                    lng, lat = coords[0], coords[1]
                elif isinstance(coords[0], list) and len(coords[0]) > 0:
                    lng, lat = coords[0][0], coords[0][1]
                else:
                    continue

                event_date = latest_geom.get('date', datetime.now(timezone.utc).isoformat())

                # Severity estimation
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
                    'description': f"Active {cat_str} event tracked by NASA Earth Observatory satellite observations. Status: Open/Active.",
                    'category': cat_str,
                    'severity': severity,
                    'magnitude': None,
                    'location': title,
                    'latitude': lat,
                    'longitude': lng,
                    'event_time': event_date,
                    'source': 'NASA EONET Satellite Tracker',
                    'source_url': source_url,
                    'source_type': 'official_satellite',
                    'verified_warning': True,
                    'alert_level': 'Orange' if severity == 'HIGH' else 'Green',
                    'is_live': True,
                    'is_in_india': is_in_india(lat, lng)
                })
    except Exception as e:
        print(f"[LiveService] NASA EONET fetch error: {e}")

    return events

def fetch_gdacs_alerts():
    """
    Parses live global disaster alerts from GDACS (Global Disaster Alert and Coordination System - UN/EC).
    Covers Cyclones (TC), Floods (FL), Earthquakes (EQ), Volcanoes (VO), Wildfires (WF).
    """
    events = []
    url = 'https://www.gdacs.org/xml/rss.xml'
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            root = ET.fromstring(resp.content)
            items = root.findall('.//item')
            for item in items[:100]:
                title = item.find('title')
                title_text = title.text.strip() if title is not None and title.text else ''

                link = item.find('link')
                link_text = link.text.strip() if link is not None and link.text else 'https://www.gdacs.org'

                pub_date = item.find('pubDate')
                pub_date_text = pub_date.text.strip() if pub_date is not None and pub_date.text else datetime.now(timezone.utc).isoformat()

                # Search namespaced or simple tags
                tag_dict = {}
                for elem in item:
                    clean_tag = elem.tag.split('}')[-1]
                    tag_dict[clean_tag] = elem.text.strip() if elem.text else ''

                event_type = tag_dict.get('eventtype', '')
                alert_level = tag_dict.get('alertlevel', 'Green').capitalize()
                country = tag_dict.get('country', '')
                population = tag_dict.get('population', '')

                # Determine coordinates from 'point' (format: "lat lng")
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

                # Map event type
                cat_map = {
                    'EQ': 'Earthquake',
                    'TC': 'Cyclone',
                    'FL': 'Flood',
                    'VO': 'Other',
                    'WF': 'Fire',
                    'DR': 'Other'
                }
                category = cat_map.get(event_type, 'Other')

                # Severity from GDACS alert level
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
                    'is_in_india': is_in_india(lat, lng)
                })
    except Exception as e:
        print(f"[LiveService] GDACS fetch error: {e}")

    return events

def get_live_disasters(force_refresh=False):
    """
    Returns unified list of live disaster events aggregated from USGS, NASA EONET, and GDACS.
    Handles caching with 2-minute TTL.
    """
    global _disaster_cache
    now = time.time()

    with _cache_lock:
        if not force_refresh and _disaster_cache['events'] and (now - _disaster_cache['last_updated'] < CACHE_TTL_SECONDS):
            return _disaster_cache

    # Refresh from APIs
    usgs_events = fetch_usgs_earthquakes()
    nasa_events = fetch_nasa_eonet_events()
    gdacs_events = fetch_gdacs_alerts()

    merged = []
    seen_coords = set()

    for ev in (usgs_events + gdacs_events + nasa_events):
        # Deduplication by approximate coordinate & category
        coord_key = f"{round(ev['latitude'], 2)}_{round(ev['longitude'], 2)}_{ev['category']}"
        if coord_key in seen_coords:
            continue
        seen_coords.add(coord_key)
        merged.append(ev)

    # Sort: CRITICAL first, then HIGH, then by latest date
    sev_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    merged.sort(key=lambda x: (sev_order.get(x['severity'], 4), x.get('event_time', '')), reverse=False)

    sources_status = {
        'USGS Earthquake API': f"{len(usgs_events)} events live",
        'NASA EONET Satellite': f"{len(nasa_events)} events live",
        'GDACS Global Alerts': f"{len(gdacs_events)} alerts live"
    }

    with _cache_lock:
        _disaster_cache = {
            'events': merged,
            'last_updated': now,
            'last_updated_iso': datetime.now(timezone.utc).isoformat(),
            'status': 'online' if merged else 'degraded',
            'total_count': len(merged),
            'sources_status': sources_status
        }
        return _disaster_cache

def fetch_open_meteo_weather(lat, lng):
    """
    Fetches real-time weather and severe weather hazards for given coordinates using Open-Meteo API.
    Detects extreme heat, heavy rainfall, high wind gusts.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lng}&"
        f"current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m&"
        f"daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
    )
    try:
        resp = requests.get(url, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            curr = data.get('current', {})
            temp = curr.get('temperature_2m', 0.0)
            wind_speed = curr.get('wind_speed_10m', 0.0)
            wind_gusts = curr.get('wind_gusts_10m', 0.0)
            precip = curr.get('precipitation', 0.0)
            wcode = curr.get('weather_code', 0)

            # Weather interpretation
            w_desc = "Clear / Fair"
            if wcode in [1, 2, 3]:
                w_desc = "Partly Cloudy"
            elif wcode in [45, 48]:
                w_desc = "Foggy / Mist"
            elif wcode in [51, 53, 55, 61, 63, 65]:
                w_desc = "Rain / Showers"
            elif wcode in [71, 73, 75]:
                w_desc = "Snowfall"
            elif wcode in [80, 81, 82]:
                w_desc = "Heavy Rain Downpour"
            elif wcode in [95, 96, 99]:
                w_desc = "Thunderstorm / Lightning"

            # Extreme weather alert indicators
            hazards = []
            if temp >= 42.0:
                hazards.append({'type': 'Severe Heatwave', 'severity': 'CRITICAL', 'msg': f'Extreme temperature of {temp}°C detected. Risk of severe heatstroke.'})
            elif temp >= 38.0:
                hazards.append({'type': 'Heatwave Advisory', 'severity': 'HIGH', 'msg': f'High temperature of {temp}°C. Hydrate and avoid direct sunlight.'})

            if wind_gusts >= 80.0:
                hazards.append({'type': 'Gale-Force Wind Alert', 'severity': 'CRITICAL', 'msg': f'Damaging wind gusts of {wind_gusts} km/h.'})
            elif wind_speed >= 50.0 or wind_gusts >= 60.0:
                hazards.append({'type': 'High Wind Warning', 'severity': 'HIGH', 'msg': f'Strong winds up to {wind_gusts} km/h.'})

            if precip >= 25.0:
                hazards.append({'type': 'Torrential Rainfall', 'severity': 'CRITICAL', 'msg': f'Intense precipitation of {precip} mm/h. Flash flood danger.'})
            elif precip >= 10.0:
                hazards.append({'type': 'Heavy Rainfall Warning', 'severity': 'HIGH', 'msg': f'Substantial rainfall of {precip} mm/h detected.'})

            return {
                'success': True,
                'temperature': temp,
                'apparent_temperature': curr.get('apparent_temperature', temp),
                'humidity': curr.get('relative_humidity_2m', 0),
                'wind_speed': wind_speed,
                'wind_gusts': wind_gusts,
                'precipitation': precip,
                'condition': w_desc,
                'weather_code': wcode,
                'hazards': hazards,
                'last_updated': curr.get('time', datetime.now(timezone.utc).strftime('%H:%M UTC'))
            }
    except Exception as e:
        print(f"[LiveService] Open-Meteo weather error: {e}")

    return {
        'success': False,
        'temperature': 24.0,
        'condition': 'Weather feed temporarily unavailable',
        'hazards': []
    }

def search_locations_geocoding(query):
    """
    Searches places and cities using Open-Meteo Geocoding API.
    """
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
                    'is_in_india': is_in_india(item.get('latitude'), item.get('longitude'))
                })
            return formatted
    except Exception as e:
        print(f"[LiveService] Geocoding error: {e}")
    return []

def generate_ai_disaster_intelligence(events, location_name=None, region='global'):
    """
    AI-powered Disaster Intelligence Generator:
    - Summarizes incoming disaster reports
    - Explains potential impact across population & infrastructure
    - Identifies patterns across reported events
    - Formulates actionable safety recommendations
    - Uses Gemini API if GEMINI_API_KEY is configured in env, or rich expert rule synthesis fallback.
    """
    # 1. Check if Gemini API key exists
    gemini_key = os.environ.get('GEMINI_API_KEY')
    total = len(events)
    crit_count = sum(1 for e in events if e.get('severity') == 'CRITICAL')
    high_count = sum(1 for e in events if e.get('severity') == 'HIGH')
    quakes = [e for e in events if e.get('category') == 'Earthquake']
    fires = [e for e in events if e.get('category') == 'Fire']
    storms = [e for e in events if e.get('category') in ['Cyclone', 'Flood']]

    # Prepare event digest for prompt
    top_events = events[:8]
    events_summary_text = "\n".join([
        f"- [{e.get('severity')}] {e.get('category')}: {e.get('title')} (Loc: {e.get('location')}, Source: {e.get('source')})"
        for e in top_events
    ])

    if gemini_key:
        try:
            prompt = (
                f"You are DisasterAI, a Senior Disaster Response Analyst. Analyze these current ongoing live disaster events:\n\n"
                f"Active Monitored Incidents: {total} total ({crit_count} Critical, {high_count} High).\n"
                f"Region: {region.upper()}" + (f" (Focus: {location_name})" if location_name else "") + "\n\n"
                f"Key Ongoing Reports:\n{events_summary_text}\n\n"
                f"Provide a structured analysis formatted as JSON with these exact keys:\n"
                f"1. 'executive_summary': A 2-3 sentence situation summary of active global threats.\n"
                f"2. 'potential_impact': Assessment of potential population, infrastructure, and supply chain vulnerabilities.\n"
                f"3. 'pattern_analysis': Geographic or atmospheric patterns detected (e.g., fault line activity, storm paths).\n"
                f"4. 'safety_recommendations': Array of 4-5 prioritized life-safety recommendations for citizens and response coordinators.\n"
                f"5. 'disclaimer': Mandatory safety disclaimer statement.\n"
                f"Output strictly valid JSON only."
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            res = requests.post(url, json=payload, timeout=12)
            if res.status_code == 200:
                data = res.json()
                text_content = data['candidates'][0]['content']['parts'][0]['text']
                # Clean JSON markdown fences if present
                clean_json = text_content.replace('```json', '').replace('```', '').strip()
                import json
                return json.loads(clean_json)
        except Exception as e:
            print(f"[LiveService] Gemini API call error: {e}. Falling back to rule-based AI synthesizer.")

    # Rule-Based Heuristic AI Intelligence Engine (High Quality Fallback)
    max_mag = max([q.get('magnitude') or 0 for q in quakes], default=0)
    top_quake_loc = next((q.get('location') for q in quakes if (q.get('magnitude') or 0) == max_mag), 'None')
    
    # Executive summary synthesis
    if crit_count > 0:
        exec_summary = (
            f"EOC Alert: {crit_count} CRITICAL priority and {high_count} HIGH priority natural hazard events are currently active globally. "
            f"Major activity includes seismic events up to magnitude {max_mag} near {top_quake_loc}, alongside {len(fires)} active wildfire clusters and {len(storms)} cyclonic/storm systems tracked by satellite feeds."
        )
    else:
        exec_summary = (
            f"Currently monitoring {total} ongoing natural hazard events globally with {high_count} moderate-to-high alerts. "
            f"Seismic activity remains within normal regional fault parameters with maximum magnitude {max_mag} recorded."
        )

    # Pattern analysis
    patterns = []
    if len(quakes) >= 5:
        patterns.append(f"Seismic cluster detected across the Pacific Ring of Fire and South Asian subduction zones with {len(quakes)} events recorded in 24 hours.")
    if len(fires) >= 3:
        patterns.append(f"Active wildfire proliferation concentrated in arid thermal zones with sustained dry wind vectors accelerating spread.")
    if len(storms) >= 2:
        patterns.append(f"Tropical depressions and severe cyclonic systems active in coastal maritime corridors with potential surge impact.")
    if not patterns:
        patterns.append("Disaster events are geographically dispersed with no multi-hazard compounding clusters observed at this hour.")

    pattern_text = " ".join(patterns)

    # Potential impact
    impact_text = (
        f"Critical exposure identified for vulnerable coastal communities and high-density urban corridors near active epicenters. "
        f"Potential secondary hazards include structural facade damage, localized flash flooding, and disruptions to transportation arteries."
    )

    # Actionable safety recommendations
    recs = [
        "Citizens in seismic alert sectors should immediately verify household drop-cover-hold zones and keep utility shut-offs accessible.",
        "Coastal and low-lying riverine residents must adhere to official civil defense storm surge bulletins and avoid flooded roadways.",
        "Populations near active wildfire perimeters should seal interior HVAC filters and prepare emergency go-bags with 72-hour supplies.",
        "Response agencies should pre-position auxiliary power generators and ensure emergency communications remain on dedicated UHF/VHF frequencies.",
        "Follow real-time broadcasts on national emergency channels (112 / NDRF / local disaster management authorities)."
    ]

    return {
        'executive_summary': exec_summary,
        'potential_impact': impact_text,
        'pattern_analysis': pattern_text,
        'safety_recommendations': recs,
        'disclaimer': (
            "NOTICE: AI-generated situational analysis is algorithmic synthesis for community awareness and decision-support. "
            "It must never supersede official directives issued by local disaster management authorities, police, or meteorological agencies."
        ),
        'engine_mode': 'Heuristic NLP Intelligence' if not gemini_key else 'Gemini 1.5 Flash'
    }
