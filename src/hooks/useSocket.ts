'use client'
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

let globalSocket: Socket | null = null

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        withCredentials: true,
      })
      globalSocket.on('connect', () => console.log('🔌 Socket connected'))
      globalSocket.on('disconnect', () => console.log('🔌 Socket disconnected'))
    }
    socketRef.current = globalSocket
    return () => { /* keep alive across components */ }
  }, [])

  return socketRef.current
}
