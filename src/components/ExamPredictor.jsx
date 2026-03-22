'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL;
const diffStyle = {
  Easy:   { bg: '#052e16', border: '#16a34a', text: '#4ade80' },
  Medium: { bg: '#1c1917', border: '#d97706', text: '#fbbf24' },
  Hard:   { bg: '#1c0a0a', border: '#dc2626', text: '#f87171' },
};

export default function ExamPredictor() {
  const [noteContent, setNoteContent] = useState('');
  const [subject, setSubject]         = useState('');
  const [examType, setExamType]       = useState('mixed');
  const [count, setCount]             = useState(10);
  const [aiModel, setAiModel]         = useState('gemini');
  const [questions, setQuestions]     = useState([]);
  const [meta, setMeta]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [subjects, setSubjects]       = useState([]);
  const [openIdx, setOpenIdx]         = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/api/exam/subjects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setSubjects(d.subjects || [])).catch(() => {});
  }, []);

  const predict = async () => {
    if (!noteContent.trim()) return setError('Paste your notes first');
    setError(''); setLoading(true); setQuestions([]);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/exam/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noteContent, subject, examType, count, aiModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setMeta(data.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">🎯 Exam Predictor</h2>
        <p className="text-gray-400 text-sm">Paste your notes — AI predicts likely exam questions with model answers</p>
      </div>

      {/* Input */}
      <div className="bg-gray-800 rounded-xl p-5 mb-4 space-y-4">
        <textarea
          className="w-full h-36 bg-gray-900 rounded-lg p-3 text-gray-100 text-sm resize-none outline-none border border-gray-700 focus:border-blue-500 transition-colors"
          placeholder="Paste your notes or textbook content here... (minimum 50 characters)"
          value={noteContent} onChange={e => setNoteContent(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Subject */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Subject</label>
            <input
              list="subject-list" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="e.g. Physics" value={subject} onChange={e => setSubject(e.target.value)}
            />
            <datalist id="subject-list">{subjects.map(s => <option key={s} value={s} />)}</datalist>
          </div>
          {/* Exam Type */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Exam Type</label>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={examType} onChange={e => setExamType(e.target.value)}>
              <option value="mixed">Mixed</option>
              <option value="MCQ">MCQ Only</option>
              <option value="short">Short Answer</option>
              <option value="long">Long Answer</option>
            </select>
          </div>
          {/* Count */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Questions: {count}</label>
            <input type="range" min={5} max={20} value={count} onChange={e => setCount(+e.target.value)}
              className="w-full accent-blue-500 mt-2" />
          </div>
          {/* AI Model */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">AI Model</label>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={aiModel} onChange={e => setAiModel(e.target.value)}>
              <option value="gemini">Gemini</option>
              <option value="grok">Grok</option>
            </select>
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={predict} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg font-bold text-white transition-colors">
          {loading ? '🔮 Predicting questions...' : '🎯 Predict Exam Questions'}
        </button>
      </div>

      {/* Stats bar */}
      {meta && (
        <div className="flex gap-3 mb-4 flex-wrap">
          {Object.entries(meta.stats).map(([diff, n]) => (
            <span key={diff} className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: diffStyle[diff]?.bg, color: diffStyle[diff]?.text, border: `1px solid ${diffStyle[diff]?.border}` }}>
              {diff}: {n}
            </span>
          ))}
          <span className="text-xs text-gray-500 self-center ml-auto">via {meta.usedModel}</span>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        <AnimatePresence>
          {questions.map((q, i) => {
            const s = diffStyle[q.difficulty] || diffStyle.Medium;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: s.border, background: s.bg }}>
                <button className="w-full text-left p-4" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold mr-2" style={{ color: s.text }}>Q{i + 1}</span>
                      <span className="text-white text-sm">{q.question}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: s.border + '33', color: s.text }}>{q.difficulty}</span>
                      <span className="text-xs text-gray-400">{q.type}</span>
                    </div>
                  </div>
                  {q.topic && <p className="text-xs text-gray-500 mt-1 ml-5">Topic: {q.topic}</p>}
                </button>
                <AnimatePresence>
                  {openIdx === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        {q.options && (
                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, j) => (
                              <div key={j} className="text-xs bg-black/20 rounded p-2 text-gray-300">{opt}</div>
                            ))}
                          </div>
                        )}
                        <div className="bg-black/30 rounded-lg p-3">
                          <p className="text-xs font-bold text-green-400 mb-1">✅ Model Answer</p>
                          <p className="text-sm text-gray-200">{q.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
