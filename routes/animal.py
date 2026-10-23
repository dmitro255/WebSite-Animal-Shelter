from fastapi import APIRouter, HTTPException, Query

from models import animal
from schemas.animals import AnimalCreate, AnimalOut, AnimalStatus

animal_router = APIRouter(prefix="/animals", tags=["animals"])


@animal_router.get("", response_model=list[AnimalOut])
def get_animals(
    species: str | None = None,
    status: AnimalStatus | None = Query(default=None),
):
    return animal.list_all()


@animal_router.get("/{animal_id}", response_model=AnimalOut)
def get_animal(animal_id: int):
    row = animal.get(animal_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Animal not found.")
    return row


@animal_router.post("", status_code=201, response_model=AnimalOut)
def create_animal(data: AnimalCreate):
    return animal.create(data.model_dump())


@animal_router.put("/{animal_id}", response_model=AnimalOut)
def update_animal(animal_id: int, data: AnimalCreate):
    row = animal.update(animal_id, data.model_dump())
    if row is None:
        raise HTTPException(status_code=404, detail="Animal not found.")
    return row


@animal_router.delete("/{animal_id}")
def delete_animal(animal_id: int):
    if not animal.delete(animal_id):
        raise HTTPException(status_code=404, detail="Animal not found.")
    return {"deleted": animal_id}
