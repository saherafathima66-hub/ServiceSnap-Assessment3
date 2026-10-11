/**
 * api.js — Central API helper for ServiceSnap frontend.
 *
 * All network requests to the Python backend go through here.
 * Each function returns parsed JSON data or throws an error.
 *
 * The API base URL comes from the VITE_API_URL environment variable.
 * In local dev:  http://localhost:8000
 * In production: /api (relative — same domain on Vercel)
 */

const API_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Helper to make API requests with consistent headers and error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`

  // Get stored user ID for authentication header
  const storedUser = localStorage.getItem('servicesnap_user')
  const userId = storedUser ? JSON.parse(storedUser).id : null

  const headers = {
    'Content-Type': 'application/json',
    ...(userId && { 'X-User-Id': userId }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`)
  }

  return data
}

// ── Auth ──────────────────────────────────────────────────────

export async function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signup(email, password, name, role) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  })
}

// ── Services ──────────────────────────────────────────────────

export async function getServices() {
  return request('/api/services')
}

export async function createService(serviceData) {
  return request('/api/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  })
}

// ── Sites ─────────────────────────────────────────────────────

export async function getSites() {
  return request('/api/sites')
}

export async function createSite(siteData) {
  return request('/api/sites', {
    method: 'POST',
    body: JSON.stringify(siteData),
  })
}

// ── Issues ────────────────────────────────────────────────────

export async function getIssues() {
  return request('/api/issues')
}

export async function createIssue(issueData) {
  return request('/api/issues', {
    method: 'POST',
    body: JSON.stringify(issueData),
  })
}