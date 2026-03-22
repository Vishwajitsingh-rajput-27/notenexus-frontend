import { create } from 'zustand'
import Cookies from 'js-cookie'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:  Cookies.get('nn_user')  ? JSON.parse(Cookies.get('nn_user')!)  : null,
  token: Cookies.get('nn_token') ?? null,

  setAuth: (user, token) => {
    Cookies.set('nn_user',  JSON.stringify(user), { expires: 7 })
    Cookies.set('nn_token', token, { expires: 7 })
    set({ user, token })
  },

  updateUser: (updatedFields) => {
    const current = get().user
    if (!current) return
    const updated = { ...current, ...updatedFields }
    Cookies.set('nn_user', JSON.stringify(updated), { expires: 7 })
    set({ user: updated })
  },

  logout: () => {
    Cookies.remove('nn_user')
    Cookies.remove('nn_token')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!get().token,
}))
