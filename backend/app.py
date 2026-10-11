"""
ServiceSnap — Python Flask Backend
===================================
Provides REST API endpoints for the ServiceSnap React frontend.
Connects to Supabase (PostgreSQL) for data storage.

Run locally:
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env   # then fill in your Supabase keys
    python app.py
"""

import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

# ── Load environment variables ──────────────────────────────────
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Initialise Flask ────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-me")

# Allow the React frontend to call this backend
CORS(app, origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
     supports_credentials=True)

# ── Initialise Supabase client ──────────────────────────────────
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ── Helper: get user from request header ────────────────────────
def get_current_user():
    """Extract user ID from the X-User-Id header."""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return None
    return user_id


# ══════════════════════════════════════════════════════════════════
#  AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════════════

@app.route("/api/auth/login", methods=["POST"])
def login():
    """Log in with email and password using Supabase Auth."""
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if result.user is None:
            return jsonify({"error": "Invalid email or password"}), 401

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

        return jsonify({
            "user": profile_data,
            "access_token": result.session.access_token,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 401


@app.route("/api/auth/signup", methods=["POST"])
def signup():
    """Create a new user account with Supabase Auth."""
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    name = data.get("name", "").strip() or email.split("@")[0]
    role = data.get("role", "Site Manager")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        result = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        if result.user is None:
            return jsonify({"error": "Could not create account"}), 400

        # Create a profile row
        supabase.table("profiles").insert({
            "id": result.user.id,
            "name": name,
            "role": role,
            "email": email,
        }).execute()

        return jsonify({
            "user": {
                "id": result.user.id,
                "name": name,
                "role": role,
                "email": email,
            },
            "message": "Account created. Check your email for verification.",
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ══════════════════════════════════════════════════════════════════
#  SERVICES ENDPOINTS
# ══════════════════════════════════════════════════════════════════

@app.route("/api/services", methods=["GET"])
def get_services():
    """Fetch all services for the current user."""
    user_id = get_current_user()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    try:
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

        return jsonify({"services": services}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/services", methods=["POST"])
def create_service():
    """Create a new service visit."""
    user_id = get_current_user()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data = request.get_json()
    required = ["title", "provider", "site_id", "date", "time"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    try:
        result = supabase.table("services").insert({
            "title": data["title"],
            "provider": data["provider"],
            "site_id": int(data["site_id"]),
            "date": data["date"],
            "time": data["time"],
            "status": "upcoming",
            "notes": data.get("notes"),
            "user_id": user_id,
        }).execute()

        new_service = result.data[0]

        site = supabase.table("sites") \
            .select("name") \
            .eq("id", new_service["site_id"]) \
            .execute()
        site_name = site.data[0]["name"] if site.data else "Unknown Site"

        return jsonify({
            "service": {**new_service, "site": site_name}
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════════════
#  SITES ENDPOINTS
# ══════════════════════════════════════════════════════════════════

@app.route("/api/sites", methods=["GET"])
def get_sites():
    """Fetch all sites for the current user."""
    user_id = get_current_user()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    try:
        result = supabase.table("sites") \
            .select("*").eq("user_id", user_id) \
            .order("name").execute()
        return jsonify({"sites": result.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/sites", methods=["POST"])
def create_site():
    """Register a new site."""
    user_id = get_current_user()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json()
    for field in ["name", "address", "contact", "phone"]:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400
    try:
        result = supabase.table("sites").insert({
            "name": data["name"], "address": data["address"],
            "contact": data["contact"], "phone": data["phone"],
            "notes": data.get("notes"), "user_id": user_id,
        }).execute()
        return jsonify({"site": result.data[0]}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════════════
#  ISSUES ENDPOINTS
# ══════════════════════════════════════════════════════════════════

@app.route("/api/issues", methods=["GET"])
def get_issues():
    """Fetch all issue reports for the current user."""
    user_id = get_current_user()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    try:
        result = supabase.table("issues") \
            .select("*").eq("user_id", user_id) \
            .order("reported_at", desc=True).execute()
        return jsonify({"issues": result.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/issues", methods=["POST"])
def create_issue():
    """Report an issue. Also updates service status to 'reported'."""
    user_id = get_current_user()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    data = request.get_json()
    for field in ["service_id", "issue_type", "description"]:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400
    try:
        result = supabase.table("issues").insert({
            "service_id": int(data["service_id"]),
            "issue_type": data["issue_type"],
            "description": data["description"],
            "photo_url": data.get("photo_url"),
            "reported_at": datetime.datetime.utcnow().isoformat(),
            "user_id": user_id,
        }).execute()

        supabase.table("services") \
            .update({"status": "reported"}) \
            .eq("id", int(data["service_id"])).execute()

        return jsonify({"issue": result.data[0]}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ══════════════════════════════════════════════════════════════════
#  HEALTH CHECK & SERVER
# ══════════════════════════════════════════════════════════════════

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "app": "ServiceSnap API"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"🚀 ServiceSnap API running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)