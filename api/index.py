"""
ServiceSnap — FastAPI Backend
==============================
Python API with Supabase database and JWT authentication.

Vercel automatically detects FastAPI apps inside the api/ folder
and turns them into serverless functions.

Run locally:
    cd api
    pip install -r ../requirements.txt
    uvicorn index:app --reload --port 8000
"""

import os
from datetime import datetime

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client

# ── Load environment variables ──────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# ── Create the FastAPI application ──────────────────────────────
app = FastAPI(
    title="ServiceSnap API",
    description="Backend API for the ServiceSnap service management app",
    version="0.2.0",
)

# ── Allow the React frontend to call this API ───────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Initialise Supabase client (service role — bypasses RLS) ────
supabase = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ── Auth helper: verify JWT and extract user ID ─────────────────
def get_current_user_id(request: Request) -> str:
    """
    Extract and verify the Supabase JWT access token from the
    Authorization header. Returns the authenticated user's UUID.
    Raises 401 if the token is missing or invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authentication token")

    token = auth_header.replace("Bearer ", "")

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured on server")

    try:
        # Verify the token by asking Supabase Auth who this user is
        user = supabase.auth.get_user(token)
        if user is None or user.user is None:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user.user.id
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── Health check endpoint ───────────────────────────────────────
@app.get("/api/health")
def health_check():
    """
    Simple endpoint to confirm the API is running.
    Visit: http://localhost:8000/api/health
    """
    return {
        "status": "ok",
        "app": "ServiceSnap API",
        "version": "0.2.0",
        "supabase_connected": supabase is not None,
    }


@app.get("/")
def root():
    return {
        "message": "ServiceSnap API is running. Visit /api/health to check.",
    }


# ══════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════════════

@app.post("/api/auth/login")
async def login(request: Request):
    """
    Login via Supabase Auth.
    The frontend calls this endpoint; we proxy the request to Supabase
    and return the user profile + access token.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    body = await request.json()
    email = body.get("email", "").strip()
    password = body.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    try:
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })

        if result.user is None:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Get the user's profile from our profiles table
        profile = supabase.table("profiles") \
            .select("*") \
            .eq("id", result.user.id) \
            .execute()

        profile_data = profile.data[0] if profile.data else {
            "id": result.user.id,
            "name": email.split("@")[0],
            "role": "Site Manager",
            "email": email,
        }

        return {
            "user": profile_data,
            "access_token": result.session.access_token,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/api/auth/signup")
async def signup(request: Request):
    """Create a new user account via Supabase Auth."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    body = await request.json()
    email = body.get("email", "").strip()
    password = body.get("password", "")
    name = body.get("name", "").strip() or email.split("@")[0]
    role = body.get("role", "Site Manager")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    try:
        result = supabase.auth.sign_up({
            "email": email,
            "password": password,
        })

        if result.user is None:
            raise HTTPException(status_code=400, detail="Could not create account")

        # Create a profile row
        supabase.table("profiles").insert({
            "id": result.user.id,
            "name": name,
            "role": role,
            "email": email,
        }).execute()

        return {
            "user": {
                "id": result.user.id,
                "name": name,
                "role": role,
                "email": email,
            },
            "message": "Account created. Check your email for verification.",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ══════════════════════════════════════════════════════════════════
#  SERVICES ENDPOINTS (require authentication)
# ══════════════════════════════════════════════════════════════════

@app.get("/api/services")
def get_services(request: Request):
    """Fetch all services for the authenticated user."""
    user_id = get_current_user_id(request)

    result = supabase.table("services") \
        .select("*, sites(name)") \
        .eq("user_id", user_id) \
        .order("date", desc=False) \
        .execute()

    services = []
    for svc in result.data:
        services.append({
            "id": svc["id"],
            "title": svc["title"],
            "provider": svc["provider"],
            "site": svc["sites"]["name"] if svc.get("sites") else "Unknown Site",
            "site_id": svc["site_id"],
            "date": svc["date"],
            "time": svc["time"],
            "status": svc["status"],
            "notes": svc.get("notes"),
        })

    return {"services": services}


@app.post("/api/services")
async def create_service(request: Request):
    """Create a new service visit."""
    user_id = get_current_user_id(request)
    body = await request.json()

    for field in ["title", "provider", "site_id", "date", "time"]:
        if not body.get(field):
            raise HTTPException(status_code=400, detail=f"'{field}' is required")

    result = supabase.table("services").insert({
        "title": body["title"],
        "provider": body["provider"],
        "site_id": int(body["site_id"]),
        "date": body["date"],
        "time": body["time"],
        "status": "upcoming",
        "notes": body.get("notes"),
        "user_id": user_id,
    }).execute()

    new_service = result.data[0]

    # Fetch site name for the response
    site = supabase.table("sites") \
        .select("name") \
        .eq("id", new_service["site_id"]) \
        .execute()
    site_name = site.data[0]["name"] if site.data else "Unknown Site"

    return {"service": {**new_service, "site": site_name}}


# ══════════════════════════════════════════════════════════════════
#  SITES ENDPOINTS (require authentication)
# ══════════════════════════════════════════════════════════════════

@app.get("/api/sites")
def get_sites(request: Request):
    """Fetch all sites for the authenticated user."""
    user_id = get_current_user_id(request)

    result = supabase.table("sites") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("name") \
        .execute()

    return {"sites": result.data}


@app.post("/api/sites")
async def create_site(request: Request):
    """Register a new site."""
    user_id = get_current_user_id(request)
    body = await request.json()

    for field in ["name", "address", "contact", "phone"]:
        if not body.get(field):
            raise HTTPException(status_code=400, detail=f"'{field}' is required")

    result = supabase.table("sites").insert({
        "name": body["name"],
        "address": body["address"],
        "contact": body["contact"],
        "phone": body["phone"],
        "notes": body.get("notes"),
        "user_id": user_id,
    }).execute()

    return {"site": result.data[0]}


# ══════════════════════════════════════════════════════════════════
#  ISSUES ENDPOINTS (require authentication)
# ══════════════════════════════════════════════════════════════════

@app.get("/api/issues")
def get_issues(request: Request):
    """Fetch all issue reports for the authenticated user."""
    user_id = get_current_user_id(request)

    result = supabase.table("issues") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("reported_at", desc=True) \
        .execute()

    return {"issues": result.data}


@app.post("/api/issues")
async def create_issue(request: Request):
    """Report an issue. Also updates the service status to 'reported'."""
    user_id = get_current_user_id(request)
    body = await request.json()

    for field in ["service_id", "issue_type", "description"]:
        if not body.get(field):
            raise HTTPException(status_code=400, detail=f"'{field}' is required")

    result = supabase.table("issues").insert({
        "service_id": int(body["service_id"]),
        "issue_type": body["issue_type"],
        "description": body["description"],
        "photo_url": body.get("photo_url"),
        "reported_at": datetime.utcnow().isoformat(),
        "user_id": user_id,
    }).execute()

    # Update the related service status to 'reported'
    supabase.table("services") \
        .update({"status": "reported"}) \
        .eq("id", int(body["service_id"])) \
        .eq("user_id", user_id) \
        .execute()

    return {"issue": result.data[0]}