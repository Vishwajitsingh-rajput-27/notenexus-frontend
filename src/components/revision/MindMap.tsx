'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { apiRevision } from '@/lib/api'

const PALETTE = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899']

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

export default function MindMap() {
  const [text, setText]   = useState('')
  const [map, setMap]     = useState<MMap | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!text.trim()) { toast.error('Paste some notes first!'); return }
    setLoading(true)
    try {
      const data = await apiRevision(text, 'mindmap')
      setMap(data.result)
      toast.success('Mind map generated!')
    } catch { toast.error('Generation failed — check your OpenAI key') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-1">Mind Map Generator</h2>
      <p className="text-slate-400 text-sm mb-6">AI turns your notes into a visual topic relationship map.</p>

      <textarea value={text} onChange={e => setText(e.target.value)}
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
            {/* Root node */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30">
                {map.root}
              </div>
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
