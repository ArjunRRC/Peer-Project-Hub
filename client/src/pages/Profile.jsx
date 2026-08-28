import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../utils/api'
import ProjectCard from '../components/ProjectCard'
import ProjectGridSkeleton from '../components/ProjectGridSkeleton'
import ProfileSidebar from '../components/ProfileSidebar'
import { useAuth } from '../context/AuthContext'

const TAB_META = {
  projects: {
    heading: 'My Projects',
    blurb: 'Everything you’ve shared with the community.',
    emptyTitle: 'You haven’t posted a project yet',
    emptyBody: 'Share what you’ve built and get feedback from your peers.',
    cta: { to: '/projects/new', label: 'Post a project' },
  },
  liked: {
    heading: 'Liked Projects',
    blurb: 'Projects you’ve given a thumbs-up.',
    emptyTitle: 'No liked projects yet',
    emptyBody: 'Tap the thumbs-up on any project to show some appreciation.',
    cta: { to: '/', label: 'Browse projects' },
  },
  favorites: {
    heading: 'Favorite Projects',
    blurb: 'Projects you’ve saved for later.',
    emptyTitle: 'No favorites yet',
    emptyBody: 'Tap the heart on any project to save it here.',
    cta: { to: '/', label: 'Browse projects' },
  },
}

const Profile = () => {
  const { tab } = useParams()
  const activeTab = TAB_META[tab] ? tab : 'projects'
  const { dbUser, isFavorited } = useAuth()

  const [lists, setLists] = useState({ projects: [], liked: [], favorites: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get('/users/me/projects'),
      api.get('/users/me/likes'),
      api.get('/users/me/favorites'),
    ])
      .then(([projects, liked, favorites]) => {
        if (cancelled) return
        setLists({ projects: projects.data, liked: liked.data, favorites: favorites.data })
      })
      .catch(() => !cancelled && setError('Could not load your profile'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // The same project can appear in more than one list, so keep them all in sync.
  const handleLikesChange = useCallback((id, likes) => {
    setLists((prev) => {
      const apply = (arr) => arr.map((p) => (p._id === id ? { ...p, likes } : p))
      return { projects: apply(prev.projects), liked: apply(prev.liked), favorites: apply(prev.favorites) }
    })
  }, [])

  // Un-liking or un-favoriting from these tabs should drop the card right away.
  const stillLiked = (p) => Boolean(dbUser && (p.likes || []).some((id) => String(id) === String(dbUser._id)))
  const visible = {
    projects: lists.projects,
    liked: lists.liked.filter(stillLiked),
    favorites: lists.favorites.filter((p) => isFavorited(p._id)),
  }

  const counts = {
    projects: lists.projects.length,
    liked: visible.liked.length,
    favorites: visible.favorites.length,
  }

  const meta = TAB_META[activeTab]
  const items = visible[activeTab]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <ProfileSidebar counts={counts} loading={loading} />

        <section className="min-w-0">
          <header className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{meta.heading}</h1>
            <p className="mt-1 text-sm text-slate-600">{meta.blurb}</p>
          </header>

          {loading ? (
            <ProjectGridSkeleton count={2} />
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
              <h2 className="text-base font-semibold text-slate-900">{meta.emptyTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{meta.emptyBody}</p>
              <Link
                to={meta.cta.to}
                className="mt-5 inline-block rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
              >
                {meta.cta.label}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {items.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onLikesChange={handleLikesChange}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Profile
