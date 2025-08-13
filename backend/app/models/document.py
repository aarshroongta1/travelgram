from sqlalchemy import Column, Integer, String, JSON, UniqueConstraint, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Reel(Base):
    __tablename__ = "reels"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)
    city = Column(String, nullable=False)
    category = Column(String, nullable=False)
    thumbnail = Column(String, nullable=False)
    caption = Column(String, nullable=False)
    username = Column(String, nullable=False)

class Pages(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, nullable=False)
    category = Column(String, nullable=False)
    start_page = Column(Integer, default=1)

    __table_args__ = (
        UniqueConstraint("city", "category", name="unique_page"),
    )

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

    saved_reels = relationship("SavedReel", back_populates="user")

class SavedReel(Base):
    __tablename__ = "saved_reels"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    reel_id = Column(Integer, ForeignKey("reels.id"), index=True)

    __table_args__ = (UniqueConstraint("user_id", "reel_id", name="unique_save"),)

    user = relationship("User", back_populates="saved_reels")
    reel = relationship("Reel")

