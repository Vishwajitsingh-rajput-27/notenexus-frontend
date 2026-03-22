'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import UploadNote   from '@/components/notes/UploadNote'
import NotesList    from '@/components/notes/NotesList'
import SearchBar    from '@/components/notes/SearchBar'
import Flashcards   from '@/components/revision/Flashcards'
import MindMap      from '@/components/revision/MindMap'
import ClassHub     from '@/components/notes/ClassHub'
import Profile      from '@/components/profile/Profile'
import { useSocket } from '@/hooks/useSocket'
import { useEffect } from 'react'
import ExamPredictor     from '@/components/ExamPredictor'
import StudyPlanner      from '@/components/StudyPlanner'
import AiTutor           from '@/components/AiTutor'
import RevisionReminders from '@/components/RevisionReminders'
import WhatsAppBot       from '@/components/WhatsAppBot'

const TABS = [
  { id: 'upload',     icon: '📤', label: 'Upload'      },
  { id: 'notes',      icon: '📋', label: 'My Notes'    },
  { id: 'search',     icon: '🔍', label: 'Search'      },
  { id: 'flashcards', icon: '🃏', label: 'Flashcards'  },
  { id: 'mindmap',    icon: '🗺️', label: 'Mind Map'   },
  { id: 'class',      icon: '👥', label: 'Class Hub'   },
  { id: 'profile',    icon: '👤', label: 'Profile'     },
  { id: 'exam',      icon: '🎯', label: 'Exam Predictor' },
  { id: 'planner',   icon: '📅', label: 'Study Planner'  },
  { id: 'tutor',     icon: '🤖', label: 'AI Tutor'       },
  { id: 'reminders', icon: '⏰', label: 'Reminders'      },
  { id: 'whatsapp',  icon: '📱', label: 'WhatsApp Bot'   },
]

export default function DashboardPage() {
  const [tab, setTab]   = useState('upload')
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return
    socket.on('shared-note-alert', ({ title, sharedBy }: any) => {
      toast(`📢 ${sharedBy} shared a note: "${title}"`, { duration: 4000 })
    })
    return () => { socket.off('shared-note-alert') }
  }, [socket])

  const handleLogout = () => {
    logout()
    router.push('/')
    toast.success('Logged out')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 glass border-r border-white/5 flex flex-col py-4 shrink-0">
        <div className="px-4 mb-8 flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="hidden md:block font-bold text-gradient text-lg">NoteNexus</span>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {TABS.map(t => (
            <motion.button key={t.id} whileHover={{ x:2 }} whileTap={{ scale:0.97 }}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === t.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <span className="text-lg shrink-0">{t.icon}</span>
              <span className="hidden md:block">{t.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="px-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
            <span>🚪</span><span className="hidden md:block">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-white text-lg">{TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}</h1>
            <p className="text-slate-500 text-xs">Hi {user?.name?.split(' ')[0]} 👋 — what are we learning today?</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-500">Live</span>
          </div>
        </div>

        <div className="p-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.18 }}>
              {tab === 'upload'     && <UploadNote />}
              {tab === 'notes'      && <NotesList />}
              {tab === 'search'     && <SearchBar />}
              {tab === 'flashcards' && <Flashcards />}
              {tab === 'mindmap'    && <MindMap />}
              {tab === 'class'      && <ClassHub />}
              {tab === 'profile'    && <Profile />}
              {tab === 'exam'      && <ExamPredictor />}
              {tab === 'planner'   && <StudyPlanner />}
              {tab === 'tutor'     && <AiTutor />}
              {tab === 'reminders' && <RevisionReminders />}
              {tab === 'whatsapp'  && <WhatsAppBot />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
