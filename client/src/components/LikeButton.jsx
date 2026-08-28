import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

/**
 * Like toggle with a running count. A like is membership in the project's
 * `likes` array, so one account can only ever count once — the server uses
 * $addToSet/$pull to keep that true.
 */
const LikeButton = ({ projectId, likes = [], onChange, size = 'sm' }) => {
  const { currentUser, dbUser } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [bump, setBump] = useState(false)

  const liked = Boolean(dbUser && likes.some((id) => String(id) === String(dbUser._id)))
  const count = likes.length

  const handleClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!currentUser) return navigate('/login')
    // Signed in but the Mongo profile hasn't loaded (or failed) — nothing to
    // attribute the like to, so don't guess at an optimistic count.
    if (!dbUser || busy) return
    setBusy(true)
    if (!liked) setBump(true)

    const previous = likes
    const optimistic = liked
      ? likes.filter((id) => String(id) !== String(dbUser._id))
      : [...likes, dbUser._id]
    onChange?.(optimistic)

    try {
      const res = await api.post(`/projects/${projectId}/like`)
      onChange?.(res.data.likes)
    } catch {
      onChange?.(previous)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? 'Remove like' : 'Like this project'}
      title={liked ? 'Remove like' : 'Like this project'}
      className={`group/like inline-flex items-center gap-1.5 rounded-full border font-medium transition active:scale-95 ${
        size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
      } ${
        liked
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        onAnimationEnd={() => setBump(false)}
        className={`${size === 'md' ? 'size-5' : 'size-4'} shrink-0 ${
          liked ? 'fill-indigo-500 text-indigo-500' : 'fill-none text-current'
        } ${bump ? 'animate-pop' : ''}`}
        aria-hidden="true"
      >
        <path
          d="M7 22V10.5L12.2 2.5a.9.9 0 0 1 1.6.4l.5 4a2 2 0 0 0 2 1.75h2.9a2 2 0 0 1 1.96 2.4l-1.5 8A2 2 0 0 1 17.7 22Zm0 0H3.5a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5H7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      <span className="tabular-nums">{count}</span>
    </button>
  )
}

export default LikeButton
