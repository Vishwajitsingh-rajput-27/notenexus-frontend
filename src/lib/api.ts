import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL: BASE_URL })

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('nn_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiLogin = async (body: { email: string; password: string }) => {
  const { data } = await api.post('/auth/login', body)
  return data
}

export const apiRegister = async (body: { name: string; email: string; password: string }) => {
  const { data } = await api.post('/auth/register', body)
  return data
}

export const apiMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export const apiUploadNote = async (formData: FormData) => {
  const { data } = await api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const apiGetNotes = async (params?: { subject?: string; page?: number } | string) => {
  const query = typeof params === 'string' ? { subject: params } : params
  const { data } = await api.get('/notes', { params: query })
  return data
}

export const apiGetNote = async (id: string) => {
  const { data } = await api.get(`/notes/${id}`)
  return data
}

export const apiDeleteNote = async (id: string) => {
  const { data } = await api.delete(`/notes/${id}`)
  return data
}

export const apiShareNote = async (id: string, classId: string) => {
  const { data } = await api.post(`/notes/${id}/share`, { classId })
  return data
}

export const apiGetSubjects = async () => {
  const { data } = await api.get('/notes/subjects')
  return data
}

export const apiSearch = async (query: string) => {
  const { data } = await api.get('/notes/search', { params: { q: query } })
  return data
}

// ── Class Hub (shared notes) ──────────────────────────────────────────────────
export const apiGetSharedNotes = async () => {
  const { data } = await api.get('/class/notes')
  return data
}

export const apiUpvoteNote = async (id: string) => {
  const { data } = await api.post(`/class/notes/${id}/upvote`)
  return data
}

// ── Revision / AI ─────────────────────────────────────────────────────────────
export const apiRevision = async (body: {
  type: 'flashcards' | 'mindmap' | 'exam' | 'planner' | 'tutor'
  content: string
  subject?: string
  level?: string
}) => {
  const { data } = await api.post('/ai/revision', body)
  return data
}

export default api
