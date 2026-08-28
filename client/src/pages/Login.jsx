import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthCard, { authButtonClass } from '../components/AuthCard'
import AuthField from '../components/AuthField'
import { PASSWORD_MIN, firebaseAuthMessage, validateEmail } from '../utils/validation'

const EMPTY = { email: '', password: '' }

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Login checks format only — no composition rules. An account created before
  // any rule change must still be able to sign in.
  const validateField = (field, values = form) => {
    if (field === 'email') return validateEmail(values.email)
    if (field === 'password') {
      if (!values.password) return 'Password is required'
      if (values.password.length < PASSWORD_MIN)
        return `Password must be at least ${PASSWORD_MIN} characters`
    }
    return ''
  }

  const handleChange = (field) => (e) => {
    const next = { ...form, [field]: e.target.value }
    setForm(next)
    setErrors((prev) => (touched[field] ? { ...prev, [field]: validateField(field, next) } : prev))
  }

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    for (const field of Object.keys(EMPTY)) {
      const message = validateField(field)
      if (message) found[field] = message
    }
    setTouched({ email: true, password: true })
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/')
    } catch (err) {
      setFormError(firebaseAuthMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to post projects and save favorites."
      error={formError}
      footer={
        <>
          No account?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          error={errors.email}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
          error={errors.password}
        />
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthCard>
  )
}

export default Login
