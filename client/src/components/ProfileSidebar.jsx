import { NavLink } from 'react-router-dom'
import EditableUsername from './EditableUsername'
import { avatarStyle, initials } from '../utils/colors'
import { useAuth } from '../context/AuthContext'

const ICONS = {
  projects: (
    <path
      d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  ),
  liked: (
    <path
      d="M7 22V10.5L12.2 2.5a.9.9 0 0 1 1.6.4l.5 4a2 2 0 0 0 2 1.75h2.9a2 2 0 0 1 1.96 2.4l-1.5 8A2 2 0 0 1 17.7 22Zm0 0H3.5a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5H7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  ),
  favorites: (
    <path
      d="M12 20.25 4.4 12.9a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.72 0L12 7.15l.88-.85a4.8 4.8 0 0 1 6.72 0 4.6 4.6 0 0 1 0 6.6Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  ),
}

const TABS = [
  { key: 'projects', to: '/profile/projects', label: 'My Projects' },
  { key: 'liked', to: '/profile/liked', label: 'Liked Projects' },
  { key: 'favorites', to: '/profile/favorites', label: 'Favorite Projects' },
]

const ProfileSidebar = ({ counts = {}, loading }) => {
  const { dbUser, currentUser } = useAuth()
  const name = dbUser?.displayName || currentUser?.email || ''

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-16 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

        <div className="flex flex-col items-center px-5 pb-5">
          <span
            className={`-mt-9 flex size-18 items-center justify-center rounded-full bg-linear-to-br text-xl font-bold text-white ring-4 ring-white ${avatarStyle(name)}`}
          >
            {initials(name)}
          </span>
          <div className="mt-3 w-full">
            <EditableUsername />
          </div>
        </div>

        <nav className="border-t border-slate-100 p-2">
          {TABS.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    className={`size-5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                    aria-hidden="true"
                  >
                    {ICONS[tab.key]}
                  </svg>
                  <span className="flex-1">{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                      isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {loading ? '–' : (counts[tab.key] ?? 0)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default ProfileSidebar
