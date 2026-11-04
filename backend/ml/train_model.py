"""
DisasterAI - Machine Learning Model Training Script
Trains a TF-IDF vectorizer + Logistic Regression classifier on labeled disaster reports.
Generates disaster_data.csv and outputs trained model artifacts to model_artifacts.joblib.
"""

import os
import re
import random
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'disaster_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'model_artifacts.joblib')

# Template components for synthetic realistic disaster incident reports
SYNTHETIC_TEMPLATES = {
    'Flood': [
        "Incessant heavy rains have caused the {river} to overflow, submerging low-lying residential sectors under 5 feet of water.",
        "Flash floods triggered by cloudburst have inundated {location}. Roads are completely submerged and vehicles swept away.",
        "Dam floodgates opened to release surplus water, causing riverbanks to breach and flooding {number} villages downstream.",
        "Severe waterlogging reported near {location}. Residents marooned in ground-floor houses, requesting emergency rescue boats.",
        "Continuous torrential downpours have submerged railway tracks and highway underpasses. Commuters stranded in knee-deep water.",
        "Heavy monsoon deluge has inundated agricultural fields and residential colonies. Electricity cut off to prevent electrocution.",
        "Drainage canals have overflowed into commercial markets in {location}. Shopkeepers salvaging inventory from muddy floodwaters.",
        "Rising river water levels have submerged primary bridges and cut off road access to {location}. Emergency shelter relief requested.",
        "Flash flooding in urban storm drains has caused basement flooding across multiple apartment complexes.",
        "Dike breached along coastal creek during high tide, sea water entering freshwater drinking ponds and residential huts.",
        "Severe flooding in river basin has displaced hundreds of families. Drinking water supply contaminated.",
        "Water level touching danger mark at {location} barrage. Low-lying colonies being evacuated with rubber boats."
    ],
    'Earthquake': [
        "A strong seismic tremor measuring magnitude {magnitude} struck near {location}, shaking buildings violently for 35 seconds.",
        "Severe earthquake felt across the region. Multiple multi-story buildings have developed structural cracks and shattered windows.",
        "Moderate tremor felt with rumbling underground noise. Residents rushed out of high-rise apartment towers in total panic.",
        "Major earthquake of magnitude {magnitude} collapsed old brick masonry structures. Rubble blocking main thoroughfares.",
        "Continuous aftershocks shaking {location} after morning seismic event. People fearful of returning indoors.",
        "Tectonic tremor caused plaster and ceiling fans to collapse in schools and hospitals. First responders evaluating integrity.",
        "Shallow earthquake measuring {magnitude} has flattened unreinforced stone homes in rural hills. Search for trapped survivors underway.",
        "Fissures observed along road tarmac and sidewalk pavements following intense seismic ground motion in {location}.",
        "Tremors rattled windows and shook office furniture violently. Emergency stairwell evacuation completed without stampede.",
        "Deep earthquake epicentered 40 km off {location}. Coastal shaking triggered automatic safety shutdown of power stations.",
        "Seismic vibrations caused boundary walls to crumble and water storage tanks to dislodge from rooftops.",
        "Series of earthquake foreshocks reported by seismological department. Citizens advised to review drop, cover, and hold procedures."
    ],
    'Fire': [
        "Massive structural blaze broke out inside a chemical warehouse at {location}. Huge columns of thick black toxic smoke visible.",
        "Wildfire spreading rapidly across dry forest brush fanned by strong winds. Flames threatening suburban residential outskirts.",
        "Commercial complex fire ignited on the 4th floor due to electrical short circuit. Fire engines battling towering flames.",
        "Commercial timber depot caught fire in {location}. Blazing inferno spreading to adjacent commercial establishments.",
        "Apartment block fire trapped residents in upper corridors. Firefighters deploying snorkel ladders to rescue families.",
        "LPG cylinder blast sparked an aggressive fire in crowded slum cluster. Over {number} shanties destroyed within minutes.",
        "Hospital basement generator room fire filled emergency wards with dense smoke. Patient evacuation underway.",
        "Industrial factory fire raging uncontrollably after boiler burst. Fire tender foam units rushed from neighboring stations.",
        "Brush fire ignited along highway median and jumping into adjacent pine groves due to dry arid heatwave.",
        "Fire engulfed textile market godown at midnight. Firefighters cutting through metal shutters to access seat of blaze.",
        "Oil tanker truck collided and exploded into flames on bypass road, setting surrounding vegetation ablaze.",
        "Raging fire at plastic recycling plant releasing hazardous acrid fumes across residential neighborhoods."
    ],
    'Cyclone': [
        "Severe cyclonic storm '{storm_name}' intensifying over sea with ferocious gale winds clocking {wind_speed} km/h.",
        "Cyclone landfall underway near {location}. Violent squalls ripping tin roofs, shattering hoardings, and uprooting trees.",
        "Massive coastal storm surge driven by cyclone has breached sea walls and inundated fishing hamlets.",
        "Gale-force winds and torrential blinding rain knocking down high-tension electrical transmission towers and telecom poles.",
        "Extremely severe cyclone moving towards coastal district with central pressure dropping rapidly. Fishermen warned to return.",
        "Cyclone winds have uprooted century-old banyan trees, crushing parked cars and blocking arterial roads.",
        "Coastal district experiencing hurricane-grade winds and storm surges inundating harbor jetties and fish landing centers.",
        "The calm eye of cyclone passed over {location}, followed by sudden ferocious reversal of gale winds and torrential rain.",
        "Pre-cyclone squalls have severed power grids and fiber internet lines. Civil defense teams prepositioned at relief centers.",
        "Category 3 tropical cyclone causing roof damage to concrete school buildings and stripping foliage from trees.",
        "Severe cyclonic depression bringing unceasing 140 km/h wind gusts and flash storm waves onto the promenade.",
        "Cyclone warnings upgraded to red alert. Coastal population relocated to multi-purpose cyclone shelters."
    ],
    'Landslide': [
        "Massive landslide and rockfall triggered by heavy rain has blocked the National Highway near {location}, stranding vehicles.",
        "Hillside slope gave way burying several roadside houses and tourist tea stalls under tons of mud and boulders.",
        "Debris flow containing slush, gravel, and fallen timber has crashed onto the mountain village roadway.",
        "Major landslide occurred along mountain railway track. Earth-moving excavators mobilized to clear the tracks.",
        "Torrential downpour induced slope failure on hillside terraced settlement. Cracks spreading through mountain road shoulders.",
        "Rockslide smashed passing delivery truck on ghat road; traffic suspended indefinitely until boulders are blasted.",
        "Soil liquefaction and mudslide cascaded down steep ravine, damming small river and creating upstream reservoir hazard.",
        "Continuous seepage into hill slope caused massive retaining wall collapse onto parking lot below.",
        "Mountain pass cut off after huge slab of granite dislodged from cliff face and pulverized road segment.",
        "Hill slope sliding towards valley following monsoon downpours. Evacuation of slope-adjacent cottages ordered by district magistrate.",
        "Mudslide swept away {number} meters of asphalt highway in hilly region. Border roads organization clearing debris.",
        "Cracking sound heard on mountain ridge followed by tons of earth crashing into valley stream bed."
    ],
    'Other': [
        "Dangerous industrial chlorine gas leak reported from water treatment plant in {location}. Residents reporting burning eyes.",
        "Four-story residential building collapsed suddenly in crowded downtown lane. Sniffer dogs and rescue personnel deployed.",
        "A 30-foot wide sinkhole suddenly caved in at busy central traffic intersection, swallowing utility pipes and road median.",
        "Extreme heatwave alert with ambient temperatures soaring past 47 degrees Celsius. Heat stroke admissions rising.",
        "Severe blizzard and whiteout conditions with sub-zero freezing wind chill paralyzing northern transit routes.",
        "Toxic ammonia vapor leak at cold storage facility forcing immediate evacuation of {number} nearby homes.",
        "Underground pipeline rupture releasing high pressure combustible gas near residential community.",
        "Unprecedented hailstorm with baseball-sized ice pellets damaging vehicle windshields, solar panels, and tile roofs.",
        "Suspicious structural failure of pedestrian footbridge during evening rush hour resulting in pedestrian injuries.",
        "Severe dust storm and haboob with zero visibility causing multi-vehicle pileup on expressway.",
        "Hazardous chemical spill on expressway following tanker rollover; containment teams washing down spill area.",
        "Urban ground subsidence noticed over subway tunneling alignment, causing roadway dips and water main rupture."
    ]
}

