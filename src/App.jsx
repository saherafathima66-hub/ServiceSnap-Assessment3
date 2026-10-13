import { useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Toaster from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import DashboardScreen from './screens/DashboardScreen'
import UpcomingServicesScreen from './screens/UpcomingServicesScreen'
import ServiceDetailsScreen from './screens/ServiceDetailsScreen'
import ReportIssueScreen from './screens/ReportIssueScreen'
import SuccessScreen from './screens/SuccessScreen'
import SiteDetailsScreen from './screens/SiteDetailsScreen'
import AddServiceScreen from './screens/AddServiceScreen'

function App() {
  const toasterRef = useRef(null)

  return (
    <AppProvider toasterRef={toasterRef}>
      <BrowserRouter>
        <Toaster ref={toasterRef} />
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />

            {/* Protected routes (require login) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
            <Route path="/upcoming-services" element={<ProtectedRoute><UpcomingServicesScreen /></ProtectedRoute>} />
            <Route path="/service/:id" element={<ProtectedRoute><ServiceDetailsScreen /></ProtectedRoute>} />
            <Route path="/report-issue" element={<ProtectedRoute><ReportIssueScreen /></ProtectedRoute>} />
            <Route path="/report-issue/:serviceId" element={<ProtectedRoute><ReportIssueScreen /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><SuccessScreen /></ProtectedRoute>} />
            <Route path="/site-details" element={<ProtectedRoute><SiteDetailsScreen /></ProtectedRoute>} />
            <Route path="/add-service" element={<ProtectedRoute><AddServiceScreen /></ProtectedRoute>} />

            {/* Catch-all redirects to welcome */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
