'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGetNotes } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL;
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const SUGGESTED = ['Explain this topic from scratch', "Give me an example", "I don't understand", 'Quiz me', "Summarise what we've covered"];

const sourceIcon = (type: string) => {
  if (type === 'pdf')     return '📄';
  if (type === 'image')   return '🖼️';
  if (type === 'voice')   return '🎤';
  if (type === 'youtube') return '▶️';
  return '📝';
};

export default function AiTutor({ preloadSubject = '' }) {
  const [subject, setSubject]   = useState(preloadSubject || '');
  const [level, setLevel]       = useState('beginner');
  const [started, setStarted]   = useState(false);
  const [history, setHistory]   = useState<any[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [quiz, setQuiz]         = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Select Note state ────────────────────────────────────────────────────
  const [notes, setNotes]           = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showNotes, setShowNotes]   = useState(false);
  const [loadedFrom, setLoadedFrom] = useState('');

  useEffect(() => { if (preloadSubject) setSubject(preloadSubject); }, [preloadSubject]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, loading]);

  // Fetch saved notes on mount
  useEffect(() => {
    setLoadingNotes(true);
    apiGetNotes()
      .then((d: any) => setNotes(d.notes || []))
      .catch(() => {})
      .finally(() => setLoadingNotes(false));
  }, []);

  const loadFromNote = (note: any) => {
    setSubject(note.subject || note.title || '');
    setLoadedFrom(`${sourceIcon(note.sourceType)} ${note.title}`);
    setShowNotes(false);
  };

  const sendMessage = async (msg = input) => {
    const text = msg.trim();
    if (!text || loading) return;
    setInput(''); setError('');
    const userMsg = { role: 'user', content: text };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, history, subject, level, aiModel: 'groq' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async () => {
    if (!subject) return;
    setQuiz(null); setQuizAnswers({}); setQuizChecked(false);
    try {
      const token = localStorage.getItem('token');
      const lastTopic = history.filter(h => h.role === 'assistant').slice(-1)[0]?.content?.slice(0, 60) || subject;
      const res = await fetch(`${API}/api/tutor/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, topic: lastTopic, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuiz(data.quiz);
    } catch (err: any) { setError(err.message); }
  };

  const score = quiz ? quiz.filter((q: any, i: number) => quizAnswers[i] === q.answer).length : 0;

  // ── Start screen ─────────────────────────────────────────────────────────
  if (!started) return (
    <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-96 pt-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🤖</div>
        <h2 className="text-2xl font-bold text-white mb-1">AI Tutor</h2>
        <p className="text-slate-400 text-sm">Explains clearly, checks understanding, adapts to your level</p>
      </div>

      <div className="glass rounded-2xl p-6 w-full space-y-4">

        {/* ── Select Note ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-400">📂 Start from a saved note</label>
            <button
              onClick={() => setShowNotes(v => !v)}
              className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg hover:bg-blue-600/30 transition"
            >
              📋 Select Note {showNotes ? '▲' : '▼'}
            </button>
          </div>

          {showNotes && (
            <div className="bg-black/20 rounded-xl p-2 max-h-48 overflow-y-auto border border-white/10 mb-2">
              {loadingNotes && (
                <p className="text-slate-500 text-xs text-center py-4">Loading notes…</p>
              )}
              {!loadingNotes && notes.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-4">No saved notes found</p>
              )}
              {notes.map((note: any) => (
                <button
                  key={note._id}
                  onClick={() => loadFromNote(note)}
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
            <p className="text-xs text-blue-400 mb-2">✅ Loaded: {loadedFrom}</p>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">or type a subject</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">What subject? *</label>
          <input
            className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white"
            placeholder="e.g. Physics, History, JavaScript"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && subject && setStarted(true)}
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-2 block">Your level</label>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition ${level === l ? 'bg-blue-600 text-white' : 'glass text-slate-400 hover:text-white'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setStarted(true)} disabled={!subject}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-bold text-white transition"
        >
          Start Learning →
        </button>
      </div>
    </div>
  );

  // ── Chat screen ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col max-w-3xl" style={{ height: 'calc(100vh - 160px)' }}>
      <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
        <button onClick={() => { setStarted(false); setHistory([]); setQuiz(null); }}
          className="text-slate-400 hover:text-white text-sm transition">← Back</button>
        <span className="font-bold text-white">🤖 {subject} Tutor</span>
        <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded capitalize border border-blue-500/30">{level}</span>
        <button onClick={fetchQuiz}
          className="ml-auto text-xs bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-600/30 transition">
          📝 Quick Quiz
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="max-w-xl glass rounded-2xl rounded-tl-sm p-4 text-sm text-slate-100">
          Hi! I'm your <strong>{subject}</strong> tutor. What topic would you like to start with?
        </motion.div>
        <AnimatePresence>
          {history.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`max-w-xl text-sm p-4 rounded-2xl whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white ml-auto rounded-tr-sm'
                  : 'glass text-slate-100 rounded-tl-sm'
              }`}>
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-1.5 p-4 glass rounded-2xl rounded-tl-sm w-20">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {quiz && (
        <div className="border-t border-white/5 pt-4 max-h-64 overflow-y-auto mb-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white text-sm">📝 Quick Quiz</h3>
            <button onClick={() => setQuiz(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
          </div>
          <div className="space-y-3">
            {quiz.map((q: any, i: number) => (
              <div key={i} className="glass rounded-xl p-3">
                <p className="text-sm text-white mb-2">Q{i+1}: {q.q}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt: string, j: number) => {
                    const letter = opt[0];
                    const isSelected = quizAnswers[i] === letter;
                    const isCorrect = quizChecked && letter === q.answer;
                    const isWrong = quizChecked && isSelected && letter !== q.answer;
                    return (
                      <button key={j} disabled={quizChecked}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [i]: letter }))}
                        className={`text-xs p-2 rounded-lg text-left transition border ${
                          isCorrect ? 'bg-green-800/50 text-green-200 border-green-600'
                          : isWrong ? 'bg-red-900/50 text-red-200 border-red-600'
                          : isSelected ? 'bg-blue-800/50 text-blue-200 border-blue-600'
                          : 'bg-black/20 text-slate-300 border-white/10 hover:bg-white/5'
                        }`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizChecked && <p className="text-xs text-slate-400 mt-2 italic">{q.explanation}</p>}
              </div>
            ))}
          </div>
          {!quizChecked
            ? <button onClick={() => setQuizChecked(true)} disabled={Object.keys(quizAnswers).length < quiz.length}
                className="w-full mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 py-2 rounded-xl text-sm font-bold text-white">
                Submit Answers
              </button>
            : <p className="text-center mt-3 font-bold text-sm">
                Score: <span className={score >= 4 ? 'text-green-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}>{score}/{quiz.length}</span>
              </p>
          }
        </div>
      )}

      {history.length < 2 && !quiz && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-xs glass text-slate-300 px-3 py-1.5 rounded-full whitespace-nowrap hover:text-white transition">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-3 border-t border-white/5">
        <input
          className="flex-1 bg-black/20 border border-white/10 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50 transition"
          placeholder="Ask anything or answer the tutor's question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-5 py-2 rounded-full text-sm font-bold text-white transition">
          Send
        </button>
      </div>
    </div>
  );
}
