from typing import Literal

from pydantic import BaseModel, Field


AnimalStatus = Literal["available", "reserved", "adopted"]


class AnimalCreate(BaseModel):
    name: str 
    species: str 
    breed: str | None = None
    age: int = Field(ge=0)
    description: str | None = None
    status: AnimalStatus = "available"


class AnimalOut(AnimalCreate):
    id: int
