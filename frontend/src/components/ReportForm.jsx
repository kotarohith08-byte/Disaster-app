import React, { useState } from 'react';
import { 
  FilePlus, 
  Sparkles, 
  Cpu, 
  MapPin, 
  AlertTriangle, 
  Upload, 
  CheckCircle2, 
  Compass, 
  HelpCircle,
  Eye,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';

export default function ReportForm({ onReportSubmitted, user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [affectedPeople, setAffectedPeople] = useState('0');
  const [infrastructureDamage, setInfrastructureDamage] = useState('Moderate');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // AI Assistant Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categories = ['Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Other'];
  const damageLevels = ['None', 'Minor', 'Moderate', 'Severe', 'Catastrophic'];

  // Preset location quick picks for testing
  const presets = [
    { name: 'Mumbai, MH', lat: 19.0760, lng: 72.8777 },
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Chennai, TN', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata, WB', lat: 22.5726, lng: 88.3639 },
    { name: 'Dehradun, UK', lat: 30.3165, lng: 78.0322 },
    { name: 'Wayanad, KL', lat: 11.6854, lng: 76.1320 },
  ];

  // AI Classification Trigger
  const handleAnalyzeWithAI = async () => {
    if (!description.trim()) {
      setErrorMessage('Please enter an incident description first for AI NLP classification.');
      return;
    }
    setErrorMessage('');
    setAnalyzing(true);

    try {
      const result = await api.classifyText(
        description, 
        parseInt(affectedPeople) || 0, 
        infrastructureDamage
      );
      setAiPrediction(result);
      // Auto-set the category to predicted unless user wants to override
      if (!category) {
        setCategory(result.predicted_category);
      }
    } catch (err) {
      setErrorMessage(err.message || 'AI analysis request failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Browser Geolocation
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          if (!location) setLocation('Detected Device Location');
        },
        (error) => {
          setErrorMessage('Unable to retrieve device GPS location. Please enter coordinates manually.');
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by your browser.');
    }
  };

  // Image Upload Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim() || !description.trim() || !location.trim()) {
      setErrorMessage('Title, description, and location are required fields.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      setErrorMessage('Valid latitude (-90 to 90) and longitude (-180 to 180) are required.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category || (aiPrediction?.predicted_category || 'Other'));
      formData.append('location', location.trim());
      formData.append('latitude', latNum);
      formData.append('longitude', lngNum);
      formData.append('affected_people', parseInt(affectedPeople) || 0);
      formData.append('infrastructure_damage', infrastructureDamage);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.createIncident(formData);
      setSuccessMessage('Emergency incident report submitted successfully and broadcast to response dashboard!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setLocation('');
      setLatitude('');
      setLongitude('');
      setAffectedPeople('0');
      setInfrastructureDamage('Moderate');
      setImageFile(null);
      setImagePreview(null);
      setAiPrediction(null);

      if (onReportSubmitted) {
        onReportSubmitted(res.incident);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit incident report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
            <FilePlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Emergency Incident Reporting Form</h1>
            <p className="text-xs text-slate-400">Citizen & Field Team Community Distress Ingestion</p>
          </div>
        </div>

        {/* Notices */}
        {successMessage && (
          <div className="my-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="my-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-300 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Incident Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Flood Submerging Residential Colony"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Description & AI NLP Analyzer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Detailed Incident Description *
              </label>
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={analyzing || !description.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-blue-600/30 disabled:opacity-50 transition-all"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing with NLP...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run AI Classification</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific eyewitness observations: water depth, rising speed, smoke plume, structural collapse, trapped casualties, blocked roads..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Click "Run AI Classification" to automatically predict disaster type and calculate multi-factor severity!
            </p>
          </div>

          {/* AI Live Prediction Card */}
          {aiPrediction && (
            <div className="p-4 bg-slate-800/80 border border-blue-500/40 rounded-2xl space-y-3 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">AI NLP Model Prediction</span>
                    <span className="text-[10px] text-slate-400 ml-2">({aiPrediction.model_used})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300">Confidence:</span>
                  <span className="text-xs font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    {aiPrediction.confidence}%
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-[11px] text-slate-400">Predicted Category</div>
                  <div className="text-base font-black text-amber-400 mt-0.5 flex items-center justify-between">
                    <span>{aiPrediction.predicted_category}</span>
                    <button
                      type="button"
                      onClick={() => setCategory(aiPrediction.predicted_category)}
                      className="text-[11px] text-blue-400 hover:underline font-normal"
                    >
                      {category === aiPrediction.predicted_category ? '✓ Applied' : 'Use Category'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-[11px] text-slate-400">Estimated Severity</div>
                  <div className="text-base font-black mt-0.5 flex items-center justify-between">
                    <span className={
                      aiPrediction.severity === 'CRITICAL' ? 'text-red-400' :
                      aiPrediction.severity === 'HIGH' ? 'text-orange-400' :
                      aiPrediction.severity === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400'
                    }>
                      {aiPrediction.severity} (Score: {aiPrediction.severity_score}/100)
                    </span>
                  </div>
                </div>
              </div>

              {/* Class Probability Distribution Bars */}
              {aiPrediction.probabilities && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400">Class Probability Distribution:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(aiPrediction.probabilities).map(([catName, prob]) => (
                      <div key={catName} className="bg-slate-900/40 p-1.5 rounded-lg text-[10px]">
                        <div className="flex justify-between text-slate-300">
                          <span>{catName}</span>
                          <span className="font-mono">{prob}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(prob, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disaster Category Selection */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Disaster Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="">-- Select or adopt AI prediction --</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Location Name / Address *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sector 14, Riverfront, Dehradun"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Coordinates and Location Presets */}
          <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-400" />
                Geospatial Coordinates (Latitude & Longitude) *
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20"
              >
                <MapPin className="w-3.5 h-3.5" />
                Use Device GPS
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude (e.g. 19.0760)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude (e.g. 72.8777)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Location Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400">Quick Regional Presets:</span>
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setLatitude(p.lat.toString());
                    setLongitude(p.lng.toString());
                    if (!location) setLocation(p.name);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Factors: Affected People & Infrastructure Damage */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Estimated People Directly Affected
              </label>
              <input
                type="number"
                min="0"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Observed Infrastructure Damage
              </label>
              <select
                value={infrastructureDamage}
                onChange={(e) => setInfrastructureDamage(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
              >
                {damageLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload with preview */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Incident Photographic Evidence (Optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-800/40 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium">Click to select incident image</span>
                <span className="text-[10px] text-slate-500">PNG, JPG, JPEG, WEBP up to 16MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-700 relative flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-500 hover:to-orange-500 text-white rounded-2xl font-bold text-base shadow-xl shadow-red-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Broadcasting Report to Emergency Stream...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                <span>Submit Emergency Report & Broadcast</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
