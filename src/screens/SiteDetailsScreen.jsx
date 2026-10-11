import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AppButton from '../components/AppButton'
import FormField from '../components/FormField'
import './SiteDetailsScreen.css'

function SiteDetailsScreen() {
  const navigate = useNavigate()
  const { addSite, sites } = useApp()

  const [siteName, setSiteName] = useState('')
  const [address, setAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}

    if (!siteName.trim()) {
      newErrors.siteName = 'Site name is required'
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!contactName.trim()) {
      newErrors.contactName = 'Contact name is required'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s\-+()]{7,}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    setTimeout(() => {
      addSite({
        id: Date.now(),
        name: siteName.trim(),
        address: address.trim(),
        contact: contactName.trim(),
        phone: phone.trim(),
        notes: notes.trim() || null,
      })

      setIsSubmitting(false)
      navigate('/success', {
        state: {
          title: 'Site Added',
          message: `"${siteName}" has been added to your sites.`,
          action: 'site',
        },
      })
    }, 500)
  }

  return (
    <div className="site-screen">
      {/* Header */}
      <div className="site-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <h1>Add Site Details</h1>
        <p>Register a new site for service management</p>
      </div>

      {/* Existing sites summary */}
      {sites.length > 0 && (
        <div className="existing-sites">
          <h3>Registered Sites ({sites.length})</h3>
          <div className="existing-sites-list">
            {sites.map((site) => (
              <div key={site.id} className="existing-site-chip">
                🏢 {site.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form className="site-form" onSubmit={handleSubmit}>
        <FormField
          label="Site Name"
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          error={errors.siteName}
          placeholder="e.g. Melbourne Office Tower"
        />

        <FormField
          label="Address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={errors.address}
          placeholder="e.g. 120 Collins St, Melbourne"
        />

        <FormField
          label="Contact Name"
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          error={errors.contactName}
          placeholder="e.g. Jane Manager"
        />

        <FormField
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="e.g. 021-555-0101"
        />

        <FormField
          label="Notes"
          type="textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          error={null}
          placeholder="Any additional notes about this site (optional)…"
        />

        <div className="site-actions">
          <AppButton
            label={isSubmitting ? 'Saving…' : 'Save Site Details'}
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

export default SiteDetailsScreen