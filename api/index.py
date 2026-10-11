"""
ServiceSnap — FastAPI Backend
==============================
This is the entry point for the ServiceSnap Python API.

Vercel automatically detects FastAPI apps inside the api/ folder
and turns them into serverless functions.

Run locally:
    cd api
    pip install -r requirements.txt
    uvicorn index:app --reload --port 5000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Create the FastAPI application ──────────────────────────────
app = FastAPI(
    title="ServiceSnap API",
    description="Backend API for the ServiceSnap service management app",
    version="0.1.0",
)

# ── Allow the React frontend to call this API ───────────────────
# In production, replace "*" with your actual Vercel frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check endpoint ───────────────────────────────────────
@app.get("/api/health")
def health_check():
    """
    Simple endpoint to confirm the API is running.
    Visit: http://localhost:5000/api/health
    """
    return {
        "status": "ok",
        "app": "ServiceSnap API",
        "version": "0.1.0",
    }


# ── Root endpoint ───────────────────────────────────────────────
@app.get("/")
def root():
    """
    Welcome message at the root URL.
    """
    return {
        "message": "ServiceSnap API is running. Visit /api/health to check.",
    }