LOCATIONS = [
    "North Sector", "Riverbank Colony", "Green Valley Hills", "Coastal Marina", 
    "Industrial Belt", "Downtown Crossing", "Hill Pass Zone", "West Harbour",
    "Southern Ward", "Old City Quarter", "Eastern Bypass", "Mountain Highway",
    "Metro Terminal Hub", "Lakeside Enclave", "Valley Ridge"
]
RIVERS = ["Brahmaputra", "Yamuna", "Ganges", "Godavari", "Cauvery", "Periyar", "Hudson", "Red River"]
STORM_NAMES = ["Amphan", "Fani", "Tauktae", "Biparjoy", "Michaung", "Dana", "Hudhud", "Ockhi"]

def generate_synthetic_dataset(num_samples_per_category=120):
    """
    Generates a realistic, diverse, multi-class labeled dataset for disaster NLP.
    Clearly marks dataset as demonstration synthetic dataset.
    """
    records = []
    for category, templates in SYNTHETIC_TEMPLATES.items():
        for i in range(num_samples_per_category):
            template = random.choice(templates)
            text = template.format(
                location=random.choice(LOCATIONS),
                river=random.choice(RIVERS),
                storm_name=random.choice(STORM_NAMES),
                magnitude=round(random.uniform(4.5, 7.8), 1),
                wind_speed=random.randint(110, 220),
                number=random.randint(5, 80)
            )
            # Add slight realistic noise (optional citizen notes, punctuation)
            variations = [
                f"{text}",
                f"URGENT: {text} Need assistance immediately.",
                f"Emergency update: {text} Please stay safe.",
                f"Local eyewitness report: {text}",
                f"District Alert: {text} Response teams dispatched."
            ]
            final_text = random.choice(variations)
            records.append({
                'text': final_text,
                'category': category,
                'is_demo_synthetic': True
            })

    df = pd.DataFrame(records)
    # Shuffle
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df

