import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AppButton from '../components/AppButton'
import FormField from '../components/FormField'
import './LoginScreen.css'

function LoginScreen() {
  const navigate = useNavigate()
  const { setUser } = useApp()

  const [email, setEmail] = useState('demo@servicesnap.nz')
  const [password, setPassword] = useState('demo1234')
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

  const handleLogin = (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoggingIn(true)

    // Simulate a brief login delay for realism
    setTimeout(() => {
      setUser({
        name: 'Sam Taylor',
        role: 'Site Manager',
        email: email,
      })
      setIsLoggingIn(false)
      navigate('/dashboard')
    }, 600)
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

        {/* Demo mode badge */}
        <div className="demo-badge">
          <span className="demo-badge-icon">🧪</span>
          <span>Demo Mode — Pre-filled credentials</span>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="your@email.com"
          />

          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Enter your password"
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
          This is a simulated demo login. No real credentials are collected
          or stored. The pre-filled details let you explore the app.
        </p>
      </div>
    </div>
  )
}

export default LoginScreen