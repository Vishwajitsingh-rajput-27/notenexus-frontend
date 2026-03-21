'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { apiGetNotes, apiGetSubjects, apiDeleteNote, apiShareNote } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'

const SOURCE_ICONS: Record<string, string> = {
  pdf: '📄', image: '🖼️', youtube: '▶️', voice: '🎙️', whatsapp: '💬', text: '📝'
}

export default function NotesList() {
  const [notes, setNotes]       = useState<any[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [filter, setFilter]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const socket = useSocket()

  const load = async () => {
    setLoading(true)
    try {
      const [n, s] = await Promise.all([apiGetNotes(filter || undefined), apiGetSubjects()])
      setNotes(n.notes || [])
      setSubjects(s.subjects || [])
    } catch { toast.error('Could not load notes') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return
    try {
      await apiDeleteNote(id)
      setNotes(p => p.filter(n => n._id !== id))
      toast.success('Note deleted')
    } catch { toast.error('Delete failed') }
  }

  const handleShare = async (id: string, current: boolean) => {
    try {
      await apiShareNote(id, !current)
      setNotes(p => p.map(n => n._id === id ? { ...n, isShared: !current } : n))
      toast.success(!current ? 'Shared to Class Hub!' : 'Unshared')
      if (!current && socket) {
        const note = notes.find(n => n._id === id)
        socket.emit('new-shared-note', { title: note?.title, subject: note?.subject, userName: 'You' })
      }
    } catch { toast.error('Failed') }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Notes</h2>
          <p className="text-slate-400 text-sm">{notes.length} notes saved</p>
        </div>
        <button onClick={load} className="text-sm text-blue-400 hover:text-blue-300 transition">↻ Refresh</button>
      </div>

      {/* Subject filters */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {['', ...subjects].map(s => (
            <button key={s || 'all'} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === s ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white glass-hover'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-medium text-slate-400">No notes yet</p>
          <p className="text-sm mt-1">Upload your first note from the Upload tab!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notes.map((note, i) => (
              <motion.div key={note._id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl overflow-hidden glass-hover transition">
                <div className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => setExpanded(expanded === note._id ? null : note._id)}>
                  <span className="text-2xl shrink-0">{SOURCE_ICONS[note.sourceType] || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{note.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{note.subject}</span>
                      <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">{note.chapter}</span>
                      <span className="bg-white/5 text-slate-500 text-xs px-2 py-0.5 rounded-full">{note.sourceType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={e => { e.stopPropagation(); handleShare(note._id, note.isShared) }}
                      className={`text-xs px-2 py-1 rounded-lg transition ${note.isShared ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                      {note.isShared ? '✓ Shared' : 'Share'}
                    </button>
                    {note.fileUrl && note.fileUrl.startsWith('http') && (
                      <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()} className="text-slate-500 hover:text-blue-400 transition">🔗</a>
                    )}
                    <button onClick={e => { e.stopPropagation(); handleDelete(note._id) }}
                      className="text-slate-500 hover:text-red-400 transition">🗑️</button>
                    <span className="text-slate-600 text-sm">{expanded === note._id ? '▲' : '▼'}</span>
                  </div>
                </div>
                <AnimatePresence>
                  {expanded === note._id && note.keywords?.length > 0 && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                      className="border-t border-white/5 px-4 py-3 overflow-hidden">
                      <p className="text-xs text-slate-500 mb-2">Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {note.keywords.map((k: string) => (
                          <span key={k} className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-0.5 rounded">{k}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
