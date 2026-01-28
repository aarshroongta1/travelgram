from fastapi import APIRouter, Depends, HTTPException
from app.services.data import get_instagram_reels
from app.schemas.reel import ReelOut
from app.models.document import Reel, Pages, SavedReel
from app.crud.crud import add_reel_to_db, add_page_to_db
from sqlalchemy.orm import Session
from app.db.session import get_db
from typing import List, Dict
from app.auth.supabase import get_current_user

router = APIRouter()


@router.get("/existing/{city}", response_model=Dict[str, List[ReelOut]])
async def get_existing(city: str, db: Session = Depends(get_db)):
    categories = ["cafes", "restaurants", "stay", "things to do", "shopping", "nightlife", "bar", "festivals", "art and culture", "adventure"]
    ret = {}
    for cat in categories:
        existing = db.query(Reel).filter_by(city=city, category=cat).all()
        ret[cat] = [ReelOut.from_orm(r) for r in existing]
    return ret


@router.get("/search", response_model=Dict[str, List[ReelOut]])
async def get_results(city: str, category: str, num: int = 6, db: Session = Depends(get_db)):
    query_map = {
        "cafes": "best cafes in ",
        "restaurants": "best restaurants in ",
        "stay": "best hotels in ",
        "things to do": "best attractions/things to do in ",
        "shopping": "best shopping places in ",
        "nightlife": "best nightlife clubs in ",
        "bar": "best bars in ",
        "festivals": "festivals in ",
        "art and culture": "art and culture in ",
        "adventure": "adventure in "
    }

    ret = {}
    category = category.lower()

    query = query_map[category] + city

    page = db.query(Pages).filter_by(city=city, category=category).first()
    existing = db.query(Reel).filter_by(city=city, category=category).all()
    seen_links = {r.url for r in existing}

    new_reels, next_page = await get_instagram_reels(query=query, city=city, category=category, existing_links=seen_links, start_page=page.start_page if page else 1, max_links=num)
    saved = add_reel_to_db(db, new_reels)
    add_page_to_db(db, city=city, category=category, start_page=next_page)
    ret[category] = [ReelOut.from_orm(r) for r in saved]
    return ret


@router.get("/search/all", response_model=Dict[str, List[ReelOut]])
async def get_all(city: str, db: Session = Depends(get_db)):
    query_map = {
        "cafes": "best cafes in ",
        "restaurants": "best restaurants in ",
        "stay": "best hotels in ",
        "things to do": "best attractions/things to do in ",
        "shopping": "best shopping places in ",
        "nightlife": "best nightlife clubs in ",
        "bar": "best bars in ",
        "festivals": "festivals in ",
        "art and culture": "art and culture in ",
        "adventure": "adventure in "
    }

    ret = {}

    for category, query in query_map.items():
        page = db.query(Pages).filter_by(city=city, category=category).first()
        existing = db.query(Reel).filter_by(city=city, category=category).all()
        seen_links = {r.url for r in existing}
        search_query = query + city
        new_reels, next_page = await get_instagram_reels(query=search_query, city=city, category=category, existing_links=seen_links, start_page=page.start_page if page else 1, max_links=1)
        saved = add_reel_to_db(db, new_reels)
        add_page_to_db(db, city=city, category=category, start_page=next_page)
        ret[category] = [ReelOut.from_orm(r) for r in saved]
    return ret


@router.post("/save")
def save_reel(reel_id: int, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    exists = db.query(SavedReel).filter_by(user_id=user_id, reel_id=reel_id).first()
    if exists:
        raise HTTPException(status_code=400, detail="Already saved")
    db.add(SavedReel(user_id=user_id, reel_id=reel_id))
    db.commit()


@router.post("/unsave")
def unsave_reel(reel_id: int, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(SavedReel).filter_by(user_id=user_id, reel_id=reel_id).delete()
    db.commit()


@router.get("/saved", response_model=List[ReelOut])
def get_saved_reels(user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    saved = db.query(SavedReel).filter_by(user_id=user_id).all()
    return [s.reel for s in saved]


@router.get("/check-saved")
def check_saved(reel_id: int, user_id: str = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(SavedReel).filter_by(user_id=user_id, reel_id=reel_id).first()
    return {"saved": bool(existing)}
