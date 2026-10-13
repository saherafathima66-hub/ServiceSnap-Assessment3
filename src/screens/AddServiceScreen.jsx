
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
  const [submitError, setSubmitError] = useState('')

  // Available service types
  const serviceTypes = [
    'Sanitary Bin Collection',
    'Office Cleaning',
    'Waste Collection',
    'Air Freshener Servicing',
    'Other',
  ]

  // Validate all required fields
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
      const selectedDate = new Date(`${date}T00:00:00`)
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

  // Save the new service through the Python backend
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting || !validate()) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Send the database site ID, not the site name
      await addService({
        title: serviceType,
        provider: provider.trim(),
        site_id: Number(siteId),
        date: date,
        time: time,
        notes: notes.trim() || null,
      })

      // Only show success after the API request succeeds
      showToast({
        title: 'Service Scheduled',
        message: `${serviceType} on ${date} at ${time}.`,
        variant: 'success',
        duration: 3000,
      })

      // Navigate to the existing success screen
      navigate('/success', {
        state: {
          title: 'Service Scheduled',
          message: `"${serviceType}" has been scheduled for ${date} at ${time}.`,
          action: 'service',
        },
      })

    } catch (err) {
      // Do not show success if the database save fails
      console.error('Failed to schedule service:', err)

      const errorMessage =
        err.message ||
        'Service could not be saved. Please try again.'

      setSubmitError(errorMessage)

      showToast({
        title: 'Service Not Saved',
        message: errorMessage,
        variant: 'error',
        duration: 5000,
      })

    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-service-screen">

      {/* Header */}
      <div className="add-service-header">
        <button
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          ← Back
        </button>

        <h1>Add New Service</h1>

        <p>Schedule a new service visit for a site</p>
      </div>

      {/* Add Service Form */}
      <form
        className="add-service-form"
        onSubmit={handleSubmit}
      >

        {/* Service Type */}
        <div className="form-field-wrapper">
          <label className="form-label">
            Service Type
          </label>

          <select
            className={`form-select ${errors.serviceType ? 'form-select-error' : ''
              }`}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
          >
            <option value="">
              — Select service type —
            </option>

            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {errors.serviceType && (
            <span className="field-error">
              {errors.serviceType}
            </span>
          )}
        </div>

        {/* Service Provider */}
        <FormField
          label="Service Provider"
          type="text"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          error={errors.provider}
          placeholder="e.g. CleanCare Services"
        />

        {/* Select a site from Supabase data */}
        <div className="form-field-wrapper">
          <label className="form-label">
            Site
          </label>

          <select
            className={`form-select ${errors.siteId ? 'form-select-error' : ''
              }`}
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
          >
            <option value="">
              — Select a site —
            </option>

            {sites.map((site) => (
              <option
                key={site.id}
                value={site.id}
              >
                {site.name}
              </option>
            ))}
          </select>

          {errors.siteId && (
            <span className="field-error">
              {errors.siteId}
            </span>
          )}

          {sites.length === 0 && (
            <span className="field-hint">
              No sites found. Add a site first via the Dashboard.
            </span>
          )}
        </div>

        {/* Date and Time */}
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

        {/* Notes */}
        <FormField
          label="Notes"
          type="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          error={null}
          placeholder="Any special instructions (optional)…"
        />

        {/* Show saving errors clearly */}
        {submitError && (
          <div
            className="field-error"
            role="alert"
          >
            {submitError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="add-service-actions">
          <AppButton
            label={
              isSubmitting
                ? 'Scheduling…'
                : 'Schedule Service'
            }
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
