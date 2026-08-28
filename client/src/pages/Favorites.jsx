import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import ProjectCard from '../components/ProjectCard'
import ProjectGridSkeleton from '../components/ProjectGridSkeleton'
import { useAuth } from '../context/AuthContext'

const Favorites = () => {
  const { isFavorited } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/users/me/favorites')
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleLikesChange = useCallback((id, likes) => {
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, likes } : p)))
  }, [])

  // Unfavoriting from this page should drop the card right away.
  const visible = projects.filter((p) => isFavorited(p._id))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-slate-900">
          <svg viewBox="0 0 24 24" className="size-7 fill-rose-500 text-rose-500" aria-hidden="true">
            <path
              d="M12 20.25 4.4 12.9a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.72 0L12 7.15l.88-.85a4.8 4.8 0 0 1 6.72 0 4.6 4.6 0 0 1 0 6.6Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          My Favorites
        </h1>
        <p className="mt-2 text-sm text-slate-600">Projects you've saved for later.</p>
      </header>

      {loading ? (
        <ProjectGridSkeleton count={2} />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-50">
            <svg viewBox="0 0 24 24" className="size-6 fill-white text-rose-400" aria-hidden="true">
              <path
                d="M12 20.25 4.4 12.9a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.72 0L12 7.15l.88-.85a4.8 4.8 0 0 1 6.72 0 4.6 4.6 0 0 1 0 6.6Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">No favorites yet</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tap the heart on any project to save it here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
          >
            Browse projects
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((project) => (
            <ProjectCard key={project._id} project={project} onLikesChange={handleLikesChange} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
