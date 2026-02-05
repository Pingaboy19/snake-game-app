# 🐍 Snake — Juego de la Serpiente

Juego de la serpiente con **Python** (backend) y **React** (frontend). Diseño moderno, conexión en tiempo real por WebSocket.

## Cómo ejecutarlo

### 1. Backend (Python)

Recomendado usar un entorno virtual:

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173** en el navegador. El frontend usa el proxy de Vite para conectar el WebSocket al backend en el puerto 8000.

## Controles

- **Flechas** o **WASD** para mover la serpiente.
- La serpiente atraviesa los bordes (modo "wrap").
- Cada comida suma 10 puntos y la velocidad aumenta un poco.

## Stack

- **Backend:** FastAPI, WebSocket, lógica del juego en `game.py`
- **Frontend:** React (Vite), CSS Modules, diseño oscuro con acentos cyan/rosa
