import { useNavigate, useLocation } from 'react-router-dom'
import AppButton from '../components/AppButton'
import './SuccessScreen.css'

function SuccessScreen() {
  const navigate = useNavigate()
  const location = useLocation()

  // Get dynamic content from navigation state
  const state = location.state || {}
  const title = state.title || 'Success!'
  const message = state.message || 'Your action has been completed successfully.'
  const action = state.action || 'generic'
  const refNumber = state.refNumber || null

  // Choose icon based on action type
  const icons = {
    report: '✅',
    site: '🏢',
    service: '📅',
    generic: '✅',
  }
  const icon = icons[action] || icons.generic

  return (
    <div className="success-screen">
      <div className="success-content">
        <div className="success-icon-circle">
          <span className="success-icon">{icon}</span>
        </div>

        <h1>{title}</h1>
        <p className="success-message">{message}</p>

        {refNumber && (
          <div className="success-ref">
            <span className="ref-label">Reference Number</span>
            <span className="ref-value">{refNumber}</span>
          </div>
        )}

        {/* Summary card */}
        <div className="success-summary">
          <p className="summary-note">
            ℹ️ Your data is saved securely and will be available each time you sign in.
          </p>
        </div>
      </div>

      <div className="success-actions">
        <AppButton
          label="Back to Dashboard"
          variant="primary"
          onClick={() => navigate('/dashboard')}
          fullWidth
        />
      </div>
    </div>
  )
}

export default SuccessScreen