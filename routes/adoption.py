from fastapi import APIRouter, HTTPException

from models import adoption, animal
from schemas.adoptions import AdoptionCreate, AdoptionOut

adoption_router = APIRouter(prefix="/adoptions", tags=["adoptions"])


@adoption_router.get("", response_model=list[AdoptionOut])
def get_adoptions():
    return adoption.list_all()


@adoption_router.get("/{adoption_id}", response_model=AdoptionOut)
def get_adoption(adoption_id: int):
    row = adoption.get(adoption_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Adoption not found.")
    return row


@adoption_router.post("", status_code=201, response_model=AdoptionOut)
def create_adoption(data: AdoptionCreate):
    if animal.get(data.animal_id) is None:
        raise HTTPException(status_code=404, detail="Animal not found.")
    try:
        return adoption.create(data.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@adoption_router.put("/{adoption_id}", response_model=AdoptionOut)
def update_adoption(adoption_id: int, data: AdoptionCreate):
    if animal.get(data.animal_id) is None:
        raise HTTPException(status_code=404, detail="Animal not found.")
    try:
        row = adoption.update(adoption_id, data.model_dump()) # Метод .model_dump() преобразует его в обычный Python-словарь:

    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    if row is None:
        raise HTTPException(status_code=404, detail="Adoption not found.")
    return row


@adoption_router.delete("/{adoption_id}")
def delete_adoption(adoption_id: int):
    if not adoption.delete(adoption_id):
        raise HTTPException(status_code=404, detail="Adoption not found.")
    return {"deleted": adoption_id}
