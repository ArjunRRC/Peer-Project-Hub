import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SIZES = {
  sm: { box: 'size-9', icon: 'size-5' },
  md: { box: 'size-11', icon: 'size-6' },
}

/**
 * Favorite toggle. Renders a white (outlined) heart, which fills solid red
 * once the project is in the signed-in user's favorites.
 */
const HeartButton = ({ projectId, size = 'sm', withLabel = false }) => {
  const { currentUser, isFavorited, toggleFavorite } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [bump, setBump] = useState(false)

  const favorited = isFavorited(projectId)
  const dims = SIZES[size] || SIZES.sm

  const handleClick = async (e) => {
    // Cards wrap the whole surface in a link — don't navigate on a heart click.
    e.preventDefault()
    e.stopPropagation()
    if (!currentUser) return navigate('/login')
    if (busy) return
    setBusy(true)
    if (!favorited) setBump(true)
    try {
      await toggleFavorite(projectId)
    } catch {
      /* context already rolled the optimistic change back */
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`group/heart inline-flex items-center gap-2 rounded-full transition active:scale-95 ${
        withLabel
          ? 'border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
          : `${dims.box} justify-center border border-slate-200 bg-white/90 shadow-sm backdrop-blur hover:border-rose-200 hover:bg-rose-50`
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        onAnimationEnd={() => setBump(false)}
        className={`${dims.icon} shrink-0 transition-colors duration-200 ${
          favorited ? 'fill-rose-500 text-rose-500' : 'fill-white text-slate-400'
        } group-hover/heart:text-rose-500 ${bump ? 'animate-pop' : ''}`}
        aria-hidden="true"
      >
        <path
          d="M12 20.25 4.4 12.9a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.72 0L12 7.15l.88-.85a4.8 4.8 0 0 1 6.72 0 4.6 4.6 0 0 1 0 6.6Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      {withLabel && <span>{favorited ? 'Favorited' : 'Favorite'}</span>}
    </button>
  )
}

export default HeartButton
