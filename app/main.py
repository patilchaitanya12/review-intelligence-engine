from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(title="Review Intelligence Engine")

app.include_router(router)