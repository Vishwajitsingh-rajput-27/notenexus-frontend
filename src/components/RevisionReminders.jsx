'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL;
const INTERVALS = [1, 3, 7, 14, 30];

export default function RevisionReminders() {
  const [reminders, setReminders] = useState([]);
  const [subject, setSubject]     = useState('');
  const [topic, setTopic]         = useState('');
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const token = () => localStorage.getItem('token');

  const fetchReminders = async () => {
    try {
      const res = await fetch(`${API}/api/reminders`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch { } finally { setFetching(false); }
  };

  useEffect(() => { fetchReminders(); }, []);

  const create = async () => {
    if (!subject || !topic || !email) return setError('All fields are required');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ subject, topic, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReminders(prev => [data.reminder, ...prev]);
      setSubject(''); setTopic(''); setEmail('');
      setSuccess('Reminder created! First email arrives within the hour.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      await fetch(`${API}/api/reminders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      setReminders(prev => prev.filter(r => r._id !== id));
    } catch { }
  };

  const nextLabel = (rep) => {
    const idx = Math.min(rep, INTERVALS.length - 1);
    return `${INTERVALS[idx]}d`;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">⏰ Revision Reminders</h2>
        <p className="text-gray-400 text-sm">Spaced repetition email reminders — intervals: {INTERVALS.join(' → ')} days</p>
      </div>

      {/* Create Form */}
      <div className="bg-gray-800 rounded-xl p-5 mb-6 space-y-3">
        <h3 className="font-semibold text-white text-sm">Add New Reminder</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Subject *</label>
            <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="e.g. Physics" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Topic *</label>
            <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="e.g. Newton's Laws" value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Email for reminders *</label>
            <input type="email" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        {/* Spaced repetition info */}
        <div className="bg-gray-900 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-2">📈 Spaced repetition schedule:</p>
          <div className="flex items-center gap-1 flex-wrap">
            {INTERVALS.map((d, i) => (
              <span key={d} className="flex items-center gap-1">
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">Rep {i+1}: {d}d</span>
                {i < INTERVALS.length - 1 && <span className="text-gray-600 text-xs">→</span>}
              </span>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        {!process.env.NEXT_PUBLIC_EMAIL_ENABLED && (
          <p className="text-yellow-500 text-xs bg-yellow-900/30 border border-yellow-800 rounded p-2">
            ⚠️ Email reminders need EMAIL_USER and EMAIL_PASS set on Render. Without them, reminders are tracked but emails won't send.
          </p>
        )}

        <button onClick={create} disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2.5 rounded-lg text-sm font-bold text-white transition-colors">
          {loading ? 'Creating...' : '+ Create Reminder'}
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-300 text-sm">Active Reminders ({reminders.length})</h3>
        {fetching ? (
          <div className="text-gray-500 text-sm text-center py-8">Loading...</div>
        ) : reminders.length === 0 ? (
          <div className="text-gray-600 text-sm text-center py-8 bg-gray-800 rounded-xl">No reminders yet — add one above</div>
        ) : (
          <AnimatePresence>
            {reminders.map((r) => (
              <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{r.topic}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-400">{r.subject}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{r.email}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs text-blue-400">Rep #{r.repetitions + 1} coming up</span>
                    <span className="text-xs text-gray-500">
                      Next: {new Date(r.nextReminder).toLocaleDateString()} (in {nextLabel(r.repetitions)})
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(r._id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none shrink-0">
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
