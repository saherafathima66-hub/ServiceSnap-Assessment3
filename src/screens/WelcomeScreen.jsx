import { useNavigate } from 'react-router-dom'
import AppButton from '../components/AppButton'
import './WelcomeScreen.css'

function WelcomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        {/* Logo / Brand Mark */}
        <div className="welcome-logo">
          <div className="logo-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="16" fill="#1B2A4A" />
              <path d="M20 44V20h8l8 12 8-12h0v24" stroke="#2EC4B6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="32" cy="28" r="4" fill="#2EC4B6" />
            </svg>
          </div>
          <h1 className="welcome-title">ServiceSnap</h1>
          <p className="welcome-tagline">
            Simple service management for site managers
          </p>
        </div>

        {/* Feature highlights */}
        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <span>Track upcoming services</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔍</span>
            <span>View service details</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚠️</span>
            <span>Report issues instantly</span>
          </div>
        </div>
      </div>

      {/* Bottom action area */}
      <div className="welcome-actions">
        <AppButton
          label="Get Started"
          variant="primary"
          onClick={() => navigate('/login')}
          fullWidth
        />
        <p className="welcome-demo-note">
          Simple service management for site managers.
        </p>
      </div>
    </div>
  )
}

export default WelcomeScreen