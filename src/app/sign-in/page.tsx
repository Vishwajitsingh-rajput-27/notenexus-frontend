'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { apiLogin } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

export default function SignInPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiLogin({ email, password })
      setAuth(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        className="w-full max-w-md glass rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📚</div>
          <h1 className="text-2xl font-bold text-gradient">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your NoteNexus account</p>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              placeholder="••••••••" />
          </div>
          <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-3 font-bold text-white transition">
            {loading ? 'Signing in…' : 'Sign In'}
          </motion.button>
        </form>
        <p className="text-center text-slate-400 text-sm mt-6">
          No account? <Link href="/sign-up" className="text-blue-400 hover:text-blue-300">Sign up free</Link>
        </p>
      </motion.div>
    </div>
  )
}
