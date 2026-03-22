'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import { apiMe } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL

const sourceIcon = (type: string) => {
  if (type === 'pdf')     return '📄'
  if (type === 'image')   return '🖼️'
  if (type === 'voice')   return '🎤'
  if (type === 'youtube') return '▶️'
  return '📝'
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

type Tab = 'stats' | 'history' | 'profile' | 'password'

export default function Profile() {
  const { user, token, updateUser } = useAuthStore()
  const [tab, setTab] = useState<Tab>('stats')

  // Stats + history
  const [stats, setStats]     = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Profile form
  const [name, setName]   = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)

  // Password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/api/auth/stats`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setStats(data.stats)
        setHistory(data.history || [])
      } catch { toast.error('Could not load stats') }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) { toast.error('Name and email required'); return }
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ name, email })
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }
      updateUser({ name: data.name, email: data.email })
      toast.success('Profile updated!')
    } catch { toast.error('Could not update profile') }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { toast.error('All fields required'); return }
    if (newPw !== confirmPw) { toast.error('New passwords do not match'); return }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setChangingPw(true)
    try {
      const res = await fetch(`${API}/api/auth/password`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message); return }
      toast.success('Password changed successfully!')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch { toast.error('Could not change password') }
    finally { setChangingPw(false) }
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'stats',    label: 'Stats',    icon: '📊' },
    { id: 'history',  label: 'History',  icon: '🕘' },
    { id: 'profile',  label: 'Profile',  icon: '✏️' },
    { id: 'password', label: 'Password', icon: '🔒' },
  ]

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-600/30">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          {stats?.memberSince && (
            <p className="text-slate-500 text-xs mt-0.5">Member since {formatDate(stats.memberSince)}</p>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              tab === t.id ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'
            }`}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
          transition={{ duration: 0.15 }}>

          {/* ── STATS TAB ── */}
          {tab === 'stats' && (
            <div>
              {loading ? (
                <div className="text-slate-500 text-sm">Loading stats…</div>
              ) : stats ? (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Total Notes', value: stats.totalNotes, icon: '📚', color: 'blue' },
                      { label: 'Words Saved', value: stats.totalWords?.toLocaleString() || 0, icon: '📝', color: 'purple' },
                      { label: 'This Week', value: stats.recentCount, icon: '🔥', color: 'orange' },
                      { label: 'Subjects', value: Object.keys(stats.bySubject || {}).length, icon: '🎓', color: 'green' },
                    ].map(card => (
                      <div key={card.label} className="glass rounded-2xl p-4 border border-white/10">
                        <p className="text-2xl mb-1">{card.icon}</p>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-xs text-slate-400">{card.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* By type */}
                  <div className="glass rounded-2xl p-5 border border-white/10 mb-4">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Notes by Type</h3>
                    <div className="space-y-3">
                      {Object.entries(stats.byType || {}).map(([type, count]: any) => (
                        <div key={type} className="flex items-center gap-3">
                          <span className="text-lg w-6">{sourceIcon(type)}</span>
                          <span className="text-sm text-slate-300 w-20 capitalize">{type}</span>
                          <div className="flex-1 bg-white/5 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.round((count / stats.totalNotes) * 100)}%` }} />
                          </div>
                          <span className="text-sm text-slate-400 w-8 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By subject */}
                  <div className="glass rounded-2xl p-5 border border-white/10">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Notes by Subject</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.bySubject || {}).map(([subject, count]: any) => (
                        <div key={subject}
                          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                          <span className="text-xs font-medium text-white">{subject}</span>
                          <span className="text-xs text-slate-400 bg-white/10 rounded-full px-1.5 py-0.5">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-sm">No stats available yet. Upload some notes!</div>
              )}
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <div>
              <p className="text-slate-400 text-sm mb-4">{history.length} notes uploaded</p>
              {loading ? (
                <div className="text-slate-500 text-sm">Loading history…</div>
              ) : history.length === 0 ? (
                <div className="glass rounded-2xl p-8 border border-white/10 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-slate-400">No notes yet. Upload your first note!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(note => (
                    <motion.div key={note.id}
                      initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="glass rounded-2xl p-4 border border-white/10 hover:border-blue-500/30 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="text-xl shrink-0 mt-0.5">{sourceIcon(note.sourceType)}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{note.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-blue-400">{note.subject}</span>
                              <span className="text-xs text-slate-600">·</span>
                              <span className="text-xs text-purple-400">{note.chapter}</span>
                              {note.wordCount > 0 && (
                                <>
                                  <span className="text-xs text-slate-600">·</span>
                                  <span className="text-xs text-slate-500">{note.wordCount} words</span>
                                </>
                              )}
                            </div>
                            {note.keywords?.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {note.keywords.slice(0, 4).map((k: string) => (
                                  <span key={k} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
                                    {k}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-500">{formatDate(note.createdAt)}</p>
                          {note.isShared && <p className="text-xs text-green-400 mt-1">🌍 Shared</p>}
                          {note.upvotes > 0 && <p className="text-xs text-yellow-400">⬆️ {note.upvotes}</p>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Full Name</label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Email Address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="your@email.com" />
                </div>
                <motion.button onClick={saveProfile} disabled={saving}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl py-3 font-bold text-white transition mt-2">
                  {saving ? '⏳ Saving…' : '✅ Save Changes'}
                </motion.button>
              </div>
            </div>
          )}

          {/* ── PASSWORD TAB ── */}
          {tab === 'password' && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Current Password</label>
                  <input value={currentPw} onChange={e => setCurrentPw(e.target.value)} type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="Enter current password" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">New Password</label>
                  <input value={newPw} onChange={e => setNewPw(e.target.value)} type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Confirm New Password</label>
                  <input value={confirmPw} onChange={e => setConfirmPw(e.target.value)} type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="Repeat new password" />
                </div>
                {newPw && confirmPw && newPw !== confirmPw && (
                  <p className="text-xs text-red-400">⚠️ Passwords do not match</p>
                )}
                {newPw && newPw.length < 6 && (
                  <p className="text-xs text-yellow-400">⚠️ Password must be at least 6 characters</p>
                )}
                <motion.button onClick={changePassword} disabled={changingPw}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl py-3 font-bold text-white transition mt-2">
                  {changingPw ? '⏳ Changing…' : '🔒 Change Password'}
                </motion.button>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
