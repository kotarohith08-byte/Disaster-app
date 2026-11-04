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

const authHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setAuthToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  register: async (name, email, password, role = 'user') => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setAuthToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  logout: () => {
    removeAuthToken();
    removeStoredUser();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...authHeaders() }
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  // Incidents
  getIncidents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.severity && params.severity !== 'All') query.append('severity', params.severity);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  getIncidentById: async (id) => {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident details');
    return res.json();
  },

  createIncident: async (formData) => {
    // If formData is an instance of FormData, pass directly with auth headers
    const isFormData = formData instanceof FormData;
    const headers = { ...authHeaders() };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers,
      body: isFormData ? formData : JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit report');
    return data;
  },

  updateIncident: async (id, data) => {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update incident');
    return result;
  },

  deleteIncident: async (id) => {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete incident');
    return result;
  },

  // AI Classification & Severity
  classifyText: async (description, affected_people = 0, infrastructure_damage = 'Moderate') => {
    const res = await fetch(`${API_BASE}/ai/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, affected_people, infrastructure_damage })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Classification failed');
    return data;
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  getExportCsvUrl: () => `${API_BASE}/incidents/export/csv`
};
