import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import CommentList from '../components/CommentList'
import CommentForm from '../components/CommentForm'
import ConfirmDialog from '../components/ConfirmDialog'
import HeartButton from '../components/HeartButton'
import LikeButton from '../components/LikeButton'
import { avatarStyle, initials, tagStyle } from '../utils/colors'
import { useAuth } from '../context/AuthContext'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, dbUser } = useAuth()
  const [project, setProject] = useState(null)
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setError('Project not found'))
    api
      .get(`/projects/${id}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => {})
  }, [id])

  const handleComment = async (text) => {
    const res = await api.post(`/projects/${id}/comments`, { text })
    setComments((prev) => [res.data, ...prev])
  }

  const handleDelete = async () => {
    setConfirmDelete(false)
    await api.delete(`/projects/${id}`)
    navigate('/')
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm font-medium text-rose-600">{error}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
          Back to feed
        </Link>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
      </div>
    )
  }

  const author = project.owner?.displayName || project.owner?.email || 'Unknown'
  const isOwner = dbUser && project.owner?._id === dbUser._id

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            d="M15 18l-6-6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to feed
      </Link>

      <article className="animate-fade-up mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {project.title}
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[11px] font-bold text-white ${avatarStyle(author)}`}
                >
                  {initials(author)}
                </span>
                <div className="text-sm">
                  <p className="font-medium text-slate-700">{author}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(project.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            {!isOwner && <HeartButton projectId={id} size="md" />}
          </div>

          <p className="mt-6 leading-relaxed whitespace-pre-wrap text-slate-700">
            {project.description}
          </p>

          {project.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${tagStyle(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <LikeButton
              projectId={id}
              likes={project.likes || []}
              size="md"
              onChange={(likes) => setProject((prev) => ({ ...prev, likes }))}
            />
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
              </svg>
              GitHub Repo
            </a>
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                  <path
                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Live Demo
              </a>
            )}

            {isOwner && (
              <div className="ml-auto flex items-center gap-2">
                <Link
                  to={`/projects/${id}/edit`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          Comments
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {comments.length}
          </span>
        </h2>
        {currentUser ? (
          <div className="mb-5">
            <CommentForm onSubmit={handleComment} />
          </div>
        ) : (
          <p className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
              Log in
            </Link>{' '}
            to join the conversation.
          </p>
        )}
        <CommentList comments={comments} />
      </section>

      <ConfirmDialog
        open={confirmDelete}
        tone="danger"
        title="Delete this project?"
        message="This will permanently remove the project and its comments. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

export default ProjectDetail
