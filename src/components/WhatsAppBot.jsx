'use client';
import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

const COMMANDS = [
  { cmd: 'summary: <your notes>', desc: 'Get a 5-bullet summary of any text', example: 'summary: Photosynthesis is the process by which plants use sunlight...' },
  { cmd: 'flashcard: <your notes>', desc: 'Generate 5 Q&A flashcard pairs', example: 'flashcard: Newton\'s three laws of motion are...' },
  { cmd: 'ask: <your question>', desc: 'Get a direct answer to any study question', example: 'ask: What is the difference between mitosis and meiosis?' },
  { cmd: 'plan: <subjects>', desc: 'Get a quick 3-day study plan', example: 'plan: Physics, Chemistry, Maths' },
  { cmd: 'anything else', desc: 'General study help from AI', example: 'Help me understand integration by parts' },
];

export default function WhatsAppBot() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/api/whatsapp/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setStatus).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">📱 WhatsApp Bot</h2>
        <p className="text-gray-400 text-sm">Study help delivered to your WhatsApp — powered by Gemini AI</p>
      </div>

      {/* Status badge */}
      <div className={`rounded-xl p-4 mb-6 border ${status?.configured ? 'bg-green-900/30 border-green-800' : 'bg-yellow-900/20 border-yellow-800'}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status?.configured ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className={`text-sm font-medium ${status?.configured ? 'text-green-300' : 'text-yellow-300'}`}>
            {status?.configured ? 'WhatsApp Bot is Live ✅' : 'Setup Required — Twilio keys not configured'}
          </span>
        </div>
      </div>

      {/* Setup Steps */}
      {!status?.configured && (
        <div className="bg-gray-800 rounded-xl p-5 mb-6 space-y-4">
          <h3 className="font-bold text-white">Setup (takes ~10 minutes, free)</h3>
          {[
            { step: '1', title: 'Create Twilio account', detail: 'Go to twilio.com/try-twilio → Sign up free → Verify phone' },
            { step: '2', title: 'Enable WhatsApp Sandbox', detail: 'Twilio Console → Messaging → Try it out → WhatsApp → Follow instructions' },
            { step: '3', title: 'Add env vars to Render', detail: 'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886' },
            { step: '4', title: 'Set webhook URL in Twilio', detail: `Twilio Console → WhatsApp Sandbox → "When a message comes in" → POST → ${status?.webhookUrl || 'https://your-backend.onrender.com/api/whatsapp/webhook'}` },
            { step: '5', title: 'Install Twilio package', detail: 'In your backend folder: npm install twilio  →  commit & push to GitHub' },
          ].map(({ step, title, detail }) => (
            <div key={step} className="flex gap-4">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{step}</div>
              <div>
                <p className="text-white font-medium text-sm">{title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commands */}
      <div className="bg-gray-800 rounded-xl p-5 space-y-3">
        <h3 className="font-bold text-white mb-4">📋 WhatsApp Commands</h3>
        {COMMANDS.map(({ cmd, desc, example }) => (
          <div key={cmd} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <p className="text-blue-400 font-mono text-sm font-bold mb-1">{cmd}</p>
            <p className="text-gray-300 text-sm mb-2">{desc}</p>
            <div className="bg-gray-800 rounded p-2">
              <p className="text-xs text-gray-500 mb-0.5">Example:</p>
              <p className="text-xs text-green-400 font-mono">{example}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How to join */}
      {status?.configured && (
        <div className="mt-6 bg-green-900/20 border border-green-800 rounded-xl p-5">
          <h3 className="font-bold text-green-300 mb-2">How students join</h3>
          <ol className="space-y-2 text-sm text-gray-300">
            <li>1. Open WhatsApp and add the sandbox number to contacts</li>
            <li>2. Send the join keyword shown in your Twilio sandbox settings</li>
            <li>3. Start sending study commands — bot replies within 5 seconds</li>
          </ol>
        </div>
      )}
    </div>
  );
}
