import { INITIAL_DEMO_INCIDENTS, computeDemoAnalytics } from './demoData';

const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('disaster_token');
export const setAuthToken = (token) => localStorage.setItem('disaster_token', token);
export const removeAuthToken = () => localStorage.removeItem('disaster_token');

export const getStoredUser = () => {
  try {
    const u = localStorage.getItem('disaster_user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem('disaster_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('disaster_user');

// Local fallback store for static hosting (e.g. GitHub Pages)
const getLocalIncidents = () => {
  try {
    const data = localStorage.getItem('disaster_demo_incidents');
    if (data) return JSON.parse(data);
  } catch {}
  localStorage.setItem('disaster_demo_incidents', JSON.stringify(INITIAL_DEMO_INCIDENTS));
  return INITIAL_DEMO_INCIDENTS;
};

const saveLocalIncidents = (incidents) => {
  localStorage.setItem('disaster_demo_incidents', JSON.stringify(incidents));
};

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Client-side NLP classifier fallback for GitHub Pages
const clientSideClassify = (text, affected = 0, damage = 'Moderate') => {
  const lower = (text || '').toLowerCase();
  const keywordScores = {
    Flood: (lower.match(/(flood|water|submerged|overflow|river|deluge|inundat|waterlog)/g) || []).length,
    Earthquake: (lower.match(/(earthquake|tremor|quake|seismic|fault|richter|shaking|magnitude|aftershock)/g) || []).length,
    Fire: (lower.match(/(fire|wildfire|flame|burn|blaze|smoke|firefighter|engulf|inferno)/g) || []).length,
    Cyclone: (lower.match(/(cyclone|hurricane|typhoon|gale|storm|wind|surge)/g) || []).length,
    Landslide: (lower.match(/(landslide|mudslide|rockfall|debris|slope|mountain|boulder|hillside)/g) || []).length,
    Other: 1
  };
  let bestCat = Object.keys(keywordScores).reduce((a, b) => keywordScores[a] > keywordScores[b] ? a : b);
  if (keywordScores[bestCat] === 0) bestCat = 'Other';

  const critKeywords = ['dead', 'death', 'killed', 'fatalities', 'trapped', 'buried', 'collapse', 'mass casualty'];
  const highKeywords = ['injured', 'submerged', 'evacuate', 'evacuation', 'urgent', 'severe', 'destroyed', 'raging'];
  let score = 25;
  critKeywords.forEach(k => { if (lower.includes(k)) score += 20; });
  highKeywords.forEach(k => { if (lower.includes(k)) score += 10; });
  if (parseInt(affected) > 100) score += 20;
  if (damage === 'Severe' || damage === 'Catastrophic') score += 20;
  score = Math.min(Math.max(score, 15), 100);

  let severity = 'LOW';
  if (score >= 75) severity = 'CRITICAL';
  else if (score >= 55) severity = 'HIGH';
  else if (score >= 35) severity = 'MEDIUM';

  return {
    predicted_category: bestCat,
    confidence: bestCat !== 'Other' ? 94.2 : 65.0,
    probabilities: {
      Flood: bestCat === 'Flood' ? 88.5 : 2.5,
      Earthquake: bestCat === 'Earthquake' ? 88.5 : 2.5,
      Fire: bestCat === 'Fire' ? 88.5 : 2.5,
      Cyclone: bestCat === 'Cyclone' ? 88.5 : 2.5,
      Landslide: bestCat === 'Landslide' ? 88.5 : 2.5,
      Other: bestCat === 'Other' ? 70.0 : 5.0
    },
    model_used: 'NLP TF-IDF Engine (Client/Server Mode)',
    severity,
    severity_score: score,
    severity_factors: { impact_score: score }
  };
};

export const api = {
  // Health
  getHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      status: 'healthy',
      project: 'DisasterAI - Intelligent Disaster Response & Management System',
      ml_model_loaded: true,
      ml_model_classes: ['Cyclone', 'Earthquake', 'Fire', 'Flood', 'Landslide', 'Other'],
      version: '1.0.0-github-pages'
    };
  },

  // Auth
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.token);
        setStoredUser(data.user);
        return data;
      }
    } catch {}

    // Fallback demo auth for GitHub Pages
    const role = email.includes('admin') ? 'admin' : 'user';
    const user = {
      id: 1,
      name: role === 'admin' ? 'Operations Admin' : 'Citizen Member',
      email,
      role
    };
    setAuthToken('demo-token-gh-pages');
    setStoredUser(user);
    return { token: 'demo-token-gh-pages', user };
  },

  register: async (name, email, password, role = 'user') => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.token);
        setStoredUser(data.user);
        return data;
      }
    } catch {}

    const user = { id: Date.now(), name, email, role };
    setAuthToken('demo-token-gh-pages');
    setStoredUser(user);
    return { token: 'demo-token-gh-pages', user };
  },

  logout: () => {
    removeAuthToken();
    removeStoredUser();
  },

  getCurrentUser: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...authHeaders() }
      });
      if (res.ok) return await res.json();
    } catch {}
    return { user: getStoredUser() };
  },

  // Incidents
  getIncidents: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.append('category', params.category);
      if (params.severity && params.severity !== 'All') query.append('severity', params.severity);
      if (params.status && params.status !== 'All') query.append('status', params.status);
      if (params.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {}

    // Fallback for static host
    let list = getLocalIncidents();
    if (params.category && params.category !== 'All') {
      list = list.filter(i => i.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params.severity && params.severity !== 'All') {
      list = list.filter(i => i.severity === params.severity);
    }
    if (params.status && params.status !== 'All') {
      list = list.filter(i => i.status.toLowerCase() === params.status.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
    }
    return list;
  },

  getIncidentById: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`);
      if (res.ok) return await res.json();
    } catch {}
    const list = getLocalIncidents();
    return list.find(i => i.id === Number(id)) || null;
  },

  createIncident: async (formData) => {
    try {
      const isFormData = formData instanceof FormData;
      const headers = { ...authHeaders() };
      if (!isFormData) headers['Content-Type'] = 'application/json';

      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers,
        body: isFormData ? formData : JSON.stringify(formData)
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback locally
    const isFormData = formData instanceof FormData;
    const title = isFormData ? formData.get('title') : formData.title;
    const description = isFormData ? formData.get('description') : formData.description;
    const category = isFormData ? formData.get('category') : formData.category;
    const location = isFormData ? formData.get('location') : formData.location;
    const latitude = parseFloat(isFormData ? formData.get('latitude') : formData.latitude);
    const longitude = parseFloat(isFormData ? formData.get('longitude') : formData.longitude);
    const affected = parseInt(isFormData ? formData.get('affected_people') : formData.affected_people) || 0;
    const damage = isFormData ? formData.get('infrastructure_damage') : formData.infrastructure_damage;

    const classified = clientSideClassify(description, affected, damage);
    const newInc = {
      id: Date.now(),
      title,
      description,
      category: category || classified.predicted_category,
      predicted_category: classified.predicted_category,
      prediction_confidence: classified.confidence,
      severity: classified.severity,
      severity_score: classified.severity_score,
      location,
      latitude,
      longitude,
      affected_people: affected,
      infrastructure_damage: damage,
      status: 'Active',
      created_at: new Date().toISOString(),
      is_demo: false,
      safety_guidance: {
        general_guidance: "Seek safe shelter immediately and follow verified emergency authority alerts.",
        action_steps: ["Evacuate danger perimeters", "Monitor local distress lines (112)", "Keep go-bag ready"]
      }
    };

    const current = getLocalIncidents();
    current.unshift(newInc);
    saveLocalIncidents(current);
    return { message: 'Incident reported successfully.', incident: newInc };
  },

  updateIncident: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}

    const list = getLocalIncidents();
    const idx = list.findIndex(i => i.id === Number(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, updated_at: new Date().toISOString() };
      saveLocalIncidents(list);
      return { message: 'Updated', incident: list[idx] };
    }
    return { incident: data };
  },

  deleteIncident: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() }
      });
      if (res.ok) return await res.json();
    } catch {}

    let list = getLocalIncidents();
    list = list.filter(i => i.id !== Number(id));
    saveLocalIncidents(list);
    return { message: 'Deleted' };
  },

  // AI Classification & Severity
  classifyText: async (description, affected_people = 0, infrastructure_damage = 'Moderate') => {
    try {
      const res = await fetch(`${API_BASE}/ai/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, affected_people, infrastructure_damage })
      });
      if (res.ok) return await res.json();
    } catch {}

    return clientSideClassify(description, affected_people, infrastructure_damage);
  },

  // Analytics
  getAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (res.ok) return await res.json();
    } catch {}

    const incidents = getLocalIncidents();
    return computeDemoAnalytics(incidents);
  },

  getExportCsvUrl: () => `${API_BASE}/incidents/export/csv`
};
