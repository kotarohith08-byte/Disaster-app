import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldAlert, 
  Waves, 
  Flame, 
  Wind, 
  Mountain, 
  Activity, 
  AlertCircle,
  PhoneCall,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const GUIDELINES = {
  Flood: {
    icon: Waves,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    overview: 'Flooding is the most common natural disaster. Moving water possesses tremendous power—just 6 inches of rapidly moving water can knock an adult off their feet, and 2 feet can float a vehicle.',
    rules: [
      { level: 'CRITICAL', title: 'Life-Threatening Flash Flooding', steps: [
        'Move to the highest accessible floor or roof immediately if ground levels are inundated.',
        'Do not enter closed attics without an exterior escape hatch or roof access tool.',
        'Signal emergency rescue personnel with flashlights, whistles, or bright colored cloth.',
        'Call national emergency helpline (112 / 1070) with precise landmark coordinates.'
      ]},
      { level: 'HIGH', title: 'Severe River / Coastal Overflow', steps: [
        'Shut off main electrical breaker and LPG gas valves if safe to do so before water enters.',
        'Follow designated civil defense evacuation corridors—never cross submerged bridges.',
        'Never walk, swim, or drive through flood waters: Turn Around, Don’t Drown!',
        'Avoid contact with floodwater which may be charged by fallen power lines or contaminated.'
      ]},
      { level: 'MEDIUM', title: 'Waterlogging & Localized Flooding', steps: [
        'Relocate critical identification documents, medicines, and electronics to upper storage.',
        'Prepare emergency food rations and sealed drinking water bottles (3 days minimum).',
        'Check on elderly neighbors, children, and secure household pets in high safe zones.'
      ]},
      { level: 'LOW', title: 'Monsoon Flood Advisory', steps: [
        'Clear storm drains and rain gutters around residential boundary walls.',
        'Monitor local meteorological bulletins and river gauge telemetry warnings.',
        'Keep emergency battery lamps and charged power banks on standby.'
      ]}
    ]
  },
  Earthquake: {
    icon: Activity,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    overview: 'Ground shaking occurs without advance warning. Ground motion itself rarely causes injury—most casualties result from collapsing masonry, falling debris, glass, and toppling furniture.',
    rules: [
      { level: 'CRITICAL', title: 'Severe Structural Failure / Collapse', steps: [
        'If trapped under rubble, protect mouth, nose, and eyes from inhaling pulverised dust.',
        'Tap on pipes or wall masonry rhythmically so search and rescue acoustic sensors can locate you.',
        'Do not light matches or cigarette lighters due to potential fractured gas mains.',
        'Shout only as a last resort to preserve vital oxygen and avoid dust inhalation.'
      ]},
      { level: 'HIGH', title: 'Major Tremors & Multiple Aftershocks', steps: [
        'DROP, COVER, and HOLD ON! Seek shelter beneath sturdy tables or interior room corners.',
        'Stay far away from glass windows, exterior brick veneer walls, and heavy chandeliers.',
        'Do not rush outside during active shaking; falling exterior facade glass causes severe injury.',
        'Never use elevators; use designated structural fire escape stairs once shaking ceases.'
      ]},
      { level: 'MEDIUM', title: 'Moderate Shaking / Minor Fissures', steps: [
        'Check yourself and family for injuries and administer immediate trauma first aid.',
        'Inspect household utility connections for gas smells; shut main supply if detected.',
        'Extinguish any small kitchen fires immediately using fire blankets or extinguishers.'
      ]},
      { level: 'LOW', title: 'Minor Tremor Notice', steps: [
        'Fasten heavy bookshelves, water heaters, and tall dressers to wall studs.',
        'Review family earthquake drills and identify interior safe spots in every room.'
      ]}
    ]
  },
  Fire: {
    icon: Flame,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    overview: 'Fires spread exponentially in minutes. Toxic smoke and carbon monoxide are far deadlier than flames, causing disorientation and asphyxiation.',
    rules: [
      { level: 'CRITICAL', title: 'Uncontrolled Structural / Wildfire Blaze', steps: [
        'Crawl low beneath smoke where cooler, breathable oxygen remains close to the floor.',
        'Feel doors with the back of your hand before turning handles; if hot, do NOT open.',
        'If clothes catch fire: STOP, DROP, and ROLL until flames are smothered.',
        'Get out, stay out! Never re-enter burning premises for personal belongings or pets.'
      ]},
      { level: 'HIGH', title: 'Spreading Fire & Toxic Plumes', steps: [
        'Evacuate immediately in the crosswind or upwind direction away from approaching smoke.',
        'Place wet towels under door gaps if trapped in a room, and signal from exterior windows.',
        'Dial 101 / 112 fire dispatch and clearly state floor number and trapped occupants.'
      ]},
      { level: 'MEDIUM', title: 'Localized Electrical / Kitchen Fire', steps: [
        'For kitchen oil fires: slide a metal lid over pan and turn off stove. Never throw water on oil!',
        'Use ABC-rated dry chemical extinguishers using PASS: Pull, Aim, Squeeze, Sweep.',
        'Close interior doors behind you as you evacuate to compartmentalize fire spread.'
      ]},
      { level: 'LOW', title: 'Fire Hazard Alert', steps: [
        'Test smoke detectors and inspect fire extinguisher pressure gauges monthly.',
        'Keep 10-foot defensible space clear of dry leaves and brush around building exterior.'
      ]}
    ]
  },
  Cyclone: {
    icon: Wind,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    overview: 'Tropical storms bring destructive gale winds, torrential rains, and storm surges. Wind force quadruples every time wind speed doubles.',
    rules: [
      { level: 'CRITICAL', title: 'Extreme Cyclone Landfall & Surge', steps: [
        'Complete mandatory evacuation to designated concrete cyclone shelters when advised.',
        'Do NOT leave shelter during the calm "eye" of the storm; ferocious winds return abruptly.',
        'Stay away from all glass windows; shelter in the strongest central interior room or hallway.'
      ]},
      { level: 'HIGH', title: 'Gale Warnings & Coastal Squalls', steps: [
        'Board up glass windows or secure hurricane shutters with marine-grade fasteners.',
        'Bring indoors all loose patio furniture, metal sheets, and unsecured outdoor equipment.',
        'Disconnect all major electrical appliances to safeguard against voltage spikes.'
      ]},
      { level: 'MEDIUM', title: 'Approaching Tropical Depression', steps: [
        'Store 3 days of clean drinking water in clean plastic containers and food supplies.',
        'Trim dead tree branches that could fall across roofs or power transmission lines.',
        'Fully charge mobile phones, communication radios, and reserve battery power banks.'
      ]},
      { level: 'LOW', title: 'Cyclone Watch', steps: [
        'Follow weather bulletins and track projections from national meteorological desks.',
        'Review regional evacuation routes and fuel private vehicles.'
      ]}
    ]
  },
  Landslide: {
    icon: Mountain,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    overview: 'Landslides and debris flows can travel down steep slopes at 30 to 50 km/h, carrying mud, boulders, and trees capable of crushing structures.',
    rules: [
      { level: 'CRITICAL', title: 'Active Debris Flow / Rockfall', steps: [
        'Quickly move laterally away from the path of the flow; never run down slope alongside it.',
        'If escape is impossible, curl into a tight ball and protect your head with arms.',
        'Alert downhill neighbors if you detect sudden ground movement or cracking sounds.'
      ]},
      { level: 'HIGH', title: 'Unstable Slopes After Continuous Rain', steps: [
        'Evacuate slope-adjacent houses immediately during prolonged downpours.',
        'Stay awake and alert during intense storms; many slide fatalities occur while sleeping.',
        'Watch for sudden muddy discoloration of mountain stream runoff—a sign of upstream slide.'
      ]},
      { level: 'MEDIUM', title: 'Hillside Drainage Disruption', steps: [
        'Inspect slopes for new ground cracks, leaning trees, or tilted retaining walls.',
        'Avoid mountain roads and narrow canyon passes during monsoon deluge warnings.'
      ]},
      { level: 'LOW', title: 'Slope Soil Maintenance', steps: [
        'Maintain flexible pipe couplings and ensure slope runoff diversion drains are unobstructed.'
      ]}
    ]
  },
  Other: {
    icon: ShieldAlert,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    overview: 'Covers industrial hazards, chemical leaks, heatwaves, blizzards, and structural sinkholes. Always adhere strictly to civil defense advisories.',
    rules: [
      { level: 'CRITICAL', title: 'Toxic Gas / Hazmat Leak', steps: [
        'Evacuate crosswind or upwind immediately from the chemical vapor plume.',
        'Cover nose and mouth with a damp cloth or particulate mask.',
        'Shelter in-place inside an airtight interior room; seal doors and AC vents with duct tape.'
      ]},
      { level: 'HIGH', title: 'Urban Structural Sinkhole / Collapse', steps: [
        'Establish an immediate 100-meter safety cordon around collapsing structural perimeters.',
        'Do not step onto fractured road tarmac which could collapse underfoot.',
        'Report immediate coordinates to city emergency engineers.'
      ]},
      { level: 'MEDIUM', title: 'Extreme Heatwave / Cold Snap', steps: [
        'Avoid direct sun exposure between 11 AM and 4 PM during severe heatwaves; hydrate regularly.',
        'During sub-zero blizzards, dress in multiple warm layers and prevent frostbite.'
      ]},
      { level: 'LOW', title: 'General Civil Preparedness', steps: [
        'Maintain a family emergency go-bag and keep verified emergency numbers accessible.'
      ]}
    ]
  }
};

