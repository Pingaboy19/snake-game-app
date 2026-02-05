# 🐍 Snake — Juego de la Serpiente

Juego de la serpiente con **Python** (backend) y **React** (frontend). Funciona con backend WebSocket o en modo local en el navegador (ideal para Vercel).

## ▶️ Jugar ahora (Vercel)

**Despliega en un clic:**  
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPingaboy19%2Fsnake-game-app)

O importa el repo en [vercel.com/new](https://vercel.com/new): selecciona `Pingaboy19/snake-game-app` y despliega. No cambies el Root Directory (el `vercel.json` ya configura el build del frontend).

## Cómo ejecutarlo en local

### 1. Backend (Python)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**. Con el backend en marcha usa WebSocket; si no, el juego pasa a modo local a los ~2.5 s.

## Controles

- **Flechas** o **WASD** para mover.
- Bordes con wrap. Cada comida +10 puntos y más velocidad.

## Stack

- **Backend:** FastAPI, WebSocket (`game.py`).
- **Frontend:** React (Vite), CSS Modules, modo local para Vercel.
