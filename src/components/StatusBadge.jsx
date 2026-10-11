import './StatusBadge.css'

/**
 * StatusBadge — Small colour-coded label for service status.
 *
 * @param {string} status - 'upcoming' | 'completed' | 'reported'
 */
function StatusBadge({ status }) {
  const config = {
    upcoming: { label: 'Upcoming', className: 'status-badge--upcoming' },
    completed: { label: 'Completed', className: 'status-badge--completed' },
    reported: { label: 'Reported', className: 'status-badge--reported' },
  }

  const { label, className } = config[status] || { label: status, className: '' }

  return (
    <span className={`status-badge ${className}`}>
      {label}
    </span>
  )
}

export default StatusBadge