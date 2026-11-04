# DisasterAI – Intelligent Disaster Response and Management System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.1-green.svg)](https://flask.palletsprojects.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TailwindCSS-61dafb.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn%20%7C%20TF--IDF-orange.svg)](https://scikit-learn.org/)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet%20%2B%20OpenStreetMap-199900.svg)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/Project-B.Tech%20CSE%20Capstone-red.svg)]()

> **DisasterAI** is a modern, social-good AI-powered web platform engineered to empower communities and emergency response agencies to identify, report, monitor, and coordinate disaster response. By applying Natural Language Processing (NLP) and multi-factor severity estimation, DisasterAI accelerates incident triage, provides life-saving verified safety guidance, and visualizes incidents geospatially on an interactive Leaflet map.

---

## 📌 Project Architecture

```
DisasterAI/
├── backend/
│   ├── app.py                      # Flask Application entry point, Blueprints & SPA server
│   ├── config.py                   # App configurations, secrets, and file upload rules
│   ├── models.py                   # SQLAlchemy ORM models (User, Incident)
│   ├── requirements.txt            # Python dependencies
│   ├── seed_data.py                # Database seeder with realistic demo incidents & accounts
│   ├── ml/
│   │   ├── disaster_data.csv       # Synthetic labeled disaster dataset (900+ samples)
│   │   ├── disaster_classifier.py  # Inference engine with TF-IDF, confidence, & severity rules
│   │   ├── train_model.py          # Training script (TF-IDF + Logistic Regression)
│   │   └── model_artifacts.joblib  # Serialized Scikit-learn pipeline & class labels
│   ├── routes/
│   │   ├── auth.py                 # POST /api/auth/register, /login, GET /me
│   │   ├── incidents.py            # Incident CRUD + CSV export + Image upload
│   │   ├── ai.py                   # POST /api/ai/classify, /severity, /recommendations
│   │   └── analytics.py            # GET /api/analytics
│   └── uploads/                    # User-uploaded disaster evidence photographs
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # REST API client & JWT token management
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Responsive navigation & emergency hotline banner
│   │   │   ├── LandingPage.jsx     # Hero, awareness metrics, features, & preparedness
│   │   │   ├── DisasterMap.jsx     # Leaflet OpenStreetMap with severity color-coded markers
│   │   │   ├── ReportForm.jsx      # Incident form with live NLP classification & GPS
│   │   │   ├── AdminDashboard.jsx  # Incident triage table, status review & deletion
│   │   │   ├── AnalyticsView.jsx   # Recharts charts: categories, severity, monthly trends
│   │   │   ├── SafetyGuide.jsx     # Verified safety guidance for all disaster types
│   │   │   ├── AuthModal.jsx       # Login/Register with 1-click Demo Admin/Citizen buttons
│   │   │   └── IncidentDetailModal.jsx # Detailed modal with AI metrics & checklist
│   │   ├── App.jsx                 # Main application state and layout
│   │   ├── index.css               # Tailwind CSS styles & Leaflet dark theme customizations
│   │   └── main.jsx                # React root mount
│   ├── dist/                       # Optimized production build bundle (served by Flask)
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite configuration with API proxy and Tailwind plugin
├── run_disaster_ai.bat             # One-click Windows application launcher
└── README.md                       # Comprehensive documentation
```

---

## 🚀 Key Features

1. **AI Natural Language Disaster Classification**:
   - Incident descriptions are vectorized using **TF-IDF** (unigram + bigram features with sublinear term-frequency scaling).
   - Classified across 6 multi-class disaster categories: **Flood, Earthquake, Fire, Cyclone, Landslide, Other**.
   - Outputs calibrated class probabilities and percentage confidence.
   - Allows users to accept or override the predicted category.

2. **Multi-Factor Disaster Severity Assessment**:
   - Synthesizes casualty keywords (`trapped`, `collapse`, `fatalities`, `submerged`), estimated population affected, and infrastructure damage level (`Minor`, `Moderate`, `Severe`, `Catastrophic`).
   - Categorizes severity into **LOW, MEDIUM, HIGH, CRITICAL** with a composite 0–100 score.
   - Transparently highlights estimation disclaimers.

3. **Interactive Geospatial Map (Leaflet & OpenStreetMap)**:
   - Visualizes incidents on OpenStreetMap with severity color-coded glowing markers:
     - 🔴 **CRITICAL** (Red with ping animation)
     - 🟠 **HIGH** (Orange)
     - 🟡 **MEDIUM** (Yellow)
     - 🔵 **LOW** (Blue)
   - Real-time filters for disaster category, severity, status, and freeform search.

