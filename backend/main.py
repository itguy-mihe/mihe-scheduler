import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from db import init_db
from routers import auth, meetings, polls
from seed import seed

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
IS_PROD = os.environ.get("ENV", "dev") == "production"
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed()   # create admin user + sample meeting if DB is empty
    yield


app = FastAPI(title="MIHE Meeting Scheduler", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    max_age=60 * 60 * 8,
    https_only=IS_PROD,
    same_site="lax",
)

app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(polls.router)

# Serve built React app in production
if IS_PROD:
    app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