export default function SafetyGuide() {
  const [selectedCat, setSelectedCat] = useState('Flood');
  const catData = GUIDELINES[selectedCat] || GUIDELINES.Flood;
  const Icon = catData.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Disaster Safety & Preparedness Guidelines</h1>
            <p className="text-xs text-slate-400">Verified life-safety actions categorized by disaster type and severity</p>
          </div>
        </div>

        {/* National Helpline Badge */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-center gap-3 text-red-300">
          <PhoneCall className="w-6 h-6 text-red-400 animate-pulse flex-shrink-0" />
          <div className="text-xs">
            <div className="font-bold">National Emergency Helpline: 112</div>
            <div className="text-[11px] text-red-400/90">24/7 Unified Police, Fire, Ambulance & NDRF</div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {Object.keys(GUIDELINES).map((catName) => {
          const item = GUIDELINES[catName];
          const TabIcon = item.icon;
          const isSelected = selectedCat === catName;
          return (
            <button
              key={catName}
              onClick={() => setSelectedCat(catName)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isSelected 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{catName}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Disaster Protocol Details */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${catData.bg} ${catData.color} border ${catData.border} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{selectedCat} Response Protocols</h2>
            <p className="text-xs text-slate-400 mt-0.5">{catData.overview}</p>
          </div>
        </div>

        {/* Action Steps Grid by Severity */}
        <div className="grid md:grid-cols-2 gap-4">
          {catData.rules.map((rule) => {
            const isCrit = rule.level === 'CRITICAL';
            const isHigh = rule.level === 'HIGH';
            const isMed = rule.level === 'MEDIUM';

            return (
              <div
                key={rule.level}
                className={`p-5 rounded-2xl border ${
                  isCrit ? 'bg-red-500/10 border-red-500/30' :
                  isHigh ? 'bg-orange-500/10 border-orange-500/30' :
                  isMed ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isCrit ? 'bg-red-500 text-white' :
                    isHigh ? 'bg-orange-500 text-white' :
                    isMed ? 'bg-amber-500 text-slate-900' :
                    'bg-blue-500 text-white'
                  }`}>
                    {rule.level} SEVERITY
                  </span>
                  <span className="text-xs font-bold text-white">{rule.title}</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {rule.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Public Notice Banner */}
        <div className="p-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl text-xs text-slate-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Notice of Public Safety Advisory:</strong> This guidance is compiled from verified public safety procedures published by civil defense and disaster response authorities. DisasterAI serves as an intelligent advisory tool and does not replace official emergency services.
          </div>
        </div>
      </div>
    </div>
  );
}