def clean_text_fn(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def train_and_export():
    print("=" * 65)
    print("  DisasterAI Machine Learning Pipeline - Capstone Training")
    print("=" * 65)

    print("[1/5] Synthesizing labeled disaster NLP dataset...")
    df = generate_synthetic_dataset(num_samples_per_category=150)
    df.to_csv(DATA_PATH, index=False)
    print(f"      Saved {len(df)} labeled disaster samples to: {DATA_PATH}")

    print("[2/5] Preprocessing incident text reports...")
    df['clean_text'] = df['text'].apply(clean_text_fn)

    X = df['clean_text']
    y = df['category']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"      Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    print("[3/5] Building TF-IDF Vectorizer + Calibrated Logistic Regression pipeline...")
    # TF-IDF with unigrams + bigrams and sublinear term frequency scaling
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=6000,
            sublinear_tf=True,
            min_df=2
        )),
        ('classifier', LogisticRegression(
            C=2.0,
            max_iter=1000,
            solver='lbfgs',
            random_state=42
        ))
    ])

    print("[4/5] Training model and running 5-fold cross-validation...")
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='accuracy')
    print(f"      5-Fold Cross Validation Accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")

    pipeline.fit(X_train, y_train)

    # Evaluation on holdout test set
    y_pred = pipeline.predict(X_test)
    test_acc = accuracy_score(y_test, y_pred)
    print(f"\n      >>> Holdout Test Accuracy: {test_acc * 100:.2f}% <<<")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    print("[5/5] Exporting model bundle to joblib...")
    classes = list(pipeline.named_steps['classifier'].classes_)
    bundle = {
        'pipeline': pipeline,
        'classes': classes,
        'accuracy': float(test_acc),
        'model_type': 'TF-IDF + Multinomial Logistic Regression'
    }
    joblib.dump(bundle, MODEL_PATH)
    print(f"      Model bundle successfully saved to: {MODEL_PATH}")

    # Verify a test sentence
    sample = "The river has overflowed its banks and water has reached 6 feet in residential apartments."
    clean_sample = clean_text_fn(sample)
    probs = pipeline.predict_proba([clean_sample])[0]
    best_idx = np.argmax(probs)
    print("\n--- Sanity Verification on Sample Incident ---")
    print(f"Text: '{sample}'")
    print(f"Predicted Category: {classes[best_idx]} (Confidence: {probs[best_idx] * 100:.2f}%)")
    print("=" * 65)

if __name__ == '__main__':
    train_and_export()
