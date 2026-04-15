from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, brands, creatives, festivals, analytics
from app.services.scheduler import start_scheduler, stop_scheduler

app = FastAPI(
    title="Indian Social Media Platform API",
    description="AI-powered social media creative generator for Indian brands",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(brands.router)
app.include_router(creatives.router)
app.include_router(festivals.router)
app.include_router(analytics.router)


@app.on_event("startup")
async def startup_event():
    if settings.environment == "production":
        start_scheduler()


@app.on_event("shutdown")
async def shutdown_event():
    stop_scheduler()


@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": settings.environment}