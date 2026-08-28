import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthCard, { authButtonClass } from '../components/AuthCard'
import AuthField from '../components/AuthField'
import {
  PASSWORD_MIN,
  firebaseAuthMessage,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from '../utils/validation'

const EMPTY = { name: '', email: '', password: '', confirmPassword: '' }

const Signup = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateField = (field, values = form) => {
    switch (field) {
      case 'name':
        return validateName(values.name)
      case 'email':
        return validateEmail(values.email)
      case 'password':
        return validatePassword(values.password)
      case 'confirmPassword':
        return validateConfirmPassword(values.password, values.confirmPassword)
      default:
        return ''
    }
  }

  const handleChange = (field) => (e) => {
    const next = { ...form, [field]: e.target.value }
    setForm(next)
    // Only re-validate fields the user has already left, so errors don't
    // appear while they're still typing the value for the first time.
    setErrors((prev) => {
      const updated = { ...prev }
      if (touched[field]) updated[field] = validateField(field, next)
      // Confirm depends on password, so keep the two in step.
      if (field === 'password' && touched.confirmPassword) {
        updated.confirmPassword = validateConfirmPassword(next.password, next.confirmPassword)
      }
      return updated
    })
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
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await signup(form.email.trim(), form.password, form.name.trim())
      navigate('/')
    } catch (err) {
      setFormError(firebaseAuthMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Share what you're building with your peers."
      error={formError}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          id="name"
          label="Name"
          placeholder="Alice Chen"
          autoComplete="name"
          maxLength={40}
          value={form.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          error={errors.name}
        />
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
          autoComplete="new-password"
          hint={`min ${PASSWORD_MIN} characters`}
          value={form.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
          error={errors.password}
        />
        <AuthField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          error={errors.confirmPassword}
        />
        <button type="submit" disabled={submitting} className={authButtonClass}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </AuthCard>
  )
}

export default Signup
