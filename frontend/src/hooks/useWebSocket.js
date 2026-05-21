import { useEffect, useRef, useCallback } from 'react'

export function useWebSocket(token, onMessage) {
  const ws = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const connect = useCallback(() => {
    if (!token) return
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const url = `${proto}://${window.location.host}/ws/polls/${token}`
    const socket = new WebSocket(url)

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onMessageRef.current(data)
      } catch (_) {}
    }

    socket.onclose = () => {
      // Reconnect after 3 s if closed unexpectedly
      setTimeout(connect, 3000)
    }

    ws.current = socket
  }, [token])

  useEffect(() => {
    connect()
    return () => {
      if (ws.current) {
        ws.current.onclose = null // prevent reconnect on unmount
        ws.current.close()
      }
    }
  }, [connect])
}
