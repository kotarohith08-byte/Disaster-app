"""
Seed Database with Demo Accounts and Verified Realistic Demonstration Disaster Incidents
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import json
from datetime import datetime, timedelta
from backend.app import create_app
from backend.models import User, Incident

DEMO_INCIDENTS = [
    {
        "title": "Severe Urban Flash Floods and Road Inundation",
        "description": "Continuous heavy torrential rain measuring 180mm over 6 hours has caused stormwater drains to back up. Several residential ground-floor houses and arterial roads submerged under 4 feet of water with marooned citizens.",
        "category": "Flood",
        "predicted_category": "Flood",
        "prediction_confidence": 98.4,
        "severity": "CRITICAL",
        "severity_score": 88.5,
        "location": "Kurla West, Mumbai, Maharashtra",
        "latitude": 19.0657,
        "longitude": 72.8797,
        "affected_people": 450,
        "infrastructure_damage": "Severe",
        "status": "Active",
        "created_days_ago": 1
    },
    {
        "title": "Magnitude 6.1 Seismic Tremors and Wall Cracks",
        "description": "Strong earthquake shockwaves shook high-rise buildings and commercial complexes. Plaster collapsed, window panes shattered, and structural cracks noticed along apartment support pillars. Residents evacuated to open grounds.",
        "category": "Earthquake",
        "predicted_category": "Earthquake",
        "prediction_confidence": 97.2,
        "severity": "HIGH",
        "severity_score": 72.0,
        "location": "Dehradun Valley, Uttarakhand",
        "latitude": 30.3165,
        "longitude": 78.0322,
        "affected_people": 120,
        "infrastructure_damage": "Severe",
        "status": "Under Review",
        "created_days_ago": 2
    },
    {
        "title": "Industrial Warehouse Chemical Fire",
        "description": "Massive fire broke out inside a solvent storage depot. Towering flames and dense toxic black smoke plume billowing across nearby residential neighborhood. 8 fire tenders battling the blaze.",
        "category": "Fire",
        "predicted_category": "Fire",
        "prediction_confidence": 99.1,
        "severity": "CRITICAL",
        "severity_score": 92.0,
        "location": "Manali Industrial Area, Chennai, Tamil Nadu",
        "latitude": 13.1654,
        "longitude": 80.2608,
        "affected_people": 280,
        "infrastructure_damage": "Catastrophic",
        "status": "Active",
        "created_days_ago": 0
    },
    {
        "title": "Cyclone Landfall with 160 km/h Gale Winds",
        "description": "Severe tropical cyclonic storm eye nearing coast. Fierce gale-force winds uprooted trees, bent electric utility poles, and ripped tin roofs. Coastal surge inundating low-lying fishing hamlets.",
        "category": "Cyclone",
        "predicted_category": "Cyclone",
        "prediction_confidence": 96.8,
        "severity": "CRITICAL",
        "severity_score": 95.0,
        "location": "Puri Coastal Belt, Odisha",
        "latitude": 19.8135,
        "longitude": 85.8312,
        "affected_people": 1200,
        "infrastructure_damage": "Catastrophic",
        "status": "Active",
        "created_days_ago": 1
    },
    {
        "title": "Major Highway Landslide and Mudflow",
        "description": "Incessant monsoon rains triggered massive hill slope collapse. Tons of boulders and mud debris have blocked National Highway, stranding tourist vehicles and cutting off communication.",
        "category": "Landslide",
        "predicted_category": "Landslide",
        "prediction_confidence": 98.9,
        "severity": "HIGH",
        "severity_score": 68.0,
        "location": "Wayanad Ghat Pass, Kerala",
        "latitude": 11.6854,
        "longitude": 76.1320,
        "affected_people": 95,
        "infrastructure_damage": "Moderate",
        "status": "Verified",
        "created_days_ago": 3
    },
    {
        "title": "Suburban Forest Brush Fire",
        "description": "Rapidly moving brush fire ignited along hillside pine forests due to dry heatwave conditions. Smoldering embers jumping across firebreak roads; firefighters establishing containment trenches.",
        "category": "Fire",
        "predicted_category": "Fire",
        "prediction_confidence": 95.5,
        "severity": "MEDIUM",
        "severity_score": 52.0,
        "location": "Kasauli Hills, Himachal Pradesh",
        "latitude": 30.9013,
        "longitude": 76.9649,
        "affected_people": 30,
        "infrastructure_damage": "Moderate",
        "status": "Verified",
        "created_days_ago": 4
    },
    {
        "title": "River Embankment Breach Flooding Farmland",
        "description": "River Brahmaputra water level exceeded danger mark by 1.2 meters, breaching earthen dyke. Floodwaters submerged paddy fields and primary school compound.",
        "category": "Flood",
        "predicted_category": "Flood",
        "prediction_confidence": 97.6,
        "severity": "HIGH",
        "severity_score": 76.0,
        "location": "Kaziranga Basin, Assam",
        "latitude": 26.5775,
        "longitude": 93.1711,
        "affected_people": 350,
        "infrastructure_damage": "Moderate",
        "status": "Active",
        "created_days_ago": 2
    },
    {
        "title": "Industrial Ammonia Leak from Cold Storage",
        "description": "High pressure valve burst released pungent ammonia vapor into surrounding area. Citizens experiencing acute respiratory irritation and watering eyes. Hazmat perimeter established.",
        "category": "Other",
        "predicted_category": "Other",
        "prediction_confidence": 91.2,
        "severity": "HIGH",
        "severity_score": 65.0,
        "location": "Kalyani Industrial Estate, West Bengal",
        "latitude": 22.9751,
        "longitude": 88.4345,
        "affected_people": 150,
        "infrastructure_damage": "Minor",
        "status": "Verified",
        "created_days_ago": 5
    },
    {
        "title": "Moderate Tremor Shakes Capital Region",
        "description": "Mild earthquake measuring magnitude 4.8 epicentered 50km southwest felt across high-rises. Shaking lasted 12 seconds with swinging chandeliers. No structural casualties reported.",
        "category": "Earthquake",
        "predicted_category": "Earthquake",
        "prediction_confidence": 94.0,
        "severity": "LOW",
        "severity_score": 32.0,
        "location": "Connaught Place, New Delhi",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "affected_people": 0,
        "infrastructure_damage": "None",
        "status": "Resolved",
        "created_days_ago": 7
    },
    {
        "title": "Mountain Rockfall Damaging Secondary Roadway",
        "description": "Falling boulders dislodged by heavy showers damaged road guardrails and blocked single-lane bridge access. Local public works teams deployed backhoes.",
        "category": "Landslide",
        "predicted_category": "Landslide",
        "prediction_confidence": 96.0,
        "severity": "MEDIUM",
        "severity_score": 45.0,
        "location": "Munnar Mountain Route, Kerala",
        "latitude": 10.0889,
        "longitude": 77.0595,
        "affected_people": 15,
        "infrastructure_damage": "Moderate",
        "status": "Resolved",
        "created_days_ago": 8
    },
    {
        "title": "Severe Coastal Squall and Jetty Flooding",
        "description": "Depression over Arabian sea brought strong squall winds of 90 km/h with 3-meter swells splashing over coastal promenade and fishermen jetties.",
        "category": "Cyclone",
        "predicted_category": "Cyclone",
        "prediction_confidence": 93.5,
        "severity": "MEDIUM",
        "severity_score": 48.0,
        "location": "Panaji Coastal Sector, Goa",
        "latitude": 15.4909,
        "longitude": 73.8278,
        "affected_people": 25,
        "infrastructure_damage": "Minor",
        "status": "Resolved",
        "created_days_ago": 10
    },
    {
        "title": "Commercial Plaza Electrical Basement Fire",
        "description": "Transformer spark ignited cable duct in shopping center basement. Quick response from building fire sprinklers and local fire station contained blaze before spreading.",
        "category": "Fire",
        "predicted_category": "Fire",
        "prediction_confidence": 98.0,
        "severity": "LOW",
        "severity_score": 28.0,
        "location": "Indiranagar, Bengaluru, Karnataka",
        "latitude": 12.9719,
        "longitude": 77.6412,
        "affected_people": 0,
        "infrastructure_damage": "Minor",
        "status": "Resolved",
        "created_days_ago": 12
    }
]

def seed_database():
    app = create_app()
    with app.app_context():
        session = app.db_session()
        try:
            print("[Seed] Checking existing demo users...")
            admin_user = session.query(User).filter_by(email='admin@disasterai.org').first()
            if not admin_user:
                admin_user = User(
                    name="Disaster Operations Admin",
                    email="admin@disasterai.org",
                    role="admin"
                )
                admin_user.set_password("Admin@123")
                session.add(admin_user)
                print("       Created Admin: admin@disasterai.org / Admin@123")

            citizen_user = session.query(User).filter_by(email='citizen@disasterai.org').first()
            if not citizen_user:
                citizen_user = User(
                    name="Alex Citizen",
                    email="citizen@disasterai.org",
                    role="user"
                )
                citizen_user.set_password("Citizen@123")
                session.add(citizen_user)
                print("       Created Citizen: citizen@disasterai.org / Citizen@123")

            session.commit()

            print("[Seed] Checking existing disaster incidents...")
            count = session.query(Incident).count()
            if count == 0:
                print(f"       Seeding {len(DEMO_INCIDENTS)} realistic demo disaster incidents...")
                now = datetime.utcnow()
                for item in DEMO_INCIDENTS:
                    created_at = now - timedelta(days=item['created_days_ago'], hours=3)
                    
                    # Generate realistic factors json
                    factors = {
                        "impact_text_score": 30 if item['severity'] in ['CRITICAL', 'HIGH'] else 15,
                        "population_impact_score": 25 if item['affected_people'] > 100 else 10,
                        "infrastructure_damage_score": 20 if item['infrastructure_damage'] in ['Severe', 'Catastrophic'] else 8,
                        "computed_category": item['category'],
                        "disclaimer": "DEMONSTRATION RECORD: Synthetic demo record created for academic system evaluation."
                    }

                    inc = Incident(
                        title=item['title'],
                        description=item['description'],
                        category=item['category'],
                        predicted_category=item['predicted_category'],
                        prediction_confidence=item['prediction_confidence'],
                        severity=item['severity'],
                        severity_score=item['severity_score'],
                        severity_factors=json.dumps(factors),
                        location=item['location'],
                        latitude=item['latitude'],
                        longitude=item['longitude'],
                        status=item['status'],
                        affected_people=item['affected_people'],
                        infrastructure_damage=item['infrastructure_damage'],
                        user_id=citizen_user.id if citizen_user else None,
                        is_demo=1,
                        created_at=created_at,
                        updated_at=created_at
                    )
                    session.add(inc)

                session.commit()
                print(f"       Successfully seeded {len(DEMO_INCIDENTS)} demonstration incidents.")
            else:
                print(f"       Database already contains {count} incidents. Skipping demo incidents seeding.")

        except Exception as e:
            session.rollback()
            print(f"[Seed] Error seeding database: {e}")
        finally:
            session.close()

if __name__ == '__main__':
    seed_database()
