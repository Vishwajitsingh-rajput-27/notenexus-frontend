import axios from 'axios'
import Cookies from 'js-cookie'

const API = axios.create({ baseURL: 'https://notenexus-backend-y20v.onrender.com' })

API.interceptors.request.use((config) => {
  const token = Cookies.get('nn_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────
export const apiRegister = (data: { name: string; email: string; password: string }) =>
  API.post('/api/auth/register', data).then(r => r.data)

export const apiLogin = (data: { email: string; password: string }) =>
  API.post('/api/auth/login', data).then(r => r.data)

export const apiMe = () => API.get('/api/auth/me').then(r => r.data)

// ── Notes ─────────────────────────────────────────────────────────────────
export const apiUploadNote = (form: FormData) =>
  API.post('/api/notes/upload', form).then(r => r.data)

export const apiGetNotes = (subject?: string) =>
  API.get('/api/notes', { params: subject ? { subject } : {} }).then(r => r.data)

export const apiGetNote = (id: string) =>
  API.get(`/api/notes/${id}`).then(r => r.data)

export const apiDeleteNote = (id: string) =>
  API.delete(`/api/notes/${id}`).then(r => r.data)

export const apiGetSubjects = () =>
  API.get('/api/notes/subjects').then(r => r.data)

export const apiShareNote = (id: string, shared: boolean) =>
  API.patch(`/api/notes/${id}/share`, { shared }).then(r => r.data)

export const apiUpvoteNote = (id: string) =>
  API.post(`/api/notes/${id}/upvote`).then(r => r.data)

export const apiGetSharedNotes = () =>
  API.get('/api/notes/shared').then(r => r.data)

// ── Search ────────────────────────────────────────────────────────────────
export const apiSearch = (query: string) =>
  API.post('/api/search', { query }).then(r => r.data)

// ── Revision ──────────────────────────────────────────────────────────────
export const apiRevision = (text: string, type: string) =>
  API.post('/api/revision', { text, type }).then(r => r.data)

export const apiRevisionAll = (text: string) =>
  API.post('/api/revision/all', { text }).then(r => r.data)
