import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import ProjectCard from '../components/ProjectCard'
import ProjectGridSkeleton from '../components/ProjectGridSkeleton'
import Pagination from '../components/Pagination'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .get('/projects', { params: { page } })
      .then((res) => {
        if (cancelled) return
        setData(res.data)
        setError('')
        // Deleting projects can leave you past the last page — walk back.
        if (page > res.data.pages) setSearchParams({ page: String(res.data.pages) }, { replace: true })
      })
      .catch(() => !cancelled && setError('Failed to load projects'))
    return () => {
      cancelled = true
    }
  }, [page, setSearchParams])

  // Derived, not stored: we're loading whenever the data we hold isn't for the
  // page currently being asked for. Avoids a setState cascade inside the effect.
  const loading = !error && (!data || data.page !== page)

  const handleLikesChange = useCallback((id, likes) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p._id === id ? { ...p, likes } : p)),
    }))
  }, [])

  const goToPage = (next) => {
    setSearchParams(next === 1 ? {} : { page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Discover what your peers are{' '}
          <span className="bg-linear-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            building
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Browse student projects, leave feedback, and save the ones that inspire you.
        </p>
      </header>

      {loading ? (
        <ProjectGridSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-700">{error}</p>
          <p className="mt-1 text-xs text-rose-600">
            Make sure the API server is running on port 5000.
          </p>
        </div>
      ) : data.total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
            <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
              <path
                d="M12 5v14m-7-7h14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">No projects yet</h2>
          <p className="mt-1 text-sm text-slate-500">Be the first to share what you've built.</p>
          {currentUser && (
            <Link
              to="/projects/new"
              className="mt-5 inline-block rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
            >
              Post a project
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs font-medium tracking-wide text-slate-400 uppercase">
            {data.total} {data.total === 1 ? 'project' : 'projects'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onLikesChange={handleLikesChange}
              />
            ))}
          </div>
          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            limit={data.limit}
            onChange={goToPage}
          />
        </>
      )}
    </div>
  )
}

export default Home
