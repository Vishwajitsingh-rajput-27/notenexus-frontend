'use client'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// ── Features pulled directly from original page.tsx ──────────────────────────
const features = [
  {
    group: 'INGESTION_MODULE',
    items: [
      'PDF, images, YouTube, voice, WhatsApp — every source, one place.',
      'AI tags each note by subject & chapter automatically. Zero manual effort.',
    ],
  },
  {
    group: 'SEARCH_ENGINE',
    items: [
      'Ask questions in plain English across all your notes instantly.',
      'Semantic search — finds meaning, not just keywords.',
    ],
  },
  {
    group: 'REVISION_TOOLS',
    items: [
      'Turn any note into ready-to-revise flashcards with one click.',
      'AI-generated visual mind maps from your notes.',
    ],
  },
  {
    group: 'COLLABORATION_LAYER',
    items: [
      'Study together in real-time with Socket.io powered class rooms.',
      'Live cursors, shared boards, instant sync.',
    ],
  },
  {
    group: 'AI_TOOLS',
    items: [
      'AI Tutor — beginner / intermediate / advanced levels.',
      'Exam Predictor — generates practice questions from your notes.',
      'Study Planner — AI builds your revision schedule.',
    ],
  },
]

// ── Stack extracted from package.json ────────────────────────────────────────
const stack = {
  '// FRONTEND': ['Next.js 14', 'React 18', 'Framer Motion', 'Tailwind CSS', 'TypeScript'],
  '// STATE':    ['Zustand', 'React Hot Toast'],
  '// NETWORK':  ['Axios', 'Socket.io Client'],
  '// UTILS':    ['React Dropzone', 'JS Cookie', 'React Icons'],
}

// ── Custom cursor ─────────────────────────────────────────────────────────────
function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Use translate(-50%,-50%) on the element, so just pass raw clientX/Y
    const onMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top  = e.clientY + 'px'
    }
    document.addEventListener('mousemove', onMove)

    const hoverEls = document.querySelectorAll('a, button, [data-hover]')
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width           = '60px'
        cursor.style.height          = '60px'
        cursor.style.backgroundColor = '#FBFF48'
        cursor.style.mixBlendMode    = 'normal'
        cursor.style.border          = '2px solid black'
      })
      el.addEventListener('mouseleave', () => {
        cursor.style.width           = '24px'
        cursor.style.height          = '24px'
        cursor.style.backgroundColor = '#fff'
        cursor.style.mixBlendMode    = 'difference'
        cursor.style.border          = 'none'
      })
    })

    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={cursorRef}
      style={{
        width: 24, height: 24,
        background: '#fff',
        borderRadius: '50%',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: 'difference',
        transition: 'width .2s ease, height .2s ease, background-color .2s ease, border .2s ease',
        transform: 'translate(-50%, -50%)',
      }}
    />
  )
}

// ── Stack category (extracted to fix hooks-in-map violation) ──────────────────
function StackCategory({ cat, items, delay }: { cat: string; items: string[]; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const ibm: React.CSSProperties = { fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }
  const mono: React.CSSProperties = { fontFamily: "'Space Mono', 'Courier New', monospace" }
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay }}
    >
      <div style={{ ...mono, fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 10 }}>
        {cat}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {items.map(tech => (
          <span key={tech} data-hover style={{
            ...ibm, fontSize: 12,
            padding: '5px 12px',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.04em',
            transition: 'border-color .2s, color .2s',
            cursor: 'default',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FBFF48'; (e.currentTarget as HTMLElement).style.color = '#FBFF48' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ── Animated section title ────────────────────────────────────────────────────
function SectionTitle({ white, yellow }: { white: string; yellow: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.h2
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
      style={{ fontFamily: "'Space Mono', 'Courier New', monospace", letterSpacing: '-0.02em' }}
      className="text-3xl md:text-4xl font-bold uppercase mb-12"
    >
      <span style={{ color: '#FFFFFF' }}>{white}</span>
      <span style={{ color: '#FBFF48' }}>{yellow}</span>
    </motion.h2>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ group, items, index }: { group: string; items: string[]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      data-hover
      style={{
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.03)',
        padding: '28px 28px 24px',
        position: 'relative',
        cursor: 'default',
      }}
      whileHover={{ backgroundColor: 'rgba(251,255,72,0.04)', borderColor: '#FBFF48' }}
    >
      {/* group label */}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: '#FBFF48',
        letterSpacing: '0.15em',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{'>'}</span>
        {group}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map((item, i) => (
          <li key={i} style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7,
            paddingLeft: 16,
            position: 'relative',
            marginBottom: 6,
          }}>
            <span style={{ position: 'absolute', left: 0, color: 'rgba(255,255,255,0.3)' }}>·</span>
            {item}
          </li>
        ))}
      </ul>
      {/* corner accent */}
      <div style={{
        position: 'absolute', top: -1, right: -1,
        width: 12, height: 12,
        borderTop: '2px solid #FBFF48',
        borderRight: '2px solid #FBFF48',
      }} />
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard')
    const id = setInterval(() => setTick(t => t + 1), 500)
    return () => clearInterval(id)
  }, [])

  const dotGrid = {
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  }

  const mono: React.CSSProperties = { fontFamily: "'Space Mono', 'Courier New', monospace" }
  const ibm:  React.CSSProperties = { fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        * { cursor: none !important; }
        ::selection { background: #FBFF48; color: #000; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
      `}</style>

      <Cursor />

      <main style={{ background: '#0a0a0a', color: '#FFFFFF', overflowX: 'hidden', minHeight: '100vh' }}>

        {/* ── NAV ── */}
        <nav style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 100,
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <motion.span
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{ ...mono, fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', color: '#FFFFFF' }}
            >
              NOTENEXUS<span style={{ color: '#FBFF48' }}>.exe</span>
            </motion.span>
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 24 }}
            >
              {['/ABOUT', '/FEATURES', '/STACK'].map(l => (
                <a key={l} href={`#${l.slice(1).toLowerCase()}`} style={{ ...mono, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >{l}</a>
              ))}
              <Link href="/sign-up">
                <button style={{
                  ...mono, fontSize: 11, letterSpacing: '0.1em',
                  padding: '8px 16px',
                  background: '#FBFF48', color: '#000',
                  border: 'none', fontWeight: 700,
                  cursor: 'pointer',
                }}>/GET_STARTED</button>
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section id="about" style={{ ...dotGrid, paddingTop: 140, paddingBottom: 100, paddingLeft: 32, paddingRight: 32, position: 'relative', overflow: 'hidden' }}>

          {/* decorative shapes */}
          <div style={{ position: 'absolute', top: 120, left: 60, width: 48, height: 48, background: '#3B82F6', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 200, right: 80, width: 60, height: 60, borderRadius: '50%', background: '#FF3B3B', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 80, left: '35%', width: 20, height: 20, background: '#FBFF48', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* status pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', marginBottom: 40, ...ibm, fontSize: 12 }}
            >
              <span style={{ color: '#4ADE80', fontSize: 10 }}>●</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>SYSTEM STATUS: ONLINE</span>
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ ...mono, fontSize: 'clamp(42px, 8vw, 96px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 24, textTransform: 'uppercase' }}
            >
              EVERY NOTE.<br />
              <span style={{ color: '#FBFF48' }}>ONE PLACE.</span><br />
              ALWAYS READY.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ ...ibm, fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 560, lineHeight: 1.8, marginBottom: 40 }}
            >
              Upload from anywhere. AI organises everything.<br />Search, revise and collaborate in real-time.
            </motion.p>

            {/* bullets */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
              style={{ marginBottom: 48 }}
            >
              {[
                '> Specialized in AI-powered note management.',
                '> Real-time collaboration via Socket.io.',
                '> Multi-source ingestion: PDF, YouTube, voice, WhatsApp.',
              ].map((line, i) => (
                <div key={i} style={{ ...ibm, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
                  {line}
                </div>
              ))}
            </motion.div>

            {/* status badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}
            >
              <div style={{ ...ibm, fontSize: 11, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
                // LOCATION: WORLDWIDE
              </div>
              <div style={{ ...ibm, fontSize: 11, padding: '6px 14px', border: '1px solid #4ADE80', color: '#4ADE80', letterSpacing: '0.08em' }}>
                // STATUS: AI-POWERED · FREE
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
            >
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ ...mono, fontSize: 13, fontWeight: 700, padding: '14px 32px', background: '#FBFF48', color: '#000', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}
                >
                  START FOR FREE →
                </motion.button>
              </Link>
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  style={{ ...mono, fontSize: 13, fontWeight: 700, padding: '14px 32px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', letterSpacing: '0.08em' }}
                >
                  SIGN IN
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURE_LOG ── */}
        <section id="features" style={{ ...dotGrid, padding: '100px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <SectionTitle white="FEATURE" yellow="_LOG" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
              {features.map((f, i) => (
                <div key={f.group} style={{ background: '#0a0a0a' }}>
                  <FeatureCard group={f.group} items={f.items} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH_STACK ── */}
        <section id="stack" style={{ padding: '100px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 56 }}>
              <SectionTitle white="TECH" yellow="_STACK" />
              <div style={{ ...ibm, fontSize: 11, color: '#FF3B3B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>●</span> // SYSTEM_OPTIMIZED
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
              {Object.entries(stack).map(([cat, items], ci) => (
                <StackCategory key={cat} cat={cat} items={items} delay={ci * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BLOCK ── */}
        <section style={{ ...dotGrid, padding: '100px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              style={{ border: '1px solid rgba(255,255,255,0.12)', padding: '64px 48px', position: 'relative' }}
            >
              {/* corner accents */}
              {[['top-0 left-0', 'borderTop borderLeft'], ['top-0 right-0', 'borderTop borderRight'], ['bottom-0 left-0', 'borderBottom borderLeft'], ['bottom-0 right-0', 'borderBottom borderRight']].map(([pos], i) => (
                <div key={i} style={{
                  position: 'absolute',
                  ...(pos.includes('top-0') ? { top: -1 } : { bottom: -1 }),
                  ...(pos.includes('left-0') ? { left: -1 } : { right: -1 }),
                  width: 20, height: 20,
                  borderTop: pos.includes('top') ? '2px solid #FBFF48' : undefined,
                  borderBottom: pos.includes('bottom') ? '2px solid #FBFF48' : undefined,
                  borderLeft: pos.includes('left') ? '2px solid #FBFF48' : undefined,
                  borderRight: pos.includes('right') ? '2px solid #FBFF48' : undefined,
                }} />
              ))}

              <div style={{ ...mono, fontSize: 11, color: '#4ADE80', marginBottom: 24, letterSpacing: '0.15em' }}>
                ● READY TO STUDY SMARTER?
              </div>
              <h2 style={{ ...mono, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', lineHeight: 1.1 }}>
                JOIN THE<br /><span style={{ color: '#FBFF48' }}>KNOWLEDGE HUB.</span>
              </h2>
              <p style={{ ...ibm, fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 40 }}>
                Upload from anywhere. AI organises everything.
              </p>
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.04, backgroundColor: '#e8ec00' }}
                  whileTap={{ scale: 0.97 }}
                  style={{ ...mono, fontSize: 14, fontWeight: 700, padding: '16px 48px', background: '#FBFF48', color: '#000', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}
                >
                  GET STARTED FREE →
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ ...mono, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                NOTENEXUS<span style={{ color: '#FBFF48' }}>.exe</span>
              </div>
              <div style={{ ...ibm, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                Every note. One place. Always ready.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link href="/sign-in" style={{ ...ibm, fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.08em' }}>/SIGN-IN</Link>
              <Link href="/sign-up" style={{ ...ibm, fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.08em' }}>/SIGN-UP</Link>
              <Link href="/dashboard" style={{ ...ibm, fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.08em' }}>/DASHBOARD</Link>
            </div>
            <div style={{ ...ibm, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
              // v1.0.0 — NoteNexus
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
