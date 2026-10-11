/**
 * supabase.js — Supabase client for ServiceSnap frontend.
 *
 * Used ONLY for Supabase Auth (login, signup, session management).
 * All data CRUD goes through the Python backend (see api.js).
 *
 * Get your keys from:
 * https://supabase.com → Project Settings → API → Project URL & anon key
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only create client if credentials are configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null