from app.db.session import engine
from app.models.document import Base

def init_db():
    Base.metadata.create_all(bind=engine)