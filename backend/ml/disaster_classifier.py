import re
import os
import joblib
import numpy as np

SAFETY_RECOMMENDATIONS = {
    'Flood': {
        'general': 'Seek higher ground immediately. Never walk, swim, or drive through flood waters. Turn Around, Don’t Drown!',
        'LOW': [
            'Monitor local weather reports and emergency radio.',
            'Keep drainage channels around your property clear.',
            'Prepare an emergency go-bag with essentials, documents, and medications.'
        ],
        'MEDIUM': [
            'Move critical valuables and electrical items to upper floors.',
            'Avoid basements and low-lying ground level rooms.',
            'Keep emergency phone numbers handy and check in on elderly neighbors.'
        ],
        'HIGH': [
            'Shut off main electricity and gas connections if safe to do so.',
            'Follow official evacuation routes advised by disaster management authorities.',
            'Do not attempt to cross bridges over fast-moving flood waters.'
        ],
        'CRITICAL': [
            'Move immediately to the highest accessible level or roof if trapped.',
            'Signal for rescue using a bright cloth, flashlight, or whistle. Do not enter closed attics without roof access.',
            'Call official emergency distress lines (e.g. 112 / 911 / NDRF helpline).'
        ]
    },
    'Earthquake': {
        'general': 'DROP, COVER, and HOLD ON! Stay away from glass windows, unanchored heavy furniture, and exterior walls.',
        'LOW': [
            'Stay alert for potential minor aftershocks.',
            'Inspect home utilities for minor gas or water leaks.',
            'Secure heavy wall hangings and tall cabinets.'
        ],
        'MEDIUM': [
            'Check yourself and family for injuries and administer first aid.',
            'Extinguish small fires immediately if safe.',
            'Avoid elevators and use staircases cautiously.'
        ],
        'HIGH': [
            'Evacuate structurally damaged buildings immediately with head protection.',
            'Stay in open fields away from power lines, chimneys, and high-rise facades.',
            'Do not re-enter cracked or tilted buildings until certified by structural engineers.'
        ],
        'CRITICAL': [
            'Search and rescue teams must be alerted immediately for trapped victims.',
            'Avoid all partially collapsed structures due to risk of secondary collapse.',
            'Keep telephone lines open for critical emergency calls only.'
        ]
    },
    'Fire': {
        'general': 'Get out, stay out, and call emergency services immediately. Crawl low under smoke where air is cleaner.',
        'LOW': [
            'Extinguish minor trash or brush embers using fire extinguishers or sand.',
            'Report unattended smoke plumes to local fire brigades.',
            'Remove flammable brush and dry leaves from home perimeter.'
        ],
        'MEDIUM': [
            'Close interior doors behind you as you evacuate to slow fire spread.',
            'Never use elevators during a structural fire; use fire escape stairs.',
            'Keep a damp cloth over nose and mouth to filter soot and ash.'
        ],
        'HIGH': [
            'Evacuate immediately in the direction opposite to wind and smoke travel.',
            'Do not return inside for personal belongings or pets once outside.',
            'Notify neighbors and alert local emergency dispatch.'
        ],
        'CRITICAL': [
            'Urgent priority evacuation for entire block/neighborhood.',
            'Set up water curtains and defensive fire lines if directed by emergency responders.',
            'Emergency triage centers should prepare for smoke inhalation and burn care.'
        ]
    },
    'Cyclone': {
        'general': 'Secure roofs, board windows, and stay indoors in the strongest central room away from exterior glass.',
        'LOW': [
            'Trim dead tree branches that could damage power lines or houses.',
            'Stock up on 3-day drinking water, non-perishable food, and battery lamps.',
            'Follow meteorological bulletins for track and intensity updates.'
        ],
        'MEDIUM': [
            'Anchor or bring indoors all outdoor furniture, tin sheets, and loose equipment.',
            'Keep vehicles fueled and parked in covered or sheltered locations away from trees.',
            'Charge power banks, mobile phones, and emergency radios.'
        ],
        'HIGH': [
            'Relocate to designated cyclone shelters or concrete inland structures.',
            'Stay inside during the calm "eye" of the cyclone; ferocious winds resume suddenly from the opposite direction.',
            'Disconnect non-essential electrical appliances.'
        ],
        'CRITICAL': [
            'Mandatory evacuation of low-lying coastal and surge zones.',
            'Remain confined in fortified shelters until civil defense issues the all-clear.',
            'Beware of fallen live electric wires and contaminated water post-landfall.'
        ]
    },
    'Landslide': {
        'general': 'Move away from the path of debris and slide flows immediately. Avoid river valleys and low drainage channels.',
        'LOW': [
            'Watch for signs of ground movement: leaning trees, new road cracks, or muddy stream runoffs.',
            'Ensure drainage channels on slopes are free of obstructions.'
        ],
        'MEDIUM': [
            'Avoid mountain roads and hillside passes during continuous heavy rainfall.',
            'Stay awake and alert during intense storms; many slide fatalities occur while sleeping.'
        ],
        'HIGH': [
            'Evacuate residences located directly below steep cliffs or unreinforced slopes.',
            'Listen for unusual sounds: cracking trees, rumbling boulders, or surging mud.',
            'Inform local public works and highway patrol of slope deformations.'
        ],
        'CRITICAL': [
            'Immediate search and rescue response required for buried roadways and buildings.',
            'Block off highway access to landslide zones to prevent secondary vehicle entrapment.',
            'Beware of flash flooding caused when landslide debris dams a river or stream.'
        ]
    },
    'Other': {
        'general': 'Follow verified civil defense instructions. Keep a safe perimeter and report details to authorities.',
        'LOW': [
            'Stay tuned to official disaster management feeds.',
            'Verify information from official government sources before sharing.'
        ],
        'MEDIUM': [
            'Limit non-essential outdoor travel and stay sheltered.',
            'Report structural hazards or public safety issues to city municipal desks.'
        ],
        'HIGH': [
            'Keep emergency go-kits ready and assist vulnerable individuals nearby.',
            'Follow local curfew or containment protocols.'
        ],
        'CRITICAL': [
            'Full emergency coordination protocol in effect.',
            'Follow directives from local emergency management agency personnel immediately.'
        ]
    }
}

