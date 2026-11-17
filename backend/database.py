from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./games.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class SavedGame(Base):
    __tablename__ = "saved_games"

    id = Column(Integer, primary_key=True, index=True)
    rawg_id = Column(Integer, unique=True, index=True)
    name = Column(String, nullable=False)
    background_image = Column(String, nullable=True)
    released = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    status = Column(String, default="Want to Play") 

Base.metadata.create_all(bind=engine)