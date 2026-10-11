import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { sampleServices, sampleSites } from '../data/sampleData'

// Create the context
const AppContext = createContext(null)

/**
 * AppProvider — Wraps the app and provides shared state to all screens.
 * Manages: user, services, sites, issues.
 * All data is temporary (React state) — resets on page refresh.
 */
function AppProvider({ children, toasterRef }) {
  const [user, setUser] = useState(null)
  const [services, setServices] = useState(sampleServices)
  const [sites, setSites] = useState(sampleSites)
  const [issues, setIssues] = useState([])

  // Add a new service to the list
  const addService = useCallback((newService) => {
    setServices((prev) => [newService, ...prev])
  }, [])

  // Add a new site to the list
  const addSite = useCallback((newSite) => {
    setSites((prev) => [...prev, newSite])
  }, [])

  // Add a new issue report
  const addIssue = useCallback((newIssue) => {
    setIssues((prev) => [...prev, newIssue])

    // Also update the related service's status to 'reported'
    if (newIssue.serviceId) {
      setServices((prev) =>
        prev.map((svc) =>
          svc.id === newIssue.serviceId
            ? { ...svc, status: 'reported' }
            : svc
        )
      )
    }
  }, [])

  // Show an animated toast notification via the Toaster ref
  const showToast = useCallback((props) => {
    toasterRef?.current?.show(props)
  }, [toasterRef])

  const value = useMemo(() => ({
    user,
    setUser,
    services,
    addService,
    sites,
    addSite,
    issues,
    addIssue,
    showToast,
  }), [user, services, sites, issues, addService, addSite, addIssue, showToast])

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