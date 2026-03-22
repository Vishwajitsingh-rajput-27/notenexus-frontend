'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL;
const typeColors = {
  study:    { bg: '#1e3a5f33', border: '#3b82f6', text: '#93c5fd', icon: '📖' },
  revision: { bg: '#2d1b6933', border: '#8b5cf6', text: '#c4b5fd', icon: '🔄' },
  practice: { bg: '#052e1633', border: '#16a34a', text: '#4ade80', icon: '✍️' },
  rest:     { bg: '#1c191733', border: '#78716c', text: '#a8a29e', icon: '😴' },
};

export default function StudyPlanner({ preloadSubject = '' }) {
  const [subjects, setSubjects]     = useState(preloadSubject || '');
  const [examDate, setExamDate]     = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [weakTopics, setWeakTopics] = useState('');
  const [plan, setPlan]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [expandedDay, setExpandedDay] = useState(null);

  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const generate = async () => {
    const subArr = subjects.split(',').map(s => s.trim()).filter(Boolean);
    if (!subArr.length) return setError('Add at least one subject');
    if (!examDate) return setError('Select your exam date');
    setError(''); setLoading(true); setPlan(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/planner/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subjects: subArr, examDate, dailyHours, weakTopics, aiModel: 'groq' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlan(data);
      setExpandedDay(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">📅 Smart Study Planner</h2>
        <p className="text-slate-400 text-sm">AI builds your personalised day-by-day study schedule</p>
      </div>

      <div className="glass rounded-2xl p-5 mb-6 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Subjects (comma-separated) *</label>
            <input className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="Physics, Chemistry, Maths"
              value={subjects} onChange={e => setSubjects(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Exam Date *</label>
            <input type="date" min={minDate}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              value={examDate} onChange={e => setExamDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Daily Study Hours: {dailyHours}h</label>
            <input type="range" min={1} max={12} value={dailyHours}
              onChange={e => setDailyHours(+e.target.value)}
              className="w-full accent-purple-500 mt-2" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Weak Topics (gets extra time)</label>
            <input className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
              placeholder="e.g. Integration, Thermodynamics"
              value={weakTopics} onChange={e => setWeakTopics(e.target.value)} />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={generate} disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition">
          {loading ? '✨ Generating your plan...' : '✨ Generate Study Plan'}
        </button>
      </div>

      {plan?.plan && (
        <div className="space-y-2">
          {plan.plan.map((day) => {
            const isOpen = expandedDay === day.day;
            return (
              <motion.div key={day.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: day.day * 0.02 }}
                className={`rounded-xl border overflow-hidden ${day.restDay ? 'border-white/5 opacity-60' : 'border-white/10'} glass`}>
                <button className="w-full text-left p-4 flex items-center justify-between"
                  onClick={() => setExpandedDay(isOpen ? null : day.day)}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-10">D{day.day}</span>
                    <span className={`font-medium text-sm ${day.restDay ? 'text-slate-500' : 'text-white'}`}>
                      {day.date} {day.restDay && '— 😴 Rest Day'}
                    </span>
                    {!day.restDay && day.sessions && (
                      <span className="text-xs text-slate-500">{day.sessions.length} sessions · {day.totalHours}h</span>
                    )}
                  </div>
                  {!day.restDay && (
                    <span className="text-slate-600 text-xs">{isOpen ? '▲' : '▼'}</span>
                  )}
                </button>
                {isOpen && !day.restDay && day.sessions && (
                  <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2 border-t border-white/5 pt-3">
                    {day.sessions.map((s, j) => {
                      const c = typeColors[s.type] || typeColors.study;
                      return (
                        <div key={j} className="rounded-xl p-3 border text-sm"
                          style={{ background: c.bg, borderColor: c.border }}>
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm" style={{ color: c.text }}>{c.icon} {s.subject}</span>
                            <span className="text-xs" style={{ color: c.text }}>{s.duration}h</span>
                          </div>
                          <p className="text-slate-300 text-xs">{s.topic}</p>
                          {s.notes && <p className="text-slate-500 text-xs mt-1 italic">{s.notes}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
