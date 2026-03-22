'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { apiRevision, apiGetNotes, apiGetNote } from '@/lib/api'

type Mode = 'flashcards' | 'questions'

const sourceIcon = (type: string) => {
  if (type === 'pdf')     return '📄'
  if (type === 'image')   return '🖼️'
  if (type === 'voice')   return '🎤'
  if (type === 'youtube') return '▶️'
  return '📝'
}

export default function Flashcards() {
  const [text, setText]       = useState('')
  const [mode, setMode]       = useState<Mode>('flashcards')
  const [cards, setCards]     = useState<any[]>([])
  const [idx, setIdx]         = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAns, setShowAns] = useState(false)
  const [notes, setNotes]     = useState<any[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [selectedNote, setSelectedNote] = useState('')
  const [loadedFrom, setLoadedFrom]     = useState('')

  useEffect(() => {
    const fetchNotes = async () => {
      setLoadingNotes(true)
      try {
        const data = await apiGetNotes()
        setNotes(data.notes || [])
      } catch { toast.error('Could not load saved notes') }
      finally { setLoadingNotes(false) }
    }
    fetchNotes()
  }, [])

  const loadFromNote = async (noteId: string) => {
    if (!noteId) { setText(''); setSelectedNote(''); setLoadedFrom(''); return }
    setSelectedNote(noteId)
    try {
      const data = await apiGetNote(noteId)
      setText(data.content || '')
      setLoadedFrom(`${sourceIcon(data.sourceType)} ${data.title}`)
      toast.success(`Loaded: ${data.title}`)
    } catch { toast.error('Could not load note') }
  }

  const generate = async () => {
    if (!text.trim()) { toast.error('Paste some notes or load a saved note first!'); return }
    setLoading(true)
    try {
      const data = await apiRevision(text, mode)
      setCards(Array.isArray(data.result) ? data.result : [])
      setIdx(0); setFlipped(false); setShowAns(false)
      toast.success(`${data.result?.length || 0} ${mode} generated!`)
    } catch { toast.error('Generation failed') }
    finally { setLoading(false) }
  }

  const next = () => { setIdx(i => Math.min(cards.length-1, i+1)); setFlipped(false); setShowAns(false) }
  const prev = () => { setIdx(i => Math.max(0, i-1)); setFlipped(false); setShowAns(false) }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Revision Cards</h2>
      <p className="text-slate-400 text-sm mb-6">Generate flashcards or Q&amp;A from any uploaded note — PDF, image, voice, YouTube, or manual text.</p>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        {(['flashcards', 'questions'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${mode === m ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white glass-hover'}`}>
            {m === 'flashcards' ? '🃏 Flashcards' : '📝 Practice Q&A'}
          </button>
        ))}
      </div>

      {/* Load from saved note */}
      <div className="mb-3">
        <label className="text-xs text-slate-400 mb-1.5 block font-medium">📂 Load from a saved note</label>
        <select value={selectedNote} onChange={e => loadFromNote(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition cursor-pointer">
          <option value="">— Select a saved note —</option>
          {loadingNotes
            ? <option disabled>Loading notes…</option>
            : notes.map(n => (
                <option key={n._id} value={n._id}>
                  {sourceIcon(n.sourceType)} {n.title} · {n.subject} — {n.chapter}
                </option>
              ))
          }
        </select>
        {loadedFrom && (
          <p className="text-xs text-blue-400 mt-1.5">✅ Loaded from: {loadedFrom}</p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-slate-500">or paste text manually</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <textarea value={text} onChange={e => { setText(e.target.value); setSelectedNote(''); setLoadedFrom('') }}
        placeholder="Paste your notes here…"
        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none mb-4 transition" />

      <motion.button onClick={generate} disabled={loading || !text.trim()}
        whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl py-3 font-bold text-white transition mb-6">
        {loading ? '⏳ Generating with AI…' : `✨ Generate ${mode === 'flashcards' ? 'Flashcards' : 'Questions'}`}
      </motion.button>

      {/* Cards display */}
      <AnimatePresence>
        {cards.length > 0 && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-500">Card {idx+1} of {cards.length}</p>
              <div className="flex gap-1">
                {cards.map((_,i) => (
                  <button key={i} onClick={() => { setIdx(i); setFlipped(false); setShowAns(false) }}
                    className={`w-2 h-2 rounded-full transition ${i === idx ? 'bg-blue-500' : 'bg-white/10'}`} />
                ))}
              </div>
              {mode === 'flashcards' && <p className="text-xs text-slate-500">Click card to flip</p>}
            </div>

            {mode === 'flashcards' ? (
              <div className="flip-card w-full" style={{ height: 220 }}>
                <div className={`flip-inner w-full h-full ${flipped ? 'flipped' : ''}`}
                  onClick={() => setFlipped(f => !f)} style={{ cursor:'pointer' }}>
                  <div className="flip-front w-full h-full glass rounded-2xl flex flex-col items-center justify-center p-8 border border-white/10 hover:border-blue-500/40 transition">
                    <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-4">Question</p>
                    <p className="text-center text-white text-lg leading-relaxed">{cards[idx]?.question}</p>
                  </div>
                  <div className="flip-back w-full h-full bg-blue-600/20 border border-blue-500/30 rounded-2xl flex flex-col items-center justify-center p-8">
                    <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-4">Answer</p>
                    <p className="text-center text-white text-lg leading-relaxed">{cards[idx]?.answer}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 border border-white/10 min-h-[160px] flex flex-col justify-center">
                <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-3">
                  Question {idx+1} — {cards[idx]?.type}
                </p>
                <p className="text-white text-lg mb-4">{cards[idx]?.question}</p>
                {cards[idx]?.hint && !showAns && (
                  <p className="text-xs text-slate-500 italic">💡 Hint: {cards[idx].hint}</p>
                )}
                <button onClick={() => setShowAns(s => !s)}
                  className="mt-4 text-xs text-blue-400 hover:text-blue-300 transition self-start">
                  {showAns ? '▲ Hide Answer' : '▼ Show Answer'}
                </button>
                <AnimatePresence>
                  {showAns && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                      className="mt-3 border-t border-white/10 pt-3 overflow-hidden">
                      <p className="text-green-400 text-sm">{cards[idx]?.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <motion.button onClick={prev} disabled={idx === 0} whileTap={{ scale:0.95 }}
                className="flex-1 glass hover:bg-white/10 disabled:opacity-30 rounded-xl py-2.5 font-medium text-slate-300 transition">
                ← Prev
              </motion.button>
              <motion.button onClick={next} disabled={idx === cards.length-1} whileTap={{ scale:0.95 }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-xl py-2.5 font-medium text-white transition">
                Next →
              </motion.button>
            </div>

            {/* Restart */}
            <button onClick={() => { setCards([]); setIdx(0); setFlipped(false) }}
              className="w-full mt-3 text-xs text-slate-500 hover:text-slate-300 transition py-2">
              🔄 Generate new set
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
