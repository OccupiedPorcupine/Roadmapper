# FastAPI app entrypoint
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.database import init_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
    except Exception as e:
        logger.warning(
            "Database init failed (is PostgreSQL running?): %s. "
            "Auth and roadmap endpoints will fail until the DB is available.",
            e,
        )
    yield


app = FastAPI(
    title="AI Roadmap Builder API",
    lifespan=lifespan,
)


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add origins from environment variable
import os
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    origins.extend(env_origins.split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
