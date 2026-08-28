// Shared by the login and signup forms so both agree on what's valid.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

// Starts with a letter, then letters/digits/space/. _ ' - ; 2-40 chars total.
// The 40 cap matches the server's own limit in userController.updateMe.
export const NAME_REGEX = /^[A-Za-z][A-Za-z0-9 ._'-]{1,39}$/

export const PASSWORD_MIN = 6
export const PASSWORD_REGEX = new RegExp(`^.{${PASSWORD_MIN},}$`)

export const validateEmail = (value) => {
  const v = value.trim()
  if (!v) return 'Email is required'
  if (!EMAIL_REGEX.test(v)) return 'Enter a valid email address (e.g. you@example.com)'
  return ''
}

export const validateName = (value) => {
  const v = value.trim()
  if (!v) return 'Name is required'
  if (v.length < 2) return 'Name must be at least 2 characters'
  if (v.length > 40) return 'Name must be 40 characters or fewer'
  if (!NAME_REGEX.test(v))
    return "Name must start with a letter and use only letters, numbers, spaces or . _ ' -"
  return ''
}

/**
 * Signup only. Login deliberately does NOT apply this — accounts created before
 * any rule change must still be able to sign in.
 */
export const validatePassword = (value) => {
  if (!value) return 'Password is required'
  if (!PASSWORD_REGEX.test(value)) return `Password must be at least ${PASSWORD_MIN} characters`
  return ''
}

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return 'Please confirm your password'
  if (password !== confirm) return 'Passwords do not match'
  return ''
}

/** Turns Firebase's raw auth/* codes into something a person can act on. */
export const firebaseAuthMessage = (err) => {
  switch (err?.code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try logging in instead.'
    case 'auth/invalid-email':
      return 'That email address is not valid.'
    case 'auth/weak-password':
      return `Password must be at least ${PASSWORD_MIN} characters.`
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error — check your connection and try again.'
    default:
      return err?.message || 'Something went wrong. Please try again.'
  }
}
