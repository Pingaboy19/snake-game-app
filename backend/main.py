"""
Backend del juego Serpiente - FastAPI + WebSocket.
"""
import asyncio
import json
from typing import Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from game import SnakeGame, GameState

app = FastAPI(title="Snake Game API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Un juego por conexión WebSocket
games: Dict[WebSocket, SnakeGame] = {}
tasks: Dict[WebSocket, asyncio.Task] = {}


async def game_loop(ws: WebSocket, game: SnakeGame) -> None:
    try:
        while True:
            state = game.state.to_dict()
            await ws.send_json(state)
            if game.state.game_over:
                break
            await asyncio.sleep(game.state.speed_ms / 1000.0)
            game.tick()
    except Exception:
        pass


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    game = SnakeGame()
    games[websocket] = game

    # Enviamos estado inicial
    await websocket.send_json(game.state.to_dict())

    loop = asyncio.get_event_loop()
    task = loop.create_task(game_loop(websocket, game))
    tasks[websocket] = task

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            action = msg.get("action")
            if action == "direction":
                game.set_direction(msg.get("direction", "right"))
            elif action == "reset":
                game.reset()
                # Reiniciar game loop
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                task = loop.create_task(game_loop(websocket, game))
                tasks[websocket] = task
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in tasks:
            tasks[websocket].cancel()
        if websocket in games:
            del games[websocket]
        if websocket in tasks:
            del tasks[websocket]


@app.get("/")
def root() -> dict:
    return {"message": "Snake Game API - connect via WebSocket /ws"}
