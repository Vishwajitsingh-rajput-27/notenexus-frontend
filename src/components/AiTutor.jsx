'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL;

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const SUGGESTED = ['Explain this topic from scratch', 'Give me an example', 'I don\'t understand', 'Quiz me', 'Summarise what we\'ve covered'];

export default function AiTutor() {
  const [subject, setSubject]   = useState('');
  const [level, setLevel]       = useState('beginner');
  const [aiModel, setAiModel]   = useState('gemini');
  const [started, setStarted]   = useState(false);
  const [history, setHistory]   = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [quiz, setQuiz]         = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizChecked, setQuizChecked] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const sendMessage = async (msg = input) => {
    const text = msg.trim();
    if (!text || loading) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', content: text };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, history, subject, level, aiModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (err) {
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
    } catch (err) {
      setError(err.message);
    }
  };

  const score = quiz ? quiz.filter((q, i) => quizAnswers[i]?.startsWith(q.answer)).length : 0;

  // ── Setup Screen ──
  if (!started) {
    return (
      <div className="p-6 max-w-lg mx-auto flex flex-col items-center justify-center min-h-96">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🤖</div>
          <h2 className="text-2xl font-bold text-white mb-1">AI Tutor</h2>
          <p className="text-gray-400 text-sm">Explains concepts, checks your understanding, and adapts to your level</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 w-full space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">What subject? *</label>
            <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
              placeholder="e.g. Physics, History, JavaScript, Maths"
              value={subject} onChange={e => setSubject(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && subject && setStarted(true)} />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Your level</label>
            <div className="flex gap-2">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${level === l ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">AI Model</label>
            <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={aiModel} onChange={e => setAiModel(e.target.value)}>
              <option value="gemini">Gemini</option>
              <option value="grok">Grok</option>
            </select>
          </div>
          <button onClick={() => setStarted(true)} disabled={!subject}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg font-bold text-white transition-colors">
            Start Learning →
          </button>
        </div>
      </div>
    );
  }

  // ── Chat Screen ──
  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700 bg-gray-800">
        <button onClick={() => { setStarted(false); setHistory([]); setQuiz(null); }}
          className="text-gray-400 hover:text-white text-sm transition-colors">← Back</button>
        <div className="flex-1">
          <span className="font-bold text-white">🤖 {subject} Tutor</span>
          <span className="ml-2 text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded capitalize">{level}</span>
          <span className="ml-1 text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">{aiModel}</span>
        </div>
        <button onClick={fetchQuiz}
          className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          📝 Quick Quiz
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="max-w-xl bg-gray-700 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-100">
          Hi! I'm your <strong>{subject}</strong> tutor. I'll explain clearly, check your understanding, and guide you step by step. What topic would you like to start with?
        </motion.div>

        {/* History */}
        <AnimatePresence>
          {history.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`max-w-xl text-sm p-4 rounded-2xl whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white ml-auto rounded-tr-sm'
                  : 'bg-gray-700 text-gray-100 rounded-tl-sm'
              }`}>
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-1.5 p-4 bg-gray-700 rounded-2xl rounded-tl-sm w-20">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Quiz Panel */}
      {quiz && (
        <div className="border-t border-gray-700 p-4 max-h-72 overflow-y-auto bg-gray-850">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white text-sm">📝 Quick Quiz — {subject}</h3>
            <button onClick={() => setQuiz(null)} className="text-gray-500 hover:text-white text-xs">✕ Close</button>
          </div>
          <div className="space-y-3">
            {quiz.map((q, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-white mb-2">Q{i+1}: {q.q}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, j) => {
                    const letter = opt[0];
                    const isSelected = quizAnswers[i] === letter;
                    const isCorrect = quizChecked && letter === q.answer;
                    const isWrong = quizChecked && isSelected && letter !== q.answer;
                    return (
                      <button key={j} disabled={quizChecked}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [i]: letter }))}
                        className={`text-xs p-2 rounded text-left transition-colors ${
                          isCorrect ? 'bg-green-800 text-green-200 border border-green-600'
                          : isWrong ? 'bg-red-900 text-red-200 border border-red-600'
                          : isSelected ? 'bg-blue-800 text-blue-200 border border-blue-600'
                          : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                        }`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizChecked && <p className="text-xs text-gray-400 mt-2 italic">{q.explanation}</p>}
              </div>
            ))}
          </div>
          {!quizChecked ? (
            <button onClick={() => setQuizChecked(true)} disabled={Object.keys(quizAnswers).length < quiz.length}
              className="w-full mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 py-2 rounded text-sm font-bold text-white">
              Submit Answers
            </button>
          ) : (
            <p className="text-center mt-3 font-bold text-sm">
              Score: <span className={score >= 4 ? 'text-green-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}>{score}/{quiz.length}</span>
            </p>
          )}
        </div>
      )}

      {/* Suggestions */}
      {history.length < 2 && !quiz && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700 flex gap-3 bg-gray-800">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors"
          placeholder="Ask anything, answer the tutor's question..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-5 py-2 rounded-full text-sm font-bold text-white transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}
