'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL;

const typeColors = {
  study:    { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd', icon: '📖' },
  revision: { bg: '#2d1b69', border: '#8b5cf6', text: '#c4b5fd', icon: '🔄' },
  practice: { bg: '#052e16', border: '#16a34a', text: '#4ade80', icon: '✍️' },
  rest:     { bg: '#1c1917', border: '#78716c', text: '#a8a29e', icon: '😴' },
};

export default function StudyPlanner() {
  const [subjects, setSubjects]     = useState('');
  const [examDate, setExamDate]     = useState('');
  const [dailyHours, setDailyHours] = useState(4);
  const [weakTopics, setWeakTopics] = useState('');
  const [studyStyle, setStudyStyle] = useState('mixed');
  const [aiModel, setAiModel]       = useState('gemini');
  const [plan, setPlan]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [expandedDay, setExpandedDay] = useState(null);

  // Min date = tomorrow
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
        body: JSON.stringify({ subjects: subArr, examDate, dailyHours, weakTopics, studyStyle, aiModel }),
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

  // Summary stats
  const stats = plan?.plan ? plan.plan.reduce((acc, day) => {
    if (day.restDay) { acc.restDays++; return acc; }
    acc.studyDays++;
    (day.sessions || []).forEach(s => { acc[s.type] = (acc[s.type] || 0) + 1; });
    return acc;
  }, { studyDays: 0, restDays: 0 }) : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">📅 Smart Study Planner</h2>
        <p className="text-gray-400 text-sm">AI builds your personalised day-by-day study schedule with spaced repetition</p>
      </div>

      {/* Form */}
      <div className="bg-gray-800 rounded-xl p-5 mb-6 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Subjects (comma-separated) *</label>
            <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="Physics, Chemistry, Maths"
              value={subjects} onChange={e => setSubjects(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Exam Date *</label>
            <input type="date" min={minDate}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={examDate} onChange={e => setExamDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Daily Study Hours: {dailyHours}h</label>
            <input type="range" min={1} max={12} value={dailyHours} onChange={e => setDailyHours(+e.target.value)}
              className="w-full accent-purple-500 mt-2" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Study Style</label>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={studyStyle} onChange={e => setStudyStyle(e.target.value)}>
              <option value="mixed">Mixed (Recommended)</option>
              <option value="intensive">Intensive (few long sessions)</option>
              <option value="spaced">Spaced (many short sessions)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Weak Topics (gets extra time)</label>
            <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="e.g. Integration, Organic Chemistry, Thermodynamics"
              value={weakTopics} onChange={e => setWeakTopics(e.target.value)} />
          </div>
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
        <button onClick={generate} disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 rounded-lg font-bold text-white transition-colors">
          {loading ? '✨ Generating your plan...' : '✨ Generate Study Plan'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex gap-3 mb-4 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full bg-blue-900 text-blue-300 border border-blue-700">📖 {stats.studyDays} study days</span>
          <span className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300 border border-gray-600">😴 {stats.restDays} rest days</span>
          {stats.revision > 0 && <span className="text-xs px-3 py-1 rounded-full bg-purple-900 text-purple-300 border border-purple-700">🔄 {stats.revision} revision sessions</span>}
          <span className="text-xs text-gray-500 self-center ml-auto">via {plan.usedModel}</span>
        </div>
      )}

      {/* Plan */}
      {plan?.plan && (
        <div className="space-y-2">
          {plan.plan.map((day) => {
            const isOpen = expandedDay === day.day;
            return (
              <motion.div key={day.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: day.day * 0.02 }}
                className={`rounded-xl border overflow-hidden ${day.restDay ? 'border-gray-700 bg-gray-800/50 opacity-70' : 'border-gray-700 bg-gray-800'}`}>
                <button className="w-full text-left p-4 flex items-center justify-between"
                  onClick={() => setExpandedDay(isOpen ? null : day.day)}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500 w-10">D{day.day}</span>
                    <span className={`font-medium text-sm ${day.restDay ? 'text-gray-500' : 'text-white'}`}>
                      {day.date} {day.restDay && '— 😴 Rest Day'}
                    </span>
                    {!day.restDay && day.sessions && (
                      <span className="text-xs text-gray-500">{day.sessions.length} sessions · {day.totalHours}h</span>
                    )}
                  </div>
                  {!day.restDay && <span className="text-gray-600">{isOpen ? '▲' : '▼'}</span>}
                </button>

                <AnimatePresence>
                  {isOpen && !day.restDay && day.sessions && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
                        {day.sessions.map((s, j) => {
                          const c = typeColors[s.type] || typeColors.study;
                          return (
                            <div key={j} className="rounded-lg p-3 border text-sm"
                              style={{ background: c.bg, borderColor: c.border }}>
                              <div className="flex justify-between mb-1">
                                <span className="font-bold" style={{ color: c.text }}>{c.icon} {s.subject}</span>
                                <span className="text-xs" style={{ color: c.text }}>{s.duration}h</span>
                              </div>
                              <p className="text-gray-300 text-xs">{s.topic}</p>
                              {s.notes && <p className="text-gray-500 text-xs mt-1 italic">{s.notes}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
