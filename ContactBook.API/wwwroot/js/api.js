/* api.js — ContactBook REST API client */

const API_BASE = '/api/contacts';

const api = {
  async get(url) {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  async post(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  async put(url, body) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  async delete(url) {
    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  async patch(url) {
    const res = await fetch(url, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }
};

const ContactsAPI = {
  getAll: () => api.get(API_BASE),
  getById: (id) => api.get(`${API_BASE}/${id}`),
  search: (q) => api.get(`${API_BASE}/search?q=${encodeURIComponent(q)}`),
  create: (dto) => api.post(API_BASE, dto),
  update: (id, dto) => api.put(`${API_BASE}/${id}`, dto),
  delete: (id) => api.delete(`${API_BASE}/${id}`),
  toggleFavorite: (id) => api.patch(`${API_BASE}/${id}/favorite`)
};

// Toast notifications
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3200);
}

// Avatar color/initials
function getAvatarClass(name) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 8;
  return `av-${hash}`;
}
function getInitials(first, last) {
  return ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || '?';
}
