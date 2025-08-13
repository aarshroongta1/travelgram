from pydantic import BaseModel

class ReelBase(BaseModel):
    url: str
    city: str
    category: str
    thumbnail: str
    username: str
    caption: str

class NewReel(ReelBase):
    pass

class ReelOut(ReelBase):
    id: int

    class Config:
        from_attributes = True

