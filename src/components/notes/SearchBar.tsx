'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { apiSearch } from '@/lib/api'

const EXAMPLES = [
  "What are Newton's Laws of Motion?",
  "Explain photosynthesis",
  "Key dates in World War 2",
  "What is the quadratic formula?",
  "Explain osmosis and diffusion",
]

const SOURCE_ICONS: Record<string, string> = {
  pdf:'📄', image:'🖼️', youtube:'▶️', voice:'🎙️', whatsapp:'💬'
}

const scoreColor = (s: number) =>
  s > 0.85 ? 'text-green-400 bg-green-400/10' :
  s > 0.70 ? 'text-yellow-400 bg-yellow-400/10' :
             'text-slate-400 bg-white/5'

export default function SearchBar() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const search = async (q?: string) => {
    const qStr = q ?? query
    if (!qStr.trim()) return
    setQuery(qStr)
    setLoading(true); setDone(true)
    try {
      const data = await apiSearch(qStr)
      setResults(data.results || [])
    } catch { toast.error('Search failed — is the backend running?') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">Search Your Notes</h2>
      <p className="text-slate-400 text-sm mb-6">Ask anything in plain English — powered by semantic vector search.</p>

      {/* Search box */}
      <div className="flex gap-3 mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="e.g. What did I note about osmosis?"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition" />
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => search()} disabled={loading || !query.trim()}
          className="px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl font-semibold text-white transition">
          {loading ? '⏳' : '🔍'}
        </motion.button>
      </div>

      {/* Example chips */}
      {!done && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(ex => (
              <button key={ex} onClick={() => search(ex)}
                className="text-xs glass text-slate-400 hover:text-blue-400 px-3 py-1.5 rounded-full transition glass-hover">
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {done && !loading && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
            <p className="text-xs text-slate-500 mb-3 mt-6">
              {results.length} result{results.length !== 1 ? 's' : ''} for <span className="text-slate-300">"{query}"</span>
            </p>
            {results.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-4xl mb-3">🔎</div>
                <p>No matches — try uploading more notes first!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((r, i) => (
                  <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl p-4 glass-hover transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-xl shrink-0">{SOURCE_ICONS[r.metadata?.sourceType] || '📝'}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{r.metadata?.title || 'Untitled'}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {r.metadata?.subject && <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{r.metadata.subject}</span>}
                            {r.metadata?.chapter && <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">{r.metadata.chapter}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(r.score)}`}>
                          {(r.score * 100).toFixed(0)}%
                        </span>
                        {r.metadata?.fileUrl?.startsWith('http') && (
                          <a href={r.metadata.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="text-slate-500 hover:text-blue-400 text-sm transition">🔗</a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
