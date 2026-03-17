from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.routes import router

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Backend base para la landing de Banca.me.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def read_root():
    return {
        "name": settings.app_name,
        "status": "bootstrapped",
        "environment": settings.environment,
    }