class DisasterAIEngine:
    def __init__(self, model_path=None):
        self.model_path = model_path
        self.pipeline = None
        self.classes = ['Cyclone', 'Earthquake', 'Fire', 'Flood', 'Landslide', 'Other']
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)

    def load_model(self, path):
        try:
            bundle = joblib.load(path)
            self.pipeline = bundle.get('pipeline')
            self.classes = bundle.get('classes', self.classes)
            print(f"[ML Engine] Model loaded successfully from {path}")
        except Exception as e:
            print(f"[ML Engine] Warning: Failed to load model from {path}: {e}")
            self.pipeline = None

    def clean_text(self, text):
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def classify(self, text):
        """
        Predicts disaster category and confidence score.
        If ML model is available, uses TF-IDF + Classifier.
        Otherwise falls back to intelligent baseline keywords with confidence estimation.
        """
        cleaned = self.clean_text(text)
        if not cleaned:
            return {
                'category': 'Other',
                'confidence': 50.0,
                'probabilities': {c: round(100.0 / len(self.classes), 2) for c in self.classes},
                'model_used': 'fallback'
            }

        if self.pipeline is not None:
            try:
                probs = self.pipeline.predict_proba([cleaned])[0]
                classes = list(self.pipeline.classes_)
                best_idx = int(np.argmax(probs))
                best_category = classes[best_idx]
                confidence = float(probs[best_idx]) * 100.0

                prob_dict = {cls_name: round(float(p) * 100.0, 2) for cls_name, p in zip(classes, probs)}

                return {
                    'category': best_category,
                    'confidence': round(confidence, 2),
                    'probabilities': prob_dict,
                    'model_used': 'scikit-learn-tfidf'
                }
            except Exception as e:
                print(f"[ML Engine] Classification error: {e}")

        # Intelligent Rule-Based Baseline (used during bootstrapping before model is saved)
        keyword_scores = {
            'Flood': len(re.findall(r'\b(flood|flooding|water|submerged|overflow|drown|deluge|river|dam|inundat|waterlog)\b', cleaned)),
            'Earthquake': len(re.findall(r'\b(earthquake|tremor|quake|seismic|fault|richter|shaking|magnitude|aftershock|rubble)\b', cleaned)),
            'Fire': len(re.findall(r'\b(fire|wildfire|flame|burn|blaze|smoke|firefighter|engulf|inferno|combust)\b', cleaned)),
            'Cyclone': len(re.findall(r'\b(cyclone|hurricane|typhoon|gale|storm|wind|surge|tropical|gust)\b', cleaned)),
            'Landslide': len(re.findall(r'\b(landslide|mudslide|rockfall|debris|slope|mountain|boulder|hillside)\b', cleaned)),
            'Other': 1
        }
        best_cat = max(keyword_scores, key=keyword_scores.get)
        total_hits = sum(keyword_scores.values())
        raw_conf = (keyword_scores[best_cat] / total_hits) * 100.0 if total_hits > 0 else 55.0
        conf = min(max(raw_conf, 52.0), 96.0)

        return {
            'category': best_cat if keyword_scores[best_cat] > 1 else 'Other',
            'confidence': round(conf, 2),
            'probabilities': {k: round((v / total_hits) * 100.0, 2) for k, v in keyword_scores.items()},
            'model_used': 'rule-based-baseline'
        }

    def assess_severity(self, text, category, affected_people=0, infrastructure_damage='None'):
        """
        Multi-factor rule-based severity assessment module:
        - Textual impact keywords (casualties, trapped, destroyed, hospital, bridge)
        - Population affected count
        - Infrastructure damage magnitude
        - Category-specific baseline urgency
        Returns:
        - severity: LOW, MEDIUM, HIGH, CRITICAL
        - severity_score: 0-100 float
        - factors: breakdown dict
        - recommendations: list of actionable safety tips
        """
        score = 25.0
        factors = {}
        cleaned = self.clean_text(text)

        # 1. Casualty and Critical Urgency Keywords
        critical_keywords = [
            'dead', 'death', 'killed', 'fatalities', 'casualty', 'trapped', 'buried',
            'collapse', 'collapsed', 'mass casualty', 'catastrophic', 'uncontrolled'
        ]
        high_keywords = [
            'injured', 'submerged', 'evacuate', 'evacuation', 'urgent', 'severe',
            'destroyed', 'homeless', 'marooned', 'blaze', 'raging', 'toxic'
        ]
        moderate_keywords = [
            'damaged', 'blocked', 'cut off', 'rising', 'smoke', 'power outage',
            'crack', 'flooded street', 'waterlogging'
        ]

        crit_hits = sum(1 for kw in critical_keywords if re.search(r'\b' + kw, cleaned))
        high_hits = sum(1 for kw in high_keywords if re.search(r'\b' + kw, cleaned))
        mod_hits = sum(1 for kw in moderate_keywords if re.search(r'\b' + kw, cleaned))

        impact_score = min(crit_hits * 22 + high_hits * 12 + mod_hits * 6, 40)
        factors['impact_text_score'] = impact_score
        score += impact_score

        # 2. People Affected Factor
        people = int(affected_people or 0)
        if people >= 500:
            people_score = 30
        elif people >= 100:
            people_score = 22
        elif people >= 25:
            people_score = 14
        elif people >= 5:
            people_score = 8
        else:
            people_score = 2
        factors['population_impact_score'] = people_score
        score += people_score

        # 3. Infrastructure Damage Factor
        infra = (infrastructure_damage or 'None').capitalize()
        infra_map = {
            'Catastrophic': 25,
            'Severe': 18,
            'Moderate': 10,
            'Minor': 5,
            'None': 0
        }
        infra_score = infra_map.get(infra, 5)
        factors['infrastructure_damage_score'] = infra_score
        score += infra_score

        # Cap score between 10 and 100
        score = min(max(score, 10.0), 100.0)

        # Categorize
        if score >= 75:
            severity = 'CRITICAL'
        elif score >= 55:
            severity = 'HIGH'
        elif score >= 35:
            severity = 'MEDIUM'
        else:
            severity = 'LOW'

        factors['computed_category'] = category
        factors['disclaimer'] = (
            "NOTICE: Automated AI severity score is an algorithmic estimate based on reported parameters. "
            "It must not supersede official disaster management directives or verified field assessments."
        )

        recommendations = self.get_recommendations(category, severity)

        return {
            'severity': severity,
            'severity_score': round(score, 1),
            'factors': factors,
            'recommendations': recommendations
        }

    def get_recommendations(self, category, severity):
        cat_data = SAFETY_RECOMMENDATIONS.get(category, SAFETY_RECOMMENDATIONS['Other'])
        general = cat_data.get('general', '')
        specific = cat_data.get(severity, cat_data.get('MEDIUM', []))
        return {
            'general_guidance': general,
            'action_steps': specific,
            'emergency_helpline_notice': (
                "For life-threatening emergencies, immediately dial national emergency services (112 / 911 / 999). "
                "DisasterAI provides community awareness and does not dispatch emergency first responders."
            )
        }
