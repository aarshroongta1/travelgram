from sqlalchemy.orm import Session
from typing import List
from app.models.document import Reel, Pages
from app.schemas.reel import NewReel

def add_reel_to_db(db: Session, reels: List[NewReel]) -> List[Reel]:
    saved = []

    for reel in reels:
        if db.query(Reel).filter_by(url=reel.url).first():
            continue

        db_reel = Reel(**reel.dict())
        db.add(db_reel)
        db.commit()
        db.refresh(db_reel)
        saved.append(db_reel)

    return saved

def add_page_to_db(db: Session, city: str, category: str, start_page: int = 1) -> Pages:
    record = db.query(Pages).filter_by(city=city, category=category).first()
    if record:
        record.start_index = start_page
    else:
        record = Pages(city=city, category=category, start_page=start_page)
        db.add(record)
            
    db.commit()
    db.refresh(record)
    return record
