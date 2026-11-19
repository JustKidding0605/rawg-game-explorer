## Overview:
RAWG Game Explorer is a full-stack video game discovery and personal backlog management web application. Users can search the RAWG Video Games Database by title, filter results by genre (Action, RPG, Strategy, Indie), and sort by relevance, highest rating, or newest release date. Selecting any title opens a detailed view with descriptions, release dates, ratings, platforms, and genres, allowing users to save games to a persistent backlog and track their progress across Want to Play, Playing, and Completed statuses.

## Tech Stack:
Frontend: HTML5, CSS3 (responsive CSS Grid, custom properties, and automatic dark mode via prefers-color-scheme), and Vanilla JavaScript (ES6+ fetch API with async/await).

Backend: Python, FastAPI, Uvicorn, HTTPX (AsyncClient), Pydantic, and python-dotenv.

Database: SQLite with SQLAlchemy ORM (SavedGame model).   Testing: pytest with FastAPI's TestClient.

## Architecture & Key Engineering Decisions:
Backend API Proxy & Secret Management: All external requests to the RAWG API are routed through FastAPI proxy endpoints (/api/games and /api/games/{game_id}) using httpx.AsyncClient. Loading RAWG_API_KEY from a server-side .env file via python-dotenv keeps credentials out of client-side JavaScript, while CORS middleware manages cross-origin requests from the frontend.  

Composite-Key In-Memory Caching: Search responses are cached in a server-side dictionary keyed by normalized query string, genre filter, and sort order (f"{query}_{genres}_{ordering}"). This avoids redundant third-party API calls for repeated searches and lowers response latency.   

RESTful Backlog Persistence & Dynamic Filtering: Saved games are persisted in SQLite via SQLAlchemy (SavedGame) and managed through /api/backlog endpoints supporting creation/status upsert (POST), optional status query filtering (GET /api/backlog?status=...), and deletion (DELETE /api/backlog/{rawg_id}).   

Defensive UI & State Management: The frontend manages loading indicators, HTTP/network error banners, and optional chaining fallbacks (?.) to safely render games with missing platform or genre metadata.

## Local Setup & Testing:
Clone the repository:

git clone https://github.com/JustKidding0605/rawg-game-explorer.git
cd rawg-game-explorer

Create and activate a Python virtual environment in backend/:

cd backend
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows (PowerShell):
.\venv\Scripts\Activate

Install backend dependencies:

pip install -r requirements.txt

Configure environment variables:
Copy .env.example to .env inside backend/ and add your RAWG API key:

RAWG_API_KEY=your_api_key_here

Start the FastAPI server:

uvicorn main:app --reload

The API runs at [http://127.0.0.1:8000](http://127.0.0.1:8000), with interactive Swagger documentation available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

Launch the frontend:
Open frontend/index.html using VS Code Live Server (or another local static server) to interact with the application.

Run automated API tests:
From inside backend/ with your virtual environment active, run:

pytest
