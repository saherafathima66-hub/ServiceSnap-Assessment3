import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AppButton from '../components/AppButton'
import FormField from '../components/FormField'
import './ReportIssueScreen.css'

function ReportIssueScreen() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { services, addIssue, showToast } = useApp()

  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || '')
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const upcomingServices = services.filter((s) => s.status === 'upcoming')

  const issueTypes = [
    'Service not completed',
    'Partially completed',
    'Poor quality work',
    'Provider did not arrive',
    'Wrong service performed',
    'Other',
  ]

  const validate = () => {
    const newErrors = {}

    if (!selectedServiceId) {
      newErrors.service = 'Please select a service'
    }

    if (!issueType) {
      newErrors.issueType = 'Please select an issue type'
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe the issue'
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    // Commit the issue report to context immediately so the service
    // status update ('reported') is guaranteed to be visible on every
    // screen that reads the services list.
    addIssue({
      serviceId: parseInt(selectedServiceId),
      issueType,
      description: description.trim(),
      photoName: photoName || null,
      reportedAt: new Date().toISOString(),
    })

    const refNumber = 'ISS-' + Date.now().toString().slice(-6)

    showToast({
      title: 'Issue Reported',
      message: `Reference ${refNumber} — we will review shortly.`,
      variant: 'success',
      duration: 3000,
    })

    // Short delay only for the visual "Submitting…" feedback before navigating.
    setTimeout(() => {
      navigate('/success', {
        state: {
          title: 'Issue Reported',
          message: 'Your issue has been recorded. The team will review it shortly.',
          action: 'report',
          refNumber,
        },
      })
    }, 500)
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoName(file.name)
    }
  }

  return (
    <div className="report-screen">
      {/* Header */}
      <div className="report-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Report an Issue</h1>
        <p>Flag a missed or problematic service visit</p>
      </div>

      {/* Form */}
      <form className="report-form" onSubmit={handleSubmit}>
        {/* Service selector */}
        <div className="form-field-wrapper">
          <label className="form-label">Service</label>
          <select
            className={`form-select ${errors.service ? 'form-select-error' : ''}`}
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">— Select a service —</option>
            {upcomingServices.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.title} — {svc.site} ({svc.date})
              </option>
            ))}
          </select>
          {errors.service && (
            <span className="field-error">{errors.service}</span>
          )}
        </div>

        {/* Issue type */}
        <div className="form-field-wrapper">
          <label className="form-label">Issue Type</label>
          <select
            className={`form-select ${errors.issueType ? 'form-select-error' : ''}`}
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <option value="">— Select issue type —</option>
            {issueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.issueType && (
            <span className="field-error">{errors.issueType}</span>
          )}
        </div>

        {/* Description */}
        <FormField
          label="Description"
          type="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          placeholder="Describe the issue in detail (minimum 10 characters)…"
        />

        {/* Optional photo */}
        <div className="form-field-wrapper">
          <label className="form-label">
            Photo <span className="optional-tag">(optional)</span>
          </label>
          <div className="photo-upload-area">
            <input
              type="file"
              accept="image/*"
              id="photo-input"
              className="photo-input-hidden"
              onChange={handlePhotoSelect}
            />
            <label htmlFor="photo-input" className="photo-upload-label">
              {photoName ? (
                <span className="photo-selected">📎 {photoName}</span>
              ) : (
                <span>📷 Tap to add a photo</span>
              )}
            </label>
          </div>
          <span className="field-hint">
            Photo is optional. No image is uploaded in this demo.
          </span>
        </div>

        {/* Submit */}
        <div className="report-actions">
          <AppButton
            label={isSubmitting ? 'Submitting…' : 'Submit Report'}
            variant="danger"
            type="submit"
            fullWidth
            disabled={isSubmitting}
          />
          <AppButton
            label="Cancel"
            variant="secondary"
            onClick={() => navigate(-1)}
            fullWidth
          />
        </div>
      </form>
    </div>
  )
}

export default ReportIssueScreen