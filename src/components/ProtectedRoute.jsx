import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

/**
 * ProtectedRoute — Wraps routes that require authentication.
 * Redirects to /login if no user is logged in.
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
 */
function ProtectedRoute({ children }) {
  const { user, isLoading } = useApp()

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '50dvh', color: '#6B7280', fontSize: '0.875rem',
      }}>
        Loading…
      </div>
    )
  }

  // Not logged in — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute