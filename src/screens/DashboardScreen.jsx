import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AppButton from '../components/AppButton'
import ServiceCard from '../components/ServiceCard'
import './DashboardScreen.css'

function DashboardScreen() {
  const navigate = useNavigate()
  const { user, services, sites, logoutUser } = useApp()

  // Compute quick stats
  const upcomingCount = services.filter((s) => s.status === 'upcoming').length
  const completedCount = services.filter((s) => s.status === 'completed').length
  const reportedCount = services.filter((s) => s.status === 'reported').length

  // Get the 3 most recent upcoming services for preview
  const upcomingPreview = services
    .filter((s) => s.status === 'upcoming')
    .slice(0, 3)

  return (
    <div className="dashboard-screen">
      {/* Header with greeting */}
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <h1>Welcome back, {user?.name || 'Manager'} 👋</h1>
          <p>{user?.role || 'Site Manager'}</p>
        </div>
        <button
          className="logout-btn"
          onClick={() => { logoutUser(); navigate('/'); }}
        >
          Sign Out
        </button>
      </div>

      {/* Quick Stats */}
      <div className="stats-row">
        <div className="stat-card stat-upcoming">
          <span className="stat-number">{upcomingCount}</span>
          <span className="stat-label">Upcoming</span>
        </div>
        <div className="stat-card stat-completed">
          <span className="stat-number">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card stat-reported">
          <span className="stat-number">{reportedCount}</span>
          <span className="stat-label">Reported</span>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <button
            className="action-card"
            onClick={() => navigate('/upcoming-services')}
          >
            <span className="action-icon">📅</span>
            <div>
              <h3>Upcoming Services</h3>
              <p>{upcomingCount} scheduled visits</p>
            </div>
          </button>

          <button
            className="action-card"
            onClick={() => navigate('/site-details')}
          >
            <span className="action-icon">🏢</span>
            <div>
              <h3>Site Details</h3>
              <p>{sites.length} site{sites.length !== 1 ? 's' : ''} registered</p>
            </div>
          </button>

          <button
            className="action-card"
            onClick={() => navigate('/add-service')}
          >
            <span className="action-icon">➕</span>
            <div>
              <h3>Add Service</h3>
              <p>Schedule a new visit</p>
            </div>
          </button>

          <button
            className="action-card"
            onClick={() => navigate('/report-issue')}
          >
            <span className="action-icon">⚠️</span>
            <div>
              <h3>Report Issue</h3>
              <p>Flag a missed or failed service</p>
            </div>
          </button>
        </div>
      </div>

      {/* Upcoming Preview — demonstrates parent-to-child props */}
      {upcomingPreview.length > 0 && (
        <div className="dashboard-upcoming">
          <div className="section-header">
            <h2>Next Up</h2>
            <button
              className="see-all-link"
              onClick={() => navigate('/upcoming-services')}
            >
              See all →
            </button>
          </div>
          <div className="upcoming-list">
            {/* 
              PARENT-TO-CHILD PROPS EXAMPLE:
              DashboardScreen (parent) passes each service object
              down to ServiceCard (child) via the "service" prop.
              ServiceCard receives the data and renders it.
            */}
            {upcomingPreview.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onPress={() => navigate(`/service/${svc.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardScreen