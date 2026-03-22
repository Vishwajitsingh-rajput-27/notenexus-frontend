'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { apiGetNotes, apiGetNote } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL;

const diffStyle: Record<string, { bg: string; border: string; text: string }> = {
  Easy:   { bg: '#052e16', border: '#16a34a', text: '#4ade80' },
  Medium: { bg: '#1c1917', border: '#d97706', text: '#fbbf24' },
  Hard:   { bg: '#1c0a0a', border: '#dc2626', text: '#f87171' },
};

const sourceIcon = (type: string) => {
  if (type === 'pdf')     return '📄';
  if (type === 'image')   return '🖼️';
  if (type === 'voice')   return '🎤';
  if (type === 'youtube') return '▶️';
  return '📝';
};

function Collapsible({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) setHeight(ref.current.scrollHeight);
  }, [open, children]);

  return (
    <motion.div
      animate={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
      initial={false}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{ overflow: 'hidden' }}
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}

export default function ExamPredictor({
  preloadContent = '',
  preloadSubject = '',
}: {
  preloadContent?: string;
  preloadSubject?: string;
}) {
  const [noteContent, setNoteContent] = useState(preloadContent);
  const [subject, setSubject]         = useState(preloadSubject);
  const [examType, setExamType]       = useState('mixed');
  const [count, setCount]             = useState(10);
  const [questions, setQuestions]     = useState<any[]>([]);
  const [meta, setMeta]               = useState<any>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [subjects, setSubjects]       = useState<string[]>([]);
  const [openIdx, setOpenIdx]         = useState<number | null>(null);

  // ── Select Note state ────────────────────────────────────────────────────
  const [notes, setNotes]             = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showNotes, setShowNotes]     = useState(false);
  const [loadedFrom, setLoadedFrom]   = useState('');

  useEffect(() => { if (preloadContent) setNoteContent(preloadContent); }, [preloadContent]);
  useEffect(() => { if (preloadSubject) setSubject(preloadSubject); }, [preloadSubject]);

  // Fetch saved notes on mount
  useEffect(() => {
    setLoadingNotes(true);
    apiGetNotes()
      .then(d => setNotes(d.notes || []))
      .catch(() => {})
      .finally(() => setLoadingNotes(false));
  }, []);

  useEffect(() => {
    const token = Cookies.get('nn_token');
    fetch(`${API}/api/exam/subjects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setSubjects(d.subjects || [])).catch(() => {});
  }, []);

  // Load full note content when user picks one
  const loadFromNote = async (noteId: string) => {
    if (!noteId) return;
    try {
      const data = await apiGetNote(noteId);
      setNoteContent(data.content || '');
      setSubject(data.subject || '');
      setLoadedFrom(`${sourceIcon(data.sourceType)} ${data.title}`);
      setShowNotes(false);
      setQuestions([]);
    } catch { setError('Could not load note'); }
  };

  const predict = async () => {
    if (!noteContent.trim()) return setError('Paste your notes or load a saved note first');
    setError(''); setLoading(true); setQuestions([]); setOpenIdx(null);
    try {
      const token = Cookies.get('nn_token');
      const res = await fetch(`${API}/api/exam/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noteContent, subject, examType, count, aiModel: 'groq' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions || []);
      setMeta(data.meta);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">🎯 Exam Predictor</h2>
        <p className="text-slate-400 text-sm">Paste notes or load a saved note — AI predicts likely exam questions</p>
      </div>

      <div className="glass rounded-2xl p-5 mb-4 space-y-4">

        {/* ── Select Note ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-400">📂 Load from a saved note</label>
            <button
              onClick={() => setShowNotes(v => !v)}
              className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg hover:bg-blue-600/30 transition"
            >
              📋 Select Note {showNotes ? '▲' : '▼'}
            </button>
          </div>

          {showNotes && (
            <div className="bg-black/20 rounded-xl p-2 max-h-52 overflow-y-auto border border-white/10 mb-2">
              {loadingNotes && (
                <p className="text-slate-500 text-xs text-center py-4">Loading notes…</p>
              )}
              {!loadingNotes && notes.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-4">No saved notes found</p>
              )}
              {notes.map((note: any) => (
                <button
                  key={note._id}
                  onClick={() => loadFromNote(note._id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition border border-white/5 mb-1"
                >
                  <p className="text-white text-sm font-medium truncate">
                    {sourceIcon(note.sourceType)} {note.title}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-blue-400">{note.subject}</span>
                    <span className="text-xs text-purple-400">{note.chapter}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {loadedFrom && (
            <p className="text-xs text-blue-400 mb-2">✅ Loaded from: {loadedFrom}</p>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">or paste text manually</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <textarea
          className="w-full h-36 bg-black/20 rounded-xl p-3 text-slate-100 text-sm resize-none outline-none border border-white/10 focus:border-blue-500/50 transition-colors"
          placeholder="Paste notes here, or select a saved note above..."
          value={noteContent}
          onChange={e => { setNoteContent(e.target.value); setLoadedFrom(''); }}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Subject</label>
            <input
              list="subject-list"
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="e.g. Physics"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
            <datalist id="subject-list">
              {subjects.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Exam Type</label>
            <select
              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={examType}
              onChange={e => setExamType(e.target.value)}
            >
              <option value="mixed">Mixed</option>
              <option value="MCQ">MCQ Only</option>
              <option value="short">Short Answer</option>
              <option value="long">Long Answer</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Questions: {count}</label>
            <input
              type="range" min={5} max={20} value={count}
              onChange={e => setCount(+e.target.value)}
              className="w-full accent-blue-500 mt-2"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={predict}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition-colors"
        >
          {loading ? '🔮 Predicting questions...' : '🎯 Predict Exam Questions'}
        </button>
      </div>

      {/* Stats bar */}
      {meta && (
        <div className="flex gap-3 mb-4 flex-wrap">
          {Object.entries(meta.stats || {}).map(([diff, n]: any) => (
            <span
              key={diff}
              className="text-xs px-3 py-1 rounded-full font-bold"
              style={{
                background: diffStyle[diff]?.bg,
                color: diffStyle[diff]?.text,
                border: `1px solid ${diffStyle[diff]?.border}`,
              }}
            >
              {diff}: {n}
            </span>
          ))}
          {meta.usedModel && (
            <span className="text-xs text-slate-500 self-center ml-auto">via {meta.usedModel}</span>
          )}
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {questions.map((q: any, i: number) => {
          const s = diffStyle[q.difficulty] || diffStyle.Medium;
          const isOpen = openIdx === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: s.border, background: s.bg }}
            >
              <button className="w-full text-left p-4" onClick={() => setOpenIdx(isOpen ? null : i)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-bold mr-2" style={{ color: s.text }}>Q{i + 1}</span>
                    <span className="text-white text-sm">{q.question}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: s.border + '33', color: s.text }}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">{q.type}</span>
                    <span className="text-slate-500 text-xs transition-transform duration-200"
                      style={{ display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▼
                    </span>
                  </div>
                </div>
                {q.topic && <p className="text-xs text-slate-500 mt-1 ml-5">Topic: {q.topic}</p>}
              </button>

              <Collapsible open={isOpen}>
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5">
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.options.map((opt: string, j: number) => (
                        <div key={j} className="text-xs bg-black/20 rounded-lg p-2 text-slate-300 border border-white/5">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="bg-black/30 rounded-xl p-4 border border-green-500/20">
                    <p className="text-xs font-bold text-green-400 mb-2">✅ Model Answer</p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {q.answer || 'No answer provided'}
                    </p>
                  </div>
                </div>
              </Collapsible>
            </motion.div>
          );
        })}
      </div>

      {questions.length === 0 && !loading && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-5xl mb-4">🎯</div>
          <p className="font-medium text-slate-400">No questions yet</p>
          <p className="text-sm mt-1">Paste your notes above and click Predict</p>
        </div>
      )}
    </div>
  );
}
