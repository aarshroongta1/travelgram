from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.routes import router as search_router
from app.routes.auth import router as auth_router
from app.db.init import init_db

app = FastAPI(title="Travelgram")
init_db()
app.include_router(search_router)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)