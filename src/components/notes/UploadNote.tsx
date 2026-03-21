'use client'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { apiUploadNote } from '@/lib/api'

const TYPES = [
  { value: 'pdf',     label: '📄 PDF',           accept: { 'application/pdf': ['.pdf'] } },
  { value: 'image',   label: '🖼️ Image',         accept: { 'image/*': ['.jpg','.jpeg','.png','.webp'] } },
  { value: 'voice',   label: '🎙️ Voice',         accept: { 'audio/*': ['.mp3','.wav','.m4a','.webm'] } },
  { value: 'youtube', label: '▶️ YouTube URL',   accept: {} },
]

export default function UploadNote() {
  const [type, setType]       = useState('pdf')
  const [file, setFile]       = useState<File | null>(null)
  const [ytUrl, setYtUrl]     = useState('')
  const [title, setTitle]     = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<any>(null)

  const curr = TYPES.find(t => t.value === type)!

  const onDrop = useCallback((files: File[]) => { if (files[0]) setFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: curr.accept, multiple: false })

  const handleUpload = async () => {
    if (type !== 'youtube' && !file) { toast.error('Select a file first'); return }
    if (type === 'youtube' && !ytUrl.trim()) { toast.error('Enter a YouTube URL'); return }
    setLoading(true); setResult(null)
    try {
      const form = new FormData()
      form.append('sourceType', type)
      if (title) form.append('title', title)
      if (file) form.append('file', file)
      if (ytUrl) form.append('youtubeUrl', ytUrl)
      const data = await apiUploadNote(form)
      setResult(data)
      toast.success('Note saved and organised!')
      setFile(null); setYtUrl(''); setTitle('')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Upload failed — is the backend running?')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Upload a Note</h2>
      <p className="text-slate-400 mb-6 text-sm">AI will auto-detect subject, chapter and keywords.</p>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TYPES.map(t => (
          <button key={t.value} onClick={() => { setType(t.value); setFile(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${type === t.value ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white glass-hover'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title (optional — AI will generate one)"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-4 transition" />

      {/* File drop or YouTube */}
      {type === 'youtube' ? (
        <input value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-4 transition" />
      ) : (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 mb-4 text-center cursor-pointer transition ${isDragActive ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/50 hover:bg-white/3'}`}>
          <input {...getInputProps()} />
          {file
            ? <p className="text-green-400 font-medium">✅ {file.name} ({(file.size/1024).toFixed(0)} KB)</p>
            : <div className="text-slate-400"><div className="text-4xl mb-3">📁</div>
                <p>Drag & drop or <span className="text-blue-400">click to browse</span></p>
                <p className="text-xs mt-1 text-slate-500">{type === 'pdf' ? 'PDF' : type === 'image' ? 'JPG, PNG, WebP' : 'MP3, WAV, M4A'}</p>
              </div>}
        </div>
      )}

      <motion.button onClick={handleUpload} disabled={loading} whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl py-3 font-bold text-white transition">
        {loading ? '⏳ AI is processing…' : '🚀 Upload & Auto-Organise'}
      </motion.button>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
          className="mt-6 glass rounded-2xl p-5 border border-green-500/20">
          <p className="text-green-400 font-bold mb-3">✅ Note saved!</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[['Subject', result.subject, 'blue'], ['Chapter', result.chapter, 'purple']].map(([l, v, c]) => (
              <div key={l as string} className={`bg-${c}-500/10 border border-${c}-500/20 rounded-xl p-3`}>
                <p className="text-xs text-slate-400 mb-1">{l}</p>
                <p className={`font-semibold text-${c}-400`}>{v}</p>
              </div>
            ))}
          </div>
          {result.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {result.keywords.map((k: string) => (
                <span key={k} className="bg-white/5 text-slate-300 text-xs px-2 py-1 rounded-full">{k}</span>
              ))}
            </div>
          )}
          <p className="text-slate-400 text-xs italic line-clamp-2">{result.preview}…</p>
          <p className="text-slate-600 text-xs mt-1">{result.wordCount} words extracted</p>
        </motion.div>
      )}
    </div>
  )
}
