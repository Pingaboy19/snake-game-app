import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameWebSocket } from './useGameWebSocket'
import { useGameLocal } from './useGameLocal'
import styles from './App.module.css'

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
const FALLBACK_MS = 2500

export default function App() {
  const ws = useGameWebSocket(WS_URL)
  const [useLocal, setUseLocal] = useState(false)
  const local = useGameLocal(useLocal)
  const fallbackTimer = useRef(null)

  useEffect(() => {
    if (ws.connected && ws.state) {
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current)
        fallbackTimer.current = null
      }
      setUseLocal(false)
      return
    }
    if (!fallbackTimer.current) {
      fallbackTimer.current = setTimeout(() => setUseLocal(true), FALLBACK_MS)
    }
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
    }
  }, [ws.connected, ws.state])

  const state = useLocal ? local.state : ws.state
  const sendDirection = useLocal ? local.sendDirection : ws.sendDirection
  const sendReset = useLocal ? local.sendReset : ws.sendReset
  const connected = useLocal ? true : ws.connected

  const [showGameOver, setShowGameOver] = useState(false)
  const prevGameOver = useRef(false)

  useEffect(() => {
    if (state?.gameOver && !prevGameOver.current) {
      setShowGameOver(true)
    }
    prevGameOver.current = state?.gameOver ?? false
  }, [state?.gameOver])

  const handleKeyDown = useCallback(
    (e) => {
      if (state?.gameOver) return
      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        W: 'up',
        s: 'down',
        S: 'down',
        a: 'left',
        A: 'left',
        d: 'right',
        D: 'right',
      }
      const dir = keyMap[e.key]
      if (dir) {
        e.preventDefault()
        sendDirection(dir)
      }
    },
    [state?.gameOver, sendDirection]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleReset = () => {
    sendReset()
    setShowGameOver(false)
  }

  if (!state) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.connecting}>
          <div className={styles.spinner} />
          <p>Conectando al servidor…</p>
          <p className={styles.hint}>Si no hay backend, el juego iniciará en modo local en unos segundos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>🐍</span>
          Snake
        </h1>
        <div className={styles.scoreBoard}>
          <span className={styles.scoreLabel}>Puntuación</span>
          <span className={styles.scoreValue}>{state?.score ?? 0}</span>
        </div>
        {!useLocal && !connected && (
          <span className={styles.badge}>Reconectando…</span>
        )}
      </header>

      <div className={styles.gameContainer}>
        <div
          className={styles.grid}
          style={{
            '--cols': state?.gridWidth ?? 20,
            '--rows': state?.gridHeight ?? 16,
          }}
        >
          {state?.snake?.map((segment, i) => (
            <div
              key={`${segment[0]}-${segment[1]}-${i}`}
              className={`${styles.cell} ${styles.snake} ${
                i === 0 ? styles.snakeHead : i === state.snake.length - 1 ? styles.snakeTail : styles.snakeBody
              }`}
              style={{
                '--x': segment[0],
                '--y': segment[1],
              }}
            />
          ))}
          {state?.food && (
            <div
              className={`${styles.cell} ${styles.food}`}
              style={{
                '--x': state.food[0],
                '--y': state.food[1],
              }}
            />
          )}
        </div>

        {state?.gameOver && showGameOver && (
          <div className={styles.overlay}>
            <div className={styles.gameOverCard}>
              <h2>Game Over</h2>
              <p className={styles.finalScore}>Puntuación: {state.score}</p>
              <button className={styles.playAgain} onClick={handleReset}>
                Jugar de nuevo
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <p className={styles.controlsHint}>Flechas o WASD para mover</p>
      </div>
    </div>
  )
}
