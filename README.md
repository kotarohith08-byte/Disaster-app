# DisasterAI – Real-Time Disaster Monitoring & Intelligence Platform

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask 3.1](https://img.shields.io/badge/Backend-Flask%203.1-green.svg)](https://flask.palletsprojects.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TailwindCSS-61dafb.svg)](https://react.dev/)
[![Live Telemetry](https://img.shields.io/badge/Live%20Feeds-USGS%20%7C%20NASA%20%7C%20GDACS-red.svg)]()
[![OpenStreetMap](https://img.shields.io/badge/GIS-Leaflet%20%2B%20OpenStreetMap-199900.svg)](https://leafletjs.com/)

> **DisasterAI** is an advanced, real-time emergency monitoring and intelligence platform. It ingests live global telemetry from the **USGS Earthquake Hazards Program**, **NASA EONET Satellite Tracker**, **GDACS (UN/EC Global Disaster Alert and Coordination System)**, and **Open-Meteo Atmospheric Sensors**, combined with an **AI Natural Language Disaster Classifier**, multi-factor severity scoring, and an interactive GIS operations map.

---

## 🌐 Live External APIs Integrated

| Source | Provider | Data Monitored | Verification Level |
|---|---|---|---|
| **USGS Seismology** | United States Geological Survey | Real-time global earthquakes (M2.5–M9.0+), depth, tsunami alerts | Official Sensor Network |
| **NASA EONET** | NASA Earth Observatory | Active wildfires, severe cyclonic storms, volcanic activity | Earth Observation Satellites |
| **GDACS** | UN OCHA & European Commission | Multi-hazard alerts (Cyclones, Floods, Earthquakes, Droughts) | Official Multi-Agency Warning |
| **Open-Meteo** | Open-Meteo Weather APIs | Global high-resolution weather, wind gusts, heatwaves, extreme rain | WMO Numerical Weather Models |

---

## 🚀 Platform Capabilities

1. **Continuous Real-Time Telemetry & Automatic Polling**:
   - Ingests and normalizes live disaster events from official public feeds.
   - Intelligent 2-minute server-side caching (`live_disaster_service.py`) protects against third-party rate limits.
   - Frontend auto-polls every 60 seconds without requiring manual page reloads.
   - Visual status beacon indicates live connection state (`FEEDS ONLINE` vs `DEGRADED`) and seconds since last telemetry sync.

2. **Interactive Live GIS Disaster Map (Global & India Focus)**:
   - High-performance Leaflet OpenStreetMap canvas.
   - Filter by Category (Earthquakes, Wildfires, Cyclones, Floods, Landslides).
   - Filter by Severity (🔴 CRITICAL, 🟠 HIGH, 🟡 MEDIUM, 🔵 LOW).
   - One-click toggle between **Global Array View** and **India Regional View**.
   - Custom pulsing markers for critical severity events; clicking markers exposes coordinates, magnitude, depth, and official bulletin links.

3. **Regional & Location-Based Disaster Watch**:
   - City and region search powered by Open-Meteo Geocoding.
   - Optional browser GPS positioning with explicit user permission.
   - Displays real-time local weather (temperature, humidity, wind, peak gusts) and flags extreme hazards (heatwaves, torrential rainfall, gale winds).
   - Detects all active disaster events within selected radial buffer (500 km, 1000 km, 2500 km) sorted by proximity.

4. **AI Disaster Intelligence & Impact Briefing**:
   - Algorithmic situational assessment synthesizing compounding hazards.
   - Explains vulnerabilities across exposed populations, transit arteries, and critical infrastructure.
   - Identifies geographic patterns (e.g. subduction zone clustering, storm surge paths).
   - Pluggable LLM: Uses Google Gemini API when `GEMINI_API_KEY` is configured, or sophisticated built-in NLP heuristics.

5. **Community Emergency Ingestion & NLP Classifier**:
   - Citizens can submit localized incident reports with photographic evidence.
   - TF-IDF Scikit-Learn NLP model classifies freeform distress text into categories with confidence percentages.
   - Multi-factor severity assessment engine estimates risk score.

6. **Incident Triage & Command Center**:
   - Role-protected administrative dashboard (JWT authentication).
   - Incident audit table with search, status adjustment (`Active`, `Under Review`, `Verified`, `Resolved`), severity review, and CSV data export.

---

## 📁 Project Directory Structure

```
DisasterAI/
├── backend/
│   ├── app.py                      # Flask Application entry point, Blueprints & SPA server
│   ├── config.py                   # App configurations, secrets, and file upload rules
│   ├── models.py                   # SQLAlchemy ORM models (User, Incident)
│   ├── requirements.txt            # Python dependencies
│   ├── seed_data.py                # Database seeder with realistic demo incidents & accounts
│   ├── services/
│   │   └── live_disaster_service.py # Real-time USGS, NASA EONET, GDACS, Open-Meteo aggregator & AI engine
│   ├── routes/
│   │   ├── live.py                 # Live REST APIs (/disasters, /summary, /weather, /alerts, /ai-intelligence)
│   │   ├── auth.py                 # User/Admin registration, login, JWT verification
│   │   ├── incidents.py            # Community incident CRUD & CSV export
│   │   ├── ai.py                   # Incident NLP classification & severity scoring
│   │   └── analytics.py            # Historical platform statistics
│   └── ml/
│       ├── disaster_data.csv       # 900+ labeled disaster report dataset
│       ├── disaster_classifier.py  # TF-IDF inference engine & severity rules
│       ├── train_model.py          # Scikit-learn model training script
│       └── model_artifacts.joblib  # Serialized pipeline
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # REST API client & CORS-friendly direct fallback
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Live EOC status header, auto-sync timer & navigation
│   │   │   ├── LiveAlertBanner.jsx # Top critical broadcast banner & browser notification prompt
│   │   │   ├── LiveMonitoringDashboard.jsx # EOC operations center dashboard with live KPI & charts
│   │   │   ├── DisasterMap.jsx     # Interactive Leaflet map with global/India views & live markers
│   │   │   ├── LocationMonitor.jsx # City search, GPS positioning, weather, & radius alerts
│   │   │   ├── AiIntelligenceView.jsx # AI executive briefing, impact & pattern analysis
│   │   │   ├── ReportForm.jsx      # Citizen reporting with real-time NLP classification
│   │   │   ├── AdminDashboard.jsx  # Incident triage table, status review & deletion
│   │   │   ├── SafetyGuide.jsx     # Verified safety guidance for all disaster types
│   │   │   ├── AuthModal.jsx       # 1-click Demo Admin/Citizen authentication
│   │   │   └── IncidentDetailModal.jsx # Detailed modal with sensor attribution
│   │   ├── App.jsx                 # Main state, automatic 60s polling loop, & layout
│   │   └── index.css               # Tailwind CSS & Leaflet dark theme styling
│   └── dist/                       # Production frontend build
├── docs/                           # Built bundle for GitHub Pages hosting (.nojekyll)
├── run_disaster_ai.bat             # One-click Windows application launcher
└── README.md                       # Comprehensive documentation
```

---

## 🔑 Test Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@disasterai.org` | `Admin@123` | Full incident verification, status edit, delete, export |
| **Citizen** | `citizen@disasterai.org` | `Citizen@123` | Community reporting, live map exploration, safety guides |

*(Both accounts can also be logged into with a single click via the "Instant Demo Profiles" buttons)*

---

## 🛠️ How to Run Locally

### Option 1: One-Click Windows Launcher (Fastest)
Double-click [`run_disaster_ai.bat`](file:///c:/Users/HP/Downloads/Proofly%20(2)/run_disaster_ai.bat). It automatically validates the database, starts the Flask server, and opens **http://127.0.0.1:5000** in your browser.

### Option 2: Command Line
```powershell
# Navigate to the project root
cd "C:\Users\HP\Downloads\Proofly (2)"

# Run backend (serves both REST API and compiled React SPA)
python backend/app.py
```
Open **http://127.0.0.1:5000** in your web browser.

### Option 3: Development Mode (Vite Hot-Reload)
- **Terminal 1:** `python backend/app.py`
- **Terminal 2:** `cd frontend && npm run dev` (Access at **http://localhost:5173**)

---

## ⚙️ Environment Variables (Optional)

Create a `.env` file in the root directory if you wish to customize secrets:

```ini
# Flask & Security
SECRET_KEY=disaster-ai-super-secret-key-capstone-2026
JWT_SECRET_KEY=disaster-ai-jwt-secret-key-btech-2026
PORT=5000

# Optional: LLM for deep AI situational briefings (falls back gracefully if omitted)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## ⚖️ Ethics & Public Safety Disclaimer

- **No False Predictions**: DisasterAI clearly distinguishes verified official sensor feeds (USGS, NASA, GDACS) from automated community submissions.
- **Advisory Role**: Algorithmic severity scores and AI summaries are designed for rapid situation awareness and never supersede directives from national disaster management agencies.
- **Emergency Helplines**: Users in acute danger are directed to dial **112** (National Emergency Dispatch).
