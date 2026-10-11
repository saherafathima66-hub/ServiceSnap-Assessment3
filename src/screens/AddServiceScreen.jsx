import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AppButton from '../components/AppButton'
import FormField from '../components/FormField'
import './AddServiceScreen.css'

function AddServiceScreen() {
  const navigate = useNavigate()
  const { sites, addService, showToast } = useApp()

  const [serviceType, setServiceType] = useState('')
  const [provider, setProvider] = useState('')
  const [siteId, setSiteId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const serviceTypes = [
    'Sanitary Bin Collection',
    'Office Cleaning',
    'Waste Collection',
    'Air Freshener Servicing',
    'Other',
  ]

  const validate = () => {
    const newErrors = {}

    if (!serviceType) {
      newErrors.serviceType = 'Service type is required'
    }

    if (!provider.trim()) {
      newErrors.provider = 'Service provider is required'
    }

    if (!siteId) {
      newErrors.siteId = 'Please select a site'
    }

    if (!date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.date = 'Date must be today or in the future'
      }
    }

    if (!time) {
      newErrors.time = 'Time is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    // Commit the new service to context immediately so the state is
    // guaranteed to be up-to-date on every screen that reads it.
    const selectedSite = sites.find((s) => s.id === parseInt(siteId))

    addService({
      id: Date.now(),
      title: serviceType,
      provider: provider.trim(),
      site: selectedSite?.name || 'Unknown Site',
      date,
      time,
      status: 'upcoming',
      notes: notes.trim() || null,
    })

    showToast({
      title: 'Service Scheduled',
      message: `${serviceType} on ${date} at ${time}.`,
      variant: 'success',
      duration: 3000,
    })

    // Short delay only for the visual "Scheduling…" feedback before navigating.
    setTimeout(() => {
      navigate('/success', {
        state: {
          title: 'Service Scheduled',
          message: `"${serviceType}" has been scheduled for ${date} at ${time}.`,
          action: 'service',
        },
      })
    }, 500)
  }

  return (
    <div className="add-service-screen">
      {/* Header */}
      <div className="add-service-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1>Add New Service</h1>
        <p>Schedule a new service visit for a site</p>
      </div>

      {/* Form */}
      <form className="add-service-form" onSubmit={handleSubmit}>
        {/* Service type dropdown */}
        <div className="form-field-wrapper">
          <label className="form-label">Service Type</label>
          <select
            className={`form-select ${errors.serviceType ? 'form-select-error' : ''}`}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="">— Select service type —</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.serviceType && (
            <span className="field-error">{errors.serviceType}</span>
          )}
        </div>

        <FormField
          label="Service Provider"
          type="text"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          error={errors.provider}
          placeholder="e.g. CleanCare Services"
        />

        {/* Site selector */}
        <div className="form-field-wrapper">
          <label className="form-label">Site</label>
          <select
            className={`form-select ${errors.siteId ? 'form-select-error' : ''}`}
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          >
            <option value="">— Select a site —</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          {errors.siteId && (
            <span className="field-error">{errors.siteId}</span>
          )}
          {sites.length === 0 && (
            <span className="field-hint">
              No sites found. Add a site first via the Dashboard.
            </span>
          )}
        </div>

        <div className="form-row">
          <FormField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
          <FormField
            label="Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            error={errors.time}
          />
        </div>

        <FormField
          label="Notes"
          type="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          error={null}
          placeholder="Any special instructions (optional)…"
        />

        <div className="add-service-actions">
          <AppButton
            label={isSubmitting ? 'Scheduling…' : 'Schedule Service'}
            variant="primary"
            type="submit"
            fullWidth
            disabled={isSubmitting}
          />
          <AppButton
            label="Cancel"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
            fullWidth
          />
        </div>
      </form>
    </div>
  )
}

export default AddServiceScreen