4. **Community Incident Reporting Form**:
   - Geotagging with browser GPS coordinate capture or quick regional presets.
   - Real-time "Run AI Classification" button for instant NLP feedback.
   - Image upload with client-side preview thumbnail.

5. **Operational Administrative Triage Dashboard**:
   - Review citizen reports.
   - Verify reports and adjust operational status (`Active`, `Under Review`, `Verified`, `Resolved`).
   - Modify severity post-inspection and append administrative field notes.
   - Remove inappropriate or duplicate reports.
   - Role-protected with JWT authorization.

6. **Interactive Analytics & Reports (Recharts)**:
   - Disaster category frequency bar charts.
   - Severity level breakdown charts.
   - Status distribution donut chart.
   - Monthly incident and resolution timeline area chart.
   - One-click CSV dataset export.

7. **Verified Public Safety Guidelines**:
   - Step-by-step actionable protocols for Flood, Earthquake, Fire, Cyclone, Landslide, and Hazmat situations.
   - National emergency helpline ribbon (Dial **112**).

---

## 🔑 Demonstration Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@disasterai.org` | `Admin@123` | Full incident verification, status edit, delete, export |
| **Citizen** | `citizen@disasterai.org` | `Citizen@123` | Community reporting, live map exploration, safety guides |

> 💡 *Both demo profiles can also be signed into with a single click using the "Instant Demo Profiles" buttons on the sign-in modal.*

---

## 🛠️ Installation & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### Step 1: Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 2: (Optional) Retrain ML Model
```bash
python backend/ml/train_model.py
```
*Outputs: 900+ labeled samples into `backend/ml/disaster_data.csv` and serialized pipeline into `backend/ml/model_artifacts.joblib`.*

### Step 3: Seed Database with Demo Incidents & Users
```bash
python backend/seed_data.py
```

### Step 4: Run the Application

#### Option A: One-Click Windows Launcher (Fastest)
Double-click `run_disaster_ai.bat` in the root folder. It starts the Flask server and opens `http://127.0.0.1:5000` in your default browser.

#### Option B: Standalone Production Mode (Single Command)
```bash
python backend/app.py
```
Then visit: **http://127.0.0.1:5000**

#### Option C: Dual-Server Development Mode
- **Terminal 1 (Backend API):**
  ```bash
  python backend/app.py
  ```
- **Terminal 2 (Frontend Dev Server with Hot-Reload):**
  ```bash
  cd frontend
  npm run dev
  ```
  Then visit: **http://localhost:5173**

---

## 📡 REST API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | `GET` | Public | System status, model loading state, and version |
| `/api/auth/register` | `POST` | Public | Create new user account |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/api/auth/me` | `GET` | Bearer | Get current authenticated user profile |
| `/api/incidents` | `GET` | Public | List incidents with category, severity, status filters |
| `/api/incidents` | `POST` | Optional | Submit disaster incident report (JSON or Multipart) |
| `/api/incidents/<id>` | `GET` | Public | Get incident details & real-time safety recommendations |
| `/api/incidents/<id>` | `PUT` | Bearer | Update incident status/severity (Admin only) |
| `/api/incidents/<id>` | `DELETE` | Admin | Delete incident report |
| `/api/incidents/export/csv` | `GET` | Public | Export all disaster records as CSV |
| `/api/ai/classify` | `POST` | Public | Run TF-IDF NLP classification and severity score |
| `/api/ai/severity` | `POST` | Public | Multi-factor severity evaluation |
| `/api/analytics` | `GET` | Public | Aggregate counts, category/severity distributions, trends |

---

## 🧪 Machine Learning Details

- **Dataset**: `backend/ml/disaster_data.csv` contains 900 diverse, labeled disaster descriptions across 6 categories.
- **Feature Extraction**: `TfidfVectorizer` (unigrams + bigrams, `max_features=6000`, `sublinear_tf=True`, `min_df=2`).
- **Classifier**: Multi-class Multinomial Logistic Regression with L2 regularization (`C=2.0`, `solver='lbfgs'`).
- **Cross-Validation Accuracy**: Evaluated with 5-fold stratified cross-validation.
- **Severity Heuristic**: Multi-factor rule-based scoring (Text keywords + Affected population tier + Infrastructure damage magnitude).

---

## ⚖️ Social Good & Ethical Transparency

- **Academic Demonstration**: Demonstration records are transparently marked with an `is_demo` indicator.
- **No False Authority**: DisasterAI explicitly communicates that model predictions and community reports are algorithmic estimates for rapid awareness and do not replace official emergency services.
- **Helpline Notice**: Prominently displays emergency contact numbers (National **112**, Fire **101**, Ambulance **108**).

---
*Developed for B.Tech CSE Artificial Intelligence and Machine Learning Capstone / Mini-Project.*
