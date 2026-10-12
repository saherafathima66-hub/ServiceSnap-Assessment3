import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { sampleServices, sampleSites } from '../data/sampleData'
import * as api from '../services/api'
import { supabase } from '../services/supabase'

// Create the context
const AppContext = createContext(null)

/**
 * AppProvider — Wraps the app and provides shared state to all screens.
 * Fetches data from the Python backend on mount.
 * Falls back to sample data if the backend is not available.
 */
function AppProvider({ children, toasterRef }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('servicesnap_user')
    return stored ? JSON.parse(stored) : null
  })
  const [services, setServices] = useState([])
  const [sites, setSites] = useState([])
  const [issues, setIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [useBackend, setUseBackend] = useState(false)

  // Fetch data from backend on mount (when user is logged in)
  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setServices(sampleServices)
        setSites(sampleSites)
        setIsLoading(false)
        return
      }
      try {
        const [svcResult, siteResult] = await Promise.all([
          api.getServices(), api.getSites(),
        ])
        setServices(svcResult.services)
        setSites(siteResult.sites)
        setUseBackend(true)
      } catch (err) {
        console.warn('Backend not available, using sample data:', err.message)
        setServices(sampleServices)
        setSites(sampleSites)
        setUseBackend(false)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [user])

  // Add a new service (async when backend is available)
  const addService = useCallback(async (newService) => {
    if (useBackend) {
      try {
        const result = await api.createService({
          title: newService.title,
          provider: newService.provider,
          site_id: newService.site_id,
          date: newService.date,
          time: newService.time,
          notes: newService.notes,
        })
        setServices((prev) => [result.service, ...prev])
      } catch (err) {
        console.error('Failed to create service:', err.message)
        throw err
      }
    } else {
      setServices((prev) => [newService, ...prev])
    }
  }, [useBackend])

  // Add a new site (async when backend is available)
  const addSite = useCallback(async (newSite) => {
    if (useBackend) {
      try {
        const result = await api.createSite({
          name: newSite.name,
          address: newSite.address,
          contact: newSite.contact,
          phone: newSite.phone,
          notes: newSite.notes,
        })
        setSites((prev) => [...prev, result.site])
      } catch (err) {
        console.error('Failed to create site:', err.message)
        throw err
      }
    } else {
      setSites((prev) => [...prev, newSite])
    }
  }, [useBackend])

  // Add a new issue report (async when backend is available)
  const addIssue = useCallback(async (newIssue) => {
    if (useBackend) {
      try {
        await api.createIssue({
          service_id: newIssue.serviceId,
          issue_type: newIssue.issueType,
          description: newIssue.description,
          photo_url: newIssue.photoName,
        })
        setIssues((prev) => [...prev, newIssue])
      } catch (err) {
        console.error('Failed to create issue:', err.message)
        throw err
      }
    } else {
      setIssues((prev) => [...prev, newIssue])
    }
    // Always update the related service's status locally
    if (newIssue.serviceId) {
      setServices((prev) =>
        prev.map((svc) =>
          svc.id === newIssue.serviceId
            ? { ...svc, status: 'reported' }
            : svc
        )
      )
    }
  }, [useBackend])

  // Login via Supabase Auth (falls back to demo mode if not configured)
  const loginUser = useCallback(async (email, password) => {
    // Try Supabase Auth first
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        const userData = {
          id: data.user.id,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: data.user.user_metadata?.role || 'Site Manager',
          email: data.user.email,
        }
        setUser(userData)
        localStorage.setItem('servicesnap_user', JSON.stringify(userData))
        localStorage.setItem('servicesnap_token', data.session.access_token)
        return { user: userData }
      } catch (err) {
        console.warn('Supabase login failed, using demo login:', err.message)
      }
    }

    // Fallback: demo mode (no Supabase configured or login failed)
    const demoUser = {
      id: 'demo-user-001',
      name: 'Sam Taylor',
      role: 'Site Manager',
      email: email,
    }
    setUser(demoUser)
    localStorage.setItem('servicesnap_user', JSON.stringify(demoUser))
    localStorage.removeItem('servicesnap_token')
    return { user: demoUser }
  }, [])

  // Logout — clear all state
  const logoutUser = useCallback(() => {
    if (supabase) {
      supabase.auth.signOut()
    }
    setUser(null)
    setServices(sampleServices)
    setSites(sampleSites)
    setIssues([])
    setUseBackend(false)
    localStorage.removeItem('servicesnap_user')
    localStorage.removeItem('servicesnap_token')
  }, [])

  // Show toast notification via the Toaster ref
  const showToast = useCallback((props) => {
    toasterRef?.current?.show(props)
  }, [toasterRef])

  const value = useMemo(() => ({
    user, setUser, loginUser, logoutUser,
    services, addService,
    sites, addSite,
    issues, addIssue,
    showToast, isLoading, useBackend,
  }), [user, services, sites, issues, addService, addSite, addIssue, showToast, isLoading, useBackend, loginUser, logoutUser])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

/**
 * useApp — Custom hook to access the app context from any component.
 */
function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export { AppProvider, useApp }
export default AppContext