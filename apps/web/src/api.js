import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({ baseURL });
let currentAdminKey = '';

export function setAdminKey(key) {
  currentAdminKey = (key || '').trim();
}

function adminHeaders() {
  return currentAdminKey ? { 'x-admin-key': currentAdminKey } : {};
}

export async function getArticles(params) {
  const { data } = await api.get('/articles', { params });
  return data;
}

export async function getTags() {
  const { data } = await api.get('/tags');
  return data;
}

export async function getArticle(slug) {
  const { data } = await api.get(`/articles/${slug}`);
  return data;
}

export async function createArticle(payload) {
  const { data } = await api.post('/articles', payload, { headers: adminHeaders() });
  return data;
}

export async function updateArticle(id, payload) {
  const { data } = await api.put(`/articles/${id}`, payload, { headers: adminHeaders() });
  return data;
}

export async function deleteArticle(id) {
  await api.delete(`/articles/${id}`, { headers: adminHeaders() });
}

export default api;
