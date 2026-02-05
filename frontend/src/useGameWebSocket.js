import { useState, useEffect, useRef, useCallback } from 'react'

export function useGameWebSocket(url) {
  const [state, setState] = useState(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)

  const connect = useCallback(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      reconnectAttempts.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setState(data)
      } catch (_) {}
    }

    ws.onclose = () => {
      setConnected(false)
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 10000)
      reconnectAttempts.current += 1
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, delay)
    }

    ws.onerror = () => {}
  }, [url])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [connect])

  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  const sendDirection = useCallback(
    (direction) => send({ action: 'direction', direction }),
    [send]
  )
  const sendReset = useCallback(() => send({ action: 'reset' }), [send])

  return { state, sendDirection, sendReset, connected }
}
