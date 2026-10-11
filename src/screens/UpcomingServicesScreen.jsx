import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ServiceCard from '../components/ServiceCard'
import './UpcomingServicesScreen.css'

function UpcomingServicesScreen() {
  const navigate = useNavigate()
  const { services } = useApp()
  const [activeFilter, setActiveFilter] = useState('upcoming')

  const filters = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'reported', label: 'Reported' },
    { key: 'all', label: 'All' },
  ]

  const filteredServices =
    activeFilter === 'all'
      ? services
      : services.filter((s) => s.status === activeFilter)

  return (
    <div className="upcoming-screen">
      {/* Header */}
      <div className="upcoming-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1>Services</h1>
        <p>{filteredServices.length} {activeFilter === 'all' ? 'total' : activeFilter} service{filteredServices.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-tab ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Service list */}
      <div className="services-list">
        {filteredServices.length > 0 ? (
          filteredServices.map((svc) => (
            <ServiceCard
              key={svc.id}
              service={svc}
              onPress={() => navigate(`/service/${svc.id}`)}
            />
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No services found</h3>
            <p>There are no {activeFilter} services at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UpcomingServicesScreen