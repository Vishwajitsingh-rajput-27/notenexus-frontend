'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const features = [
  { icon: '📥', title: 'Universal Ingestion',   desc: 'PDF, images, YouTube, voice, WhatsApp — every source, one place.' },
  { icon: '🤖', title: 'AI Auto-Organisation',  desc: 'Every note tagged by subject & chapter automatically. Zero manual effort.' },
  { icon: '🔍', title: 'Semantic Search',        desc: 'Ask questions in plain English across all your notes instantly.' },
  { icon: '🃏', title: 'Smart Flashcards',       desc: 'Turn any note into ready-to-revise flashcards with one click.' },
  { icon: '🗺️', title: 'Mind Maps',             desc: 'AI-generated visual topic maps from your notes.' },
  { icon: '⚡', title: 'Live Collaboration',     desc: 'Study together in real-time with Socket.io powered class rooms.' },
]

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  useEffect(() => { if (isAuthenticated()) router.replace('/dashboard') }, [])

  return (
    <main className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-gradient">NoteNexus</span>
          </motion.div>
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="flex gap-3">
            <Link href="/sign-in" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition">Sign In</Link>
            <Link href="/sign-up" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">Get Started</Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }} className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-blue-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            AI-Powered · Real-Time · Free
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6">
            Every note.<br />
            <span className="text-gradient">One place.</span><br />
            Always ready.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Upload from anywhere. AI organises everything. Search, revise and collaborate in real-time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg glow transition">
                Start for Free →
              </motion.button>
            </Link>
            <Link href="/sign-in">
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                className="px-8 py-4 glass rounded-xl font-bold text-lg hover:bg-white/10 transition">
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            className="text-4xl font-bold text-center mb-4">Everything you need</motion.h2>
          <p className="text-slate-400 text-center mb-14">Built for every type of student and every source of notes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ y:-4, scale:1.01 }}
                className="glass rounded-2xl p-6 glass-hover transition cursor-default">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }}
          className="max-w-2xl mx-auto glass rounded-3xl p-12 glow">
          <h2 className="text-4xl font-bold mb-4">Ready to study smarter?</h2>
          <p className="text-slate-400 mb-8">Join thousands of students already using NoteNexus.</p>
          <Link href="/sign-up">
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl transition glow">
              Get Started Free →
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <footer className="text-center text-slate-500 text-sm py-8">
        NoteNexus — Every note. One place. Always ready.
      </footer>
    </main>
  )
}
