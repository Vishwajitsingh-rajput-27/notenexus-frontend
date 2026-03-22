'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { apiRevision, apiGetNotes, apiGetNote } from '@/lib/api'

const PALETTE = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899']

const sourceIcon = (type: string) => {
  if (type === 'pdf')     return '📄'
  if (type === 'image')   return '🖼️'
  if (type === 'voice')   return '🎤'
  if (type === 'youtube') return '▶️'
  return '📝'
}

interface MNode { label: string; children?: MNode[] }
interface MMap  { root: string; children: MNode[] }

function Node({ node, depth = 0, color = '#3b82f6' }: { node: MNode; depth?: number; color?: string }) {
  const [open, setOpen] = useState(true)
  const hasKids = (node.children?.length ?? 0) > 0
  const size = depth === 0 ? 'text-sm font-semibold' : 'text-xs'
  const opacity = Math.max(0.4, 1 - depth * 0.18)

  return (
    <div className="ml-0">
      <div className="flex items-center gap-2 my-1.5">
        {hasKids
          ? <button onClick={() => setOpen(o => !o)} className="text-slate-500 text-xs w-4 shrink-0">{open ? '▼' : '▶'}</button>
          : <span className="w-4 shrink-0 text-slate-600 text-xs">•</span>}
        <span className={`px-3 py-1 rounded-lg text-white ${size} shadow-sm cursor-default`}
          style={{ backgroundColor: color, opacity }}>
          {node.label}
        </span>
      </div>
      <AnimatePresence>
        {open && hasKids && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            className="ml-6 border-l pl-3 overflow-hidden" style={{ borderColor: color + '40' }}>
            {node.children!.map((child, i) => (
              <Node key={i} node={child} depth={depth+1} color={color} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MindMap({ preloadContent = '' }: { preloadContent?: string }) {
  const [text, setText]       = useState(preloadContent)
  const [map, setMap]         = useState<MMap | null>(null)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes]     = useState<any[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [selectedNote, setSelectedNote] = useState('')
  const [loadedFrom, setLoadedFrom]     = useState('')

  useEffect(() => {
    if (preloadContent) {
      setText(preloadContent)
      setSelectedNote('')
      setLoadedFrom('')
    }
  }, [preloadContent])

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
      const data = await apiRevision(text, 'mindmap')
      setMap(data.result)
      toast.success('Mind map generated!')
    } catch { toast.error('Generation failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">Mind Map Generator</h2>
      <p className="text-slate-400 text-sm mb-6">AI turns any uploaded note — PDF, image, voice, YouTube — into a visual topic map.</p>

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
        className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 rounded-xl py-3 font-bold text-white transition mb-6">
        {loading ? '⏳ Building Mind Map…' : '🗺️ Generate Mind Map'}
      </motion.button>

      <AnimatePresence>
        {map && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            className="glass rounded-2xl p-6 border border-white/10">
            {/* Root */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30">
                {map.root}
              </div>
              <button onClick={() => setMap(null)}
                className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition">
                🔄 Reset
              </button>
            </div>
            {/* Tree */}
            <div className="border-l-2 border-blue-500/30 pl-4 space-y-1">
              {map.children?.map((child, i) => (
                <Node key={i} node={child} depth={0} color={PALETTE[i % PALETTE.length]} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
