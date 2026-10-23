from typing import Literal

from pydantic import BaseModel, Field


AdoptionStatus = Literal["pending", "approved", "rejected"]


class AdoptionCreate(BaseModel):
    animal_id: int
    person_name: str  
    phone: str  
    reason: str | None = None
    status: AdoptionStatus = "pending"


class AdoptionOut(AdoptionCreate):
    id: int
