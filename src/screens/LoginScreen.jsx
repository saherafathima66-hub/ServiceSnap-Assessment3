import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AppButton from '../components/AppButton'
import FormField from '../components/FormField'
import './LoginScreen.css'

function LoginScreen() {
  const navigate = useNavigate()
  const { loginUser } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const validate = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoggingIn(true)

    try {
      await loginUser(email, password)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ general: err.message || 'Login failed. Please try again.' })
    } finally {
      setIsLoggingIn(false)
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
          <p>Sign in to manage your services</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {errors.general && (
            <div className="login-general-error">{errors.general}</div>
          )}

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
            placeholder="Enter your password"
            required
          />

          <AppButton
            label={isLoggingIn ? 'Signing in…' : 'Sign In'}
            variant="primary"
            type="submit"
            fullWidth
            disabled={isLoggingIn}
          />
        </form>

        <p className="login-note">
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginScreen