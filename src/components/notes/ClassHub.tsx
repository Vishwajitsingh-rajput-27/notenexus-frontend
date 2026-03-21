'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { apiGetSharedNotes, apiUpvoteNote } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/lib/store'

const SOURCE_ICONS: Record<string,string> = { pdf:'📄', image:'🖼️', youtube:'▶️', voice:'🎙️', whatsapp:'💬', text:'📝' }

export default function ClassHub() {
  const [notes, setNotes]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const socket   = useSocket()

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiGetSharedNotes()
      setNotes(data.notes || [])
    } catch { toast.error('Could not load shared notes') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    // Live upvote updates from other users
    if (socket) {
      socket.on('upvote-update', ({ noteId, upvotes }: any) => {
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, upvotes } : n))
      })
      return () => { socket.off('upvote-update') }
    }
  }, [socket])

  const handleUpvote = async (note: any) => {
    try {
      const data = await apiUpvoteNote(note._id)
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, upvotes: data.upvotes } : n))
      // Broadcast live update
      socket?.emit('note-upvoted', { noteId: note._id, upvotes: data.upvotes })
      toast.success(data.upvoted ? '👍 Upvoted!' : 'Removed upvote')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Class Hub</h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        Community-shared notes. Share your own from the <span className="text-blue-400">My Notes</span> tab.
        Upvotes update live via Socket.io.
      </p>

      <button onClick={load} className="text-xs text-blue-400 hover:text-blue-300 mb-4 block transition">↻ Refresh</button>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_,i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-5xl mb-4">👥</div>
          <p className="font-medium text-slate-400">No shared notes yet</p>
          <p className="text-sm mt-1">Be the first! Share a note from the My Notes tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notes.map((note, i) => (
              <motion.div key={note._id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 glass-hover transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-2xl shrink-0">{SOURCE_ICONS[note.sourceType] || '📝'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">{note.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{note.subject}</span>
                        <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">{note.chapter}</span>
                      </div>
                      {note.userId?.name && (
                        <p className="text-xs text-slate-500">
                          Shared by <span className="text-slate-400">{note.userId.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <motion.button onClick={() => handleUpvote(note)}
                      whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-xl px-3 py-1.5 transition">
                      <span className="text-sm">👍</span>
                      <span className="text-sm font-bold text-white">{note.upvotes || 0}</span>
                    </motion.button>
                    {note.fileUrl?.startsWith('http') && (
                      <a href={note.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition">View file 🔗</a>
                    )}
                  </div>
                </div>
                {note.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                    {note.keywords.map((k: string) => (
                      <span key={k} className="bg-white/5 text-slate-400 text-xs px-2 py-0.5 rounded">{k}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
