/**
 * Lógica del Snake en el cliente (para Vercel / sin backend).
 * Mismo contrato que useGameWebSocket: state, sendDirection, sendReset, connected.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

const GRID_WIDTH = 20
const GRID_HEIGHT = 16
const DIRECTIONS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

function createInitialState() {
  const cx = Math.floor(GRID_WIDTH / 2)
  const cy = Math.floor(GRID_HEIGHT / 2)
  const snake = [[cx - 2, cy], [cx - 1, cy], [cx, cy]]
  let food
  do {
    food = [
      Math.floor(Math.random() * GRID_WIDTH),
      Math.floor(Math.random() * GRID_HEIGHT),
    ]
  } while (snake.some(([x, y]) => x === food[0] && y === food[1]))

  return {
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    snake,
    food,
    score: 0,
    gameOver: false,
    speedMs: 150,
    direction: 'right',
    nextDirection: 'right',
  }
}

function tickState(prev) {
  if (prev.gameOver) return prev
  const dir = prev.nextDirection
  const [dx, dy] = DIRECTIONS[dir] || DIRECTIONS.right
  const head = prev.snake[0]
  const newHead = [
    (head[0] + dx + GRID_WIDTH) % GRID_WIDTH,
    (head[1] + dy + GRID_HEIGHT) % GRID_HEIGHT,
  ]
  if (prev.snake.some(([x, y]) => x === newHead[0] && y === newHead[1])) {
    return { ...prev, gameOver: true }
  }
  const snake = [newHead, ...prev.snake]
  let food = prev.food
  let score = prev.score
  let speedMs = prev.speedMs
  if (newHead[0] === food[0] && newHead[1] === food[1]) {
    score += 10
    speedMs = Math.max(60, speedMs - 5)
    do {
      food = [
        Math.floor(Math.random() * GRID_WIDTH),
        Math.floor(Math.random() * GRID_HEIGHT),
      ]
    } while (snake.some(([x, y]) => x === food[0] && y === food[1]))
  } else {
    snake.pop()
  }
  return {
    ...prev,
    snake,
    food,
    score,
    speedMs,
    direction: dir,
    nextDirection: dir,
  }
}

export function useGameLocal(active = false) {
  const [state, setState] = useState(createInitialState)
  const nextDirRef = useRef(state.nextDirection)
  const intervalRef = useRef(null)
  const wasActive = useRef(false)

  const sendDirection = useCallback((direction) => {
    if (!OPPOSITE[direction]) return
    nextDirRef.current = direction
  }, [])

  const sendReset = useCallback(() => {
    nextDirRef.current = 'right'
    setState((prev) => ({
      ...createInitialState(),
      nextDirection: nextDirRef.current,
    }))
  }, [])

  useEffect(() => {
    setState((prev) => ({ ...prev, nextDirection: nextDirRef.current }))
  }, [])

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    if (!wasActive.current) {
      wasActive.current = true
      setState(createInitialState())
    }
    if (state.gameOver) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    const run = () => {
      setState((prev) => {
        const withDir = { ...prev, nextDirection: nextDirRef.current }
        return tickState(withDir)
      })
    }
    intervalRef.current = setInterval(run, state.speedMs)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, state.speedMs, state.gameOver])

  return {
    state: {
      ...state,
      gameOver: state.gameOver,
    },
    sendDirection,
    sendReset,
    connected: true,
  }
}
