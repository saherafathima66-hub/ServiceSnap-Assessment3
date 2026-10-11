import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AppButton from '../components/AppButton'
import StatusBadge from '../components/StatusBadge'
import './ServiceDetailsScreen.css'

function ServiceDetailsScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { services } = useApp()

  const service = services.find((s) => s.id === parseInt(id))

  if (!service) {
    return (
      <div className="details-screen">
        <div className="details-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
        <div className="details-not-found">
          <span className="not-found-icon">🔍</span>
          <h2>Service not found</h2>
          <p>This service could not be located. It may have been removed.</p>
          <AppButton
            label="Back to Dashboard"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          />
        </div>
      </div>
    )
  }

  // Format date nicely
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-NZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="details-screen">
      {/* Header */}
      <div className="details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Service info card */}
      <div className="details-card">
        <div className="details-card-top">
          <h1>{service.title}</h1>
          <StatusBadge status={service.status} />
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Provider</span>
            <span className="detail-value">{service.provider}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Site</span>
            <span className="detail-value">{service.site}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date</span>
            <span className="detail-value">{formatDate(service.date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Time</span>
            <span className="detail-value">{service.time}</span>
          </div>
        </div>

        {service.notes && (
          <div className="detail-notes">
            <span className="detail-label">Notes</span>
            <p>{service.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="details-actions">
        {service.status === 'upcoming' && (
          <AppButton
            label="⚠️ Report an Issue"
            variant="danger"
            onClick={() => navigate(`/report-issue/${service.id}`)}
            fullWidth
          />
        )}
        <AppButton
          label="← Back to Services"
          variant="secondary"
          onClick={() => navigate('/upcoming-services')}
          fullWidth
        />
      </div>
    </div>
  )
}

export default ServiceDetailsScreen