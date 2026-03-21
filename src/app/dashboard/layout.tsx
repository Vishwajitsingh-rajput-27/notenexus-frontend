'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  useEffect(() => { if (!isAuthenticated()) router.replace('/sign-in') }, [])
  if (!isAuthenticated()) return null
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="min-h-screen bg-[#0f172a]">
      {children}
    </motion.div>
  )
}
