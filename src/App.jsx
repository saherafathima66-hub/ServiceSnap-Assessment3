import { useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Toaster from './components/Toast'
import WelcomeScreen from './screens/WelcomeScreen'
import LoginScreen from './screens/LoginScreen'
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

            {/* App routes */}
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/upcoming-services" element={<UpcomingServicesScreen />} />
            <Route path="/service/:id" element={<ServiceDetailsScreen />} />
            <Route path="/report-issue" element={<ReportIssueScreen />} />
            <Route path="/report-issue/:serviceId" element={<ReportIssueScreen />} />
            <Route path="/success" element={<SuccessScreen />} />
            <Route path="/site-details" element={<SiteDetailsScreen />} />
            <Route path="/add-service" element={<AddServiceScreen />} />

            {/* Catch-all redirects to welcome */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
