import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from './ConfirmDialog'
import { avatarStyle, initials } from '../utils/colors'

const navLink = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

const Navbar = () => {
  const { currentUser, dbUser, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const handleLogout = async () => {
    setConfirmLogout(false)
    await logout()
    navigate('/login')
  }

  const name = dbUser?.displayName || currentUser?.email || ''

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-200">
              <svg viewBox="0 0 24 24" className="size-5 text-white" aria-hidden="true">
                <path
                  d="M8 6 3 12l5 6m8-12 5 6-5 6m-2-15-4 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-base font-bold tracking-tight text-slate-900">
              Peer Project <span className="text-indigo-600">Hub</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <NavLink to="/" end className={navLink}>
              Feed
            </NavLink>
            {currentUser ? (
              <>
                <NavLink to="/favorites" className={navLink}>
                  Favorites
                </NavLink>
                <Link
                  to="/projects/new"
                  className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
                >
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <path
                      d="M12 5v14m-7-7h14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="hidden sm:inline">New</span>
                </Link>
                <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-2">
                  <Link
                    to="/profile"
                    title={`${name} — view profile`}
                    className={`hidden size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[11px] font-bold text-white ring-offset-2 transition hover:ring-2 hover:ring-indigo-400 sm:flex ${avatarStyle(name)}`}
                  >
                    {initials(name)}
                  </Link>
                  <button
                    onClick={() => setConfirmLogout(true)}
                    className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Log out"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                      <path
                        d="M15 17l5-5-5-5m5 5H9M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLink}>
                  Log in
                </NavLink>
                <Link
                  to="/signup"
                  className="rounded-lg bg-linear-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <ConfirmDialog
        open={confirmLogout}
        tone="danger"
        title="Are you sure you want to log out?"
        message="You'll need to sign in again to post projects, comment or favorite."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
        icon={
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            <path
              d="M15 17l5-5-5-5m5 5H9M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
    </>
  )
}

export default Navbar
