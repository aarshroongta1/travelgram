import asyncio
from fastapi import APIRouter, Depends, HTTPException
from app.services.data import get_instagram_reels
from app.schemas.reel import ReelOut
from app.db.client import supabase
from typing import List, Dict
from app.auth.supabase import get_current_user

router = APIRouter()


@router.get("/existing/{city}", response_model=Dict[str, List[ReelOut]])
async def get_existing(city: str):
    categories = ["cafes", "restaurants", "stay", "things to do", "shopping", "nightlife", "bar", "festivals", "art and culture", "adventure"]
    ret = {}
    for cat in categories:
        response = supabase.table("reels").select("*").eq("city", city).eq("category", cat).execute()
        ret[cat] = response.data
    return ret


@router.get("/search", response_model=Dict[str, List[ReelOut]])
async def get_results(city: str, category: str, num: int = 6):
    # Queries optimized for finding Instagram travel reels
    query_map = {
        "cafes": "cafes coffee spots ",
        "restaurants": "food restaurants where to eat ",
        "stay": "hotels where to stay accommodation ",
        "things to do": "things to do places to visit travel guide ",
        "shopping": "shopping markets souvenirs ",
        "nightlife": "nightlife clubs party ",
        "bar": "bars rooftop drinks ",
        "festivals": "festivals events ",
        "art and culture": "art culture museums ",
        "adventure": "adventure activities outdoor "
    }

    category = category.lower()
    query = query_map[category] + city

    # Get current page
    page_response = supabase.table("pages").select("*").eq("city", city).eq("category", category).execute()
    start_page = page_response.data[0]["start_page"] if page_response.data else 1

    # Get existing reel URLs
    existing_response = supabase.table("reels").select("url").eq("city", city).eq("category", category).execute()
    seen_links = {r["url"] for r in existing_response.data}

    # Fetch new reels
    new_reels, next_page = await get_instagram_reels(
        query=query, city=city, category=category,
        existing_links=seen_links, start_page=start_page, max_links=num
    )
    print(f"Found {len(new_reels)} new reels")

    # Save new reels
    saved = []
    for reel in new_reels:
        print(f"Saving reel: {reel.url}")
        try:
            response = supabase.table("reels").insert(reel.model_dump()).execute()
            print(f"Insert response: {response.data}")
            if response.data:
                saved.extend(response.data)
        except Exception as e:
            print(f"Insert error: {e}")

    # Update page tracking
    if page_response.data:
        supabase.table("pages").update({"start_page": next_page}).eq("city", city).eq("category", category).execute()
    else:
        supabase.table("pages").insert({"city": city, "category": category, "start_page": next_page}).execute()

    return {category: saved}


@router.get("/search/all", response_model=List[ReelOut])
async def get_all(city: str):
    # Queries optimized for finding Instagram travel reels
    query_map = {
        "cafes": "cafes coffee spots ",
        "restaurants": "food restaurants where to eat ",
        "stay": "hotels where to stay accommodation ",
        "things to do": "things to do places to visit travel guide ",
        "shopping": "shopping markets souvenirs ",
        "nightlife": "nightlife clubs party ",
        "bar": "bars rooftop drinks ",
        "festivals": "festivals events ",
        "art and culture": "art culture museums ",
        "adventure": "adventure activities outdoor "
    }

    async def fetch_category(category: str, query_prefix: str):
        page_response = supabase.table("pages").select("*").eq("city", city).eq("category", category).execute()
        start_page = page_response.data[0]["start_page"] if page_response.data else 1

        existing_response = supabase.table("reels").select("url").eq("city", city).eq("category", category).execute()
        seen_links = {r["url"] for r in existing_response.data}

        search_query = query_prefix + city
        new_reels, next_page = await get_instagram_reels(
            query=search_query, city=city, category=category,
            existing_links=seen_links, start_page=start_page, max_links=6
        )

        saved = []
        for reel in new_reels:
            try:
                response = supabase.table("reels").insert(reel.model_dump()).execute()
                if response.data:
                    saved.extend(response.data)
            except Exception:
                pass

        if page_response.data:
            supabase.table("pages").update({"start_page": next_page}).eq("city", city).eq("category", category).execute()
        else:
            supabase.table("pages").insert({"city": city, "category": category, "start_page": next_page}).execute()

        return saved

    # Run all categories in parallel
    tasks = [fetch_category(cat, prefix) for cat, prefix in query_map.items()]
    results = await asyncio.gather(*tasks)

    # Round-robin: 1st from each category, then 2nd from each, etc.
    interleaved = []
    max_len = max(len(r) for r in results) if results else 0
    for i in range(max_len):
        for category_reels in results:
            if i < len(category_reels):
                interleaved.append(category_reels[i])

    return interleaved


@router.post("/save")
def save_reel(reel_id: int, user_id: str = Depends(get_current_user)):
    existing = supabase.table("saved_reels").select("*").eq("user_id", user_id).eq("reel_id", reel_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Already saved")
    supabase.table("saved_reels").insert({"user_id": user_id, "reel_id": reel_id}).execute()
    return {"status": "saved"}


@router.post("/unsave")
def unsave_reel(reel_id: int, user_id: str = Depends(get_current_user)):
    supabase.table("saved_reels").delete().eq("user_id", user_id).eq("reel_id", reel_id).execute()
    return {"status": "unsaved"}


@router.get("/saved", response_model=List[ReelOut])
def get_saved_reels(user_id: str = Depends(get_current_user)):
    saved = supabase.table("saved_reels").select("reel_id").eq("user_id", user_id).execute()
    reel_ids = [s["reel_id"] for s in saved.data]
    if not reel_ids:
        return []
    reels = supabase.table("reels").select("*").in_("id", reel_ids).execute()
    return reels.data


@router.get("/check-saved")
def check_saved(reel_id: int, user_id: str = Depends(get_current_user)):
    existing = supabase.table("saved_reels").select("*").eq("user_id", user_id).eq("reel_id", reel_id).execute()
    return {"saved": bool(existing.data)}
