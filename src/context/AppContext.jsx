
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import * as api from '../services/api'
import { supabase } from '../services/supabase'

// Create the context
const AppContext = createContext(null)

/**
 * AppProvider — Shared state for ServiceSnap.
 * Loads data from the Python backend.
 * Does not fall back to sample data.
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

  // Restore Supabase session on refresh
  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const u = session.user
        const userData = {
          id: u.id,
          name: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          role: u.user_metadata?.role || 'Site Manager',
          email: u.email,
        }

        setUser(userData)
        localStorage.setItem('servicesnap_user', JSON.stringify(userData))
        localStorage.setItem('servicesnap_token', session.access_token)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          localStorage.removeItem('servicesnap_user')
          localStorage.removeItem('servicesnap_token')
        } else if (session) {
          localStorage.setItem('servicesnap_token', session.access_token)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load real data from backend
  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setServices([])
        setSites([])
        setIssues([])
        setUseBackend(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const [svcResult, siteResult] = await Promise.all([
          api.getServices(),
          api.getSites(),
        ])

        setServices(svcResult.services)
        setSites(siteResult.sites)
        setUseBackend(true)
      } catch (err) {
        console.error('Failed to fetch data from backend:', err.message)
        setServices([])
        setSites([])
        setUseBackend(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Add service — save to backend
  const addService = useCallback(async (newService) => {
    if (!useBackend) {
      throw new Error(
        'Service was not saved. Please check the backend connection and try again.'
      )
    }

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
  }, [useBackend])

  // Add site — save to backend
  const addSite = useCallback(async (newSite) => {
    if (!useBackend) {
      throw new Error(
        'Site was not saved. Please check the backend connection and try again.'
      )
    }

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
  }, [useBackend])

  // Report issue — save to backend
  const addIssue = useCallback(async (newIssue) => {
    if (!useBackend) {
      throw new Error(
        'Issue was not saved. Please check the backend connection and try again.'
      )
    }

    try {
      await api.createIssue({
        service_id: newIssue.serviceId,
        issue_type: newIssue.issueType,
        description: newIssue.description,
        photo_url: newIssue.photoName,
      })

      // Update local state only after successful API request
      setIssues((prev) => [...prev, newIssue])

      if (newIssue.serviceId) {
        setServices((prev) =>
          prev.map((svc) =>
            svc.id === newIssue.serviceId
              ? { ...svc, status: 'reported' }
              : svc
          )
        )
      }
    } catch (err) {
      console.error('Failed to create issue:', err.message)
      throw err
    }
  }, [useBackend])

  // Login with Supabase
  const loginUser = useCallback(async (email, password) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

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
  }, [])

  // Signup with Supabase
  const signupUser = useCallback(async (email, password, name, role) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })

    if (error) throw error

    const userData = {
      id: data.user.id,
      name: name || email.split('@')[0],
      role: role || 'Site Manager',
      email: data.user.email,
    }

    if (data.session) {
      setUser(userData)
      localStorage.setItem('servicesnap_user', JSON.stringify(userData))
      localStorage.setItem('servicesnap_token', data.session.access_token)
    }

    return {
      user: userData,
      needsEmailConfirmation: !data.session,
    }
  }, [])

  // Logout — clear all state
  const logoutUser = useCallback(() => {
    if (supabase) {
      supabase.auth.signOut()
    }

    setUser(null)
    setServices([])
    setSites([])
    setIssues([])
    setUseBackend(false)

    localStorage.removeItem('servicesnap_user')
    localStorage.removeItem('servicesnap_token')
  }, [])

  // Toast notifications
  const showToast = useCallback((props) => {
    toasterRef?.current?.show(props)
  }, [toasterRef])

  // Shared context values
  const value = useMemo(() => ({
    user,
    setUser,
    loginUser,
    signupUser,
    logoutUser,
    services,
    addService,
    sites,
    addSite,
    issues,
    addIssue,
    showToast,
    isLoading,
    useBackend,
  }), [
    user,
    services,
    sites,
    issues,
    addService,
    addSite,
    addIssue,
    showToast,
    isLoading,
    useBackend,
    loginUser,
    signupUser,
    logoutUser,
  ])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook for accessing shared context
function useApp() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }

  return context
}

export { AppProvider, useApp }
export default AppContext
