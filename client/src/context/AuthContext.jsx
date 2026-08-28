import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as setFirebaseProfile,
} from 'firebase/auth'
import { auth } from '../utils/firebase'
import api from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  // Favorite project ids live here (not in each page) so the heart shows the
  // same state on the feed, the detail page and the favorites page.
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        try {
          const res = await api.get('/users/me')
          setDbUser(res.data)
          setFavorites((res.data.favorites || []).map(String))
        } catch {
          setDbUser(null)
          setFavorites([])
        }
      } else {
        setDbUser(null)
        setFavorites([])
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const isFavorited = useCallback((id) => favorites.includes(String(id)), [favorites])

  const toggleFavorite = useCallback(async (id) => {
    const key = String(id)
    // Optimistic flip so the heart fills instantly, rolled back if the call fails.
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    )
    try {
      const res = await api.post(`/users/me/favorites/${key}`)
      setFavorites((res.data.favorites || []).map(String))
    } catch (err) {
      setFavorites((prev) =>
        prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
      )
      throw err
    }
  }, [])

  // Returns the updated user so callers can surface server-side validation errors.
  const updateProfile = useCallback(async (updates) => {
    const res = await api.patch('/users/me', updates)
    setDbUser(res.data)
    return res.data
  }, [])

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await setFirebaseProfile(cred.user, { displayName })
      // Refresh so the ID token carries the new `name` claim — requireAuth reads
      // it when lazily creating the Mongo user.
      await cred.user.getIdToken(true)
      // The auth listener may already have created that doc from the pre-refresh
      // token (where displayName falls back to the email), so set it explicitly.
      const res = await api.patch('/users/me', { displayName })
      setDbUser(res.data)
    }
    return cred
  }

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  const value = {
    currentUser,
    dbUser,
    favorites,
    isFavorited,
    toggleFavorite,
    updateProfile,
    signup,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
