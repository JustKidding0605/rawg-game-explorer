import os
import httpx
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from database import SessionLocal, SavedGame

load_dotenv()
RAWG_API_KEY = os.getenv("RAWG_API_KEY")
BASE_URL = "https://api.rawg.io/api"

app = FastAPI(title="RAWG Game Explorer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

search_cache = {}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class GameCreate(BaseModel):
    rawg_id: int
    name: str
    background_image: str | None = None
    released: str | None = None
    rating: float | None = None
    status: str = "Want to Play"

@app.get("/api/games")
async def search_games(search: str):
    query = search.strip().lower()
    if query in search_cache:
        return search_cache[query]

    url = f"{BASE_URL}/games"
    params = {"search": query, "key": RAWG_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching from RAWG")
        data = response.json()
        search_cache[query] = data
        return data

@app.get("/api/games/{game_id}")
async def get_game_detail(game_id: int):
    url = f"{BASE_URL}/games/{game_id}"
    params = {"key": RAWG_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Game not found")
        return response.json()

@app.get("/api/backlog")
def get_backlog(db: Session = Depends(get_db)):
    return db.query(SavedGame).all()

@app.post("/api/backlog")
def add_to_backlog(game: GameCreate, db: Session = Depends(get_db)):
    existing = db.query(SavedGame).filter(SavedGame.rawg_id == game.rawg_id).first()
    if existing:
        existing.status = game.status
        db.commit()
        return existing
    
    new_game = SavedGame(**game.model_dump())
    db.add(new_game)
    db.commit()
    db.refresh(new_game)
    return new_game

@app.delete("/api/backlog/{rawg_id}")
def remove_from_backlog(rawg_id: int, db: Session = Depends(get_db)):
    game = db.query(SavedGame).filter(SavedGame.rawg_id == rawg_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not in backlog")
    db.delete(game)
    db.commit()
    return {"message": "Removed"}