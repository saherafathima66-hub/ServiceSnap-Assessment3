import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../services/supabase'
import AppButton from '../components/AppButton'
import FormField from '../components/FormField'
import './LoginScreen.css'

function SignupScreen() {
  const navigate = useNavigate()
  const { signupUser } = useApp()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')

  const validate = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      const result = await signupUser(email, password, name.trim(), 'Site Manager')

      if (result.needsEmailConfirmation) {
        setConfirmationEmail(email)
        setSuccessMessage('Account created! Check your email to confirm your account, then sign in.')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setErrors({ general: err.message || 'Signup failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!confirmationEmail || !supabase) return

    setIsResending(true)
    setResendMessage('')
    setResendError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: confirmationEmail,
      })
      if (error) throw error
      setResendMessage('Confirmation email sent! Check your inbox.')
    } catch (err) {
      setResendError(err.message || 'Could not resend email. Please try again later.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>

      <div className="login-content">
        <div className="login-brand">
          <h1>ServiceSnap</h1>
          <p>Create your account</p>
        </div>

        <form className="login-form" onSubmit={handleSignup}>
          {errors.general && (
            <div className="login-general-error">{errors.general}</div>
          )}
          {successMessage && (
            <div className="signup-success">
              {successMessage}
            </div>
          )}

          {/* Show form only before successful signup */}
          {!confirmationEmail && (
            <>
              <FormField
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                placeholder="Your full name"
                required
              />

              <FormField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="your@email.com"
                required
              />

              <FormField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="At least 6 characters"
                required
              />

              <AppButton
                label={isSubmitting ? 'Creating account…' : 'Create Account'}
                variant="primary"
                type="submit"
                fullWidth
                disabled={isSubmitting}
              />
            </>
          )}
        </form>

        {/* Resend confirmation email section */}
        {confirmationEmail && (
          <div className="resend-section">
            <p className="resend-hint">
              Didn't receive the email? Check your spam folder or resend it.
            </p>
            <AppButton
              label={isResending ? 'Sending…' : 'Resend Confirmation Email'}
              variant="secondary"
              onClick={handleResend}
              fullWidth
              disabled={isResending}
            />
            {resendMessage && (
              <div className="signup-success" style={{ marginTop: 'var(--space-sm)' }}>
                {resendMessage}
              </div>
            )}
            {resendError && (
              <div className="login-general-error" style={{ marginTop: 'var(--space-sm)' }}>
                {resendError}
              </div>
            )}
          </div>
        )}

        <p className="login-note">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignupScreen