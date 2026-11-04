export const INITIAL_DEMO_INCIDENTS = [
  {
    id: 1,
    title: "Severe Urban Flash Floods and Road Inundation",
    description: "Continuous heavy torrential rain measuring 180mm over 6 hours has caused stormwater drains to back up. Several residential ground-floor houses and arterial roads submerged under 4 feet of water with marooned citizens.",
    category: "Flood",
    predicted_category: "Flood",
    prediction_confidence: 98.4,
    severity: "CRITICAL",
    severity_score: 88.5,
    location: "Kurla West, Mumbai, Maharashtra",
    latitude: 19.0657,
    longitude: 72.8797,
    affected_people: 450,
    infrastructure_damage: "Severe",
    status: "Active",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    safety_guidance: {
      general_guidance: "Seek higher ground immediately. Never walk, swim, or drive through flood waters. Turn Around, Don’t Drown!",
      action_steps: [
        "Move immediately to the highest accessible level or roof if trapped.",
        "Signal for rescue using a bright cloth, flashlight, or whistle. Do not enter closed attics without roof access.",
        "Call official emergency distress lines (e.g. 112 / 911 / NDRF helpline)."
      ]
    }
  },
  {
    id: 2,
    title: "Magnitude 6.1 Seismic Tremors and Wall Cracks",
    description: "Strong earthquake shockwaves shook high-rise buildings and commercial complexes. Plaster collapsed, window panes shattered, and structural cracks noticed along apartment support pillars. Residents evacuated to open grounds.",
    category: "Earthquake",
    predicted_category: "Earthquake",
    prediction_confidence: 97.2,
    severity: "HIGH",
    severity_score: 72.0,
    location: "Dehradun Valley, Uttarakhand",
    latitude: 30.3165,
    longitude: 78.0322,
    affected_people: 120,
    infrastructure_damage: "Severe",
    status: "Under Review",
    is_demo: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    safety_guidance: {
      general_guidance: "DROP, COVER, and HOLD ON! Stay away from glass windows, unanchored heavy furniture, and exterior walls.",
      action_steps: [
        "Evacuate structurally damaged buildings immediately with head protection.",
        "Stay in open fields away from power lines, chimneys, and high-rise facades.",
        "Do not re-enter cracked or tilted buildings until certified by structural engineers."
      ]
    }
  },
  {
    id: 3,
    title: "Industrial Warehouse Chemical Fire",
    description: "Massive fire broke out inside a solvent storage depot. Towering flames and dense toxic black smoke plume billowing across nearby residential neighborhood. 8 fire tenders battling the blaze.",
    category: "Fire",
    predicted_category: "Fire",
    prediction_confidence: 99.1,
    severity: "CRITICAL",
    severity_score: 92.0,
    location: "Manali Industrial Area, Chennai, Tamil Nadu",
    latitude: 13.1654,
    longitude: 80.2608,
    affected_people: 280,
    infrastructure_damage: "Catastrophic",
    status: "Active",
    is_demo: true,
    created_at: new Date().toISOString(),
    safety_guidance: {
      general_guidance: "Get out, stay out, and call emergency services immediately. Crawl low under smoke where air is cleaner.",
      action_steps: [
        "Urgent priority evacuation for entire block/neighborhood.",
        "Set up water curtains and defensive fire lines if directed by emergency responders.",
        "Emergency triage centers should prepare for smoke inhalation and burn care."
      ]
    }
  },
  {
    id: 4,
    title: "Cyclone Landfall with 160 km/h Gale Winds",
    description: "Severe tropical cyclonic storm eye nearing coast. Fierce gale-force winds uprooted trees, bent electric utility poles, and ripped tin roofs. Coastal surge inundating low-lying fishing hamlets.",
    category: "Cyclone",
    predicted_category: "Cyclone",
    prediction_confidence: 96.8,
    severity: "CRITICAL",
    severity_score: 95.0,
    location: "Puri Coastal Belt, Odisha",
    latitude: 19.8135,
    longitude: 85.8312,
    affected_people: 1200,
    infrastructure_damage: "Catastrophic",
    status: "Active",
    is_demo: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    safety_guidance: {
      general_guidance: "Secure roofs, board windows, and stay indoors in the strongest central room away from exterior glass.",
      action_steps: [
        "Mandatory evacuation of low-lying coastal and surge zones.",
        "Remain confined in fortified shelters until civil defense issues the all-clear.",
        "Beware of fallen live electric wires and contaminated water post-landfall."
      ]
    }
  },
  {
    id: 5,
    title: "Major Highway Landslide and Mudflow",
    description: "Incessant monsoon rains triggered massive hill slope collapse. Tons of boulders and mud debris have blocked National Highway, stranding tourist vehicles and cutting off communication.",
    category: "Landslide",
    predicted_category: "Landslide",
    prediction_confidence: 98.9,
    severity: "HIGH",
    severity_score: 68.0,
    location: "Wayanad Ghat Pass, Kerala",
    latitude: 11.6854,
    longitude: 76.1320,
    affected_people: 95,
    infrastructure_damage: "Moderate",
    status: "Verified",
    is_demo: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    safety_guidance: {
      general_guidance: "Move away from the path of debris and slide flows immediately. Avoid river valleys and low drainage channels.",
      action_steps: [
        "Evacuate residences located directly below steep cliffs or unreinforced slopes.",
        "Listen for unusual sounds: cracking trees, rumbling boulders, or surging mud."
      ]
    }
  },
  {
    id: 6,
    title: "Suburban Forest Brush Fire",
    description: "Rapidly moving brush fire ignited along hillside pine forests due to dry heatwave conditions. Smoldering embers jumping across firebreak roads; firefighters establishing containment trenches.",
    category: "Fire",
    predicted_category: "Fire",
    prediction_confidence: 95.5,
    severity: "MEDIUM",
    severity_score: 52.0,
    location: "Kasauli Hills, Himachal Pradesh",
    latitude: 30.9013,
    longitude: 76.9649,
    affected_people: 30,
    infrastructure_damage: "Moderate",
    status: "Verified",
    is_demo: true,
    created_at: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: 7,
    title: "River Embankment Breach Flooding Farmland",
    description: "River Brahmaputra water level exceeded danger mark by 1.2 meters, breaching earthen dyke. Floodwaters submerged paddy fields and primary school compound.",
    category: "Flood",
    predicted_category: "Flood",
    prediction_confidence: 97.6,
    severity: "HIGH",
    severity_score: 76.0,
    location: "Kaziranga Basin, Assam",
    latitude: 26.5775,
    longitude: 93.1711,
    affected_people: 350,
    infrastructure_damage: "Moderate",
    status: "Active",
    is_demo: true,
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 8,
    title: "Industrial Ammonia Leak from Cold Storage",
    description: "High pressure valve burst released pungent ammonia vapor into surrounding area. Citizens experiencing acute respiratory irritation and watering eyes. Hazmat perimeter established.",
    category: "Other",
    predicted_category: "Other",
    prediction_confidence: 91.2,
    severity: "HIGH",
    severity_score: 65.0,
    location: "Kalyani Industrial Estate, West Bengal",
    latitude: 22.9751,
    longitude: 88.4345,
    affected_people: 150,
    infrastructure_damage: "Minor",
    status: "Verified",
    is_demo: true,
    created_at: new Date(Date.now() - 432000000).toISOString()
  },
  {
    id: 9,
    title: "Moderate Tremor Shakes Capital Region",
    description: "Mild earthquake measuring magnitude 4.8 epicentered 50km southwest felt across high-rises. Shaking lasted 12 seconds with swinging chandeliers. No structural casualties reported.",
    category: "Earthquake",
    predicted_category: "Earthquake",
    prediction_confidence: 94.0,
    severity: "LOW",
    severity_score: 32.0,
    location: "Connaught Place, New Delhi",
    latitude: 28.6315,
    longitude: 77.2167,
    affected_people: 0,
    infrastructure_damage: "None",
    status: "Resolved",
    is_demo: true,
    created_at: new Date(Date.now() - 604800000).toISOString()
  },
  {
    id: 10,
    title: "Mountain Rockfall Damaging Secondary Roadway",
    description: "Falling boulders dislodged by heavy showers damaged road guardrails and blocked single-lane bridge access. Local public works teams deployed backhoes.",
    category: "Landslide",
    predicted_category: "Landslide",
    prediction_confidence: 96.0,
    severity: "MEDIUM",
    severity_score: 45.0,
    location: "Munnar Mountain Route, Kerala",
    latitude: 10.0889,
    longitude: 77.0595,
    affected_people: 15,
    infrastructure_damage: "Moderate",
    status: "Resolved",
    is_demo: true,
    created_at: new Date(Date.now() - 691200000).toISOString()
  },
  {
    id: 11,
    title: "Severe Coastal Squall and Jetty Flooding",
    description: "Depression over Arabian sea brought strong squall winds of 90 km/h with 3-meter swells splashing over coastal promenade and fishermen jetties.",
    category: "Cyclone",
    predicted_category: "Cyclone",
    prediction_confidence: 93.5,
    severity: "MEDIUM",
    severity_score: 48.0,
    location: "Panaji Coastal Sector, Goa",
    latitude: 15.4909,
    longitude: 73.8278,
    affected_people: 25,
    infrastructure_damage: "Minor",
    status: "Resolved",
    is_demo: true,
    created_at: new Date(Date.now() - 864000000).toISOString()
  },
  {
    id: 12,
    title: "Commercial Plaza Electrical Basement Fire",
    description: "Transformer spark ignited cable duct in shopping center basement. Quick response from building fire sprinklers and local fire station contained blaze before spreading.",
    category: "Fire",
    predicted_category: "Fire",
    prediction_confidence: 98.0,
    severity: "LOW",
    severity_score: 28.0,
    location: "Indiranagar, Bengaluru, Karnataka",
    latitude: 12.9719,
    longitude: 77.6412,
    affected_people: 0,
    infrastructure_damage: "Minor",
    status: "Resolved",
    is_demo: true,
    created_at: new Date(Date.now() - 1036800000).toISOString()
  }
];

export function computeDemoAnalytics(incidents) {
  const total = incidents.length;
  const active = incidents.filter(i => ['Active', 'Under Review'].includes(i.status)).length;
  const critical = incidents.filter(i => i.severity === 'CRITICAL').length;
  const resolved = incidents.filter(i => i.status === 'Resolved').length;

  const categories = ['Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Other'];
  const category_distribution = categories.map(cat => ({
    name: cat,
    count: incidents.filter(i => i.category.toLowerCase() === cat.toLowerCase()).length
  }));

  const severities = [
    { name: 'CRITICAL', color: '#ef4444' },
    { name: 'HIGH', color: '#f97316' },
    { name: 'MEDIUM', color: '#eab308' },
    { name: 'LOW', color: '#3b82f6' }
  ];
  const severity_distribution = severities.map(s => ({
    name: s.name,
    color: s.color,
    count: incidents.filter(i => i.severity === s.name).length
  }));

  const statuses = ['Active', 'Under Review', 'Verified', 'Resolved'];
  const status_distribution = statuses.map(st => ({
    name: st,
    count: incidents.filter(i => i.status === st).length
  }));

  const monthly_trends = [
    { month: 'Jun', total: 6, active: 2, resolved: 4 },
    { month: 'Jul', total: 10, active: 4, resolved: 6 },
    { month: 'Aug', total: 15, active: 6, resolved: 9 },
    { month: 'Sep', total: 9, active: 3, resolved: 6 },
    { month: 'Oct', total: 14, active: 5, resolved: 9 },
    { month: 'Nov', total: total, active: active, resolved: resolved }
  ];

  return {
    summary: {
      total_incidents: total,
      active_incidents: active,
      critical_incidents: critical,
      resolved_incidents: resolved
    },
    category_distribution,
    severity_distribution,
    status_distribution,
    monthly_trends
  };
}
