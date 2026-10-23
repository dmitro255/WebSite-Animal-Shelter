from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.adoption import adoption_router
from routes.animal import animal_router

from database import init_db

init_db()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(animal_router)
app.include_router(adoption_router)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

