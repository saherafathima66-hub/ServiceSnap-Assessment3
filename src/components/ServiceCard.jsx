import StatusBadge from './StatusBadge'
import './ServiceCard.css'

/**
 * ServiceCard — Displays a summary of a service visit in a card format.
 * Used on Dashboard (preview) and Upcoming Services (full list).
 *
 * PARENT-TO-CHILD PROPS PATTERN:
 * This component receives a `service` object from its parent screen.
 * It does not know or care where the data came from — it simply
 * renders what it receives via props.
 *
 * @param {object}   service - Service data object { id, title, provider, site, date, time, status, notes }
 * @param {function} onPress - Callback when card is tapped/clicked
 */
function ServiceCard({ service, onPress }) {
  // Format date to short readable form
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-NZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <button className="service-card" onClick={onPress} type="button">
      <div className="service-card__top">
        <h3 className="service-card__title">{service.title}</h3>
        <StatusBadge status={service.status} />
      </div>

      <div className="service-card__details">
        <div className="service-card__row">
          <span className="service-card__icon">🏢</span>
          <span className="service-card__text">{service.site}</span>
        </div>
        <div className="service-card__row">
          <span className="service-card__icon">🔧</span>
          <span className="service-card__text">{service.provider}</span>
        </div>
        <div className="service-card__row">
          <span className="service-card__icon">📅</span>
          <span className="service-card__text">
            {formatDate(service.date)} at {service.time}
          </span>
        </div>
      </div>

      <div className="service-card__footer">
        <span className="service-card__cta">View details →</span>
      </div>
    </button>
  )
}

export default ServiceCard