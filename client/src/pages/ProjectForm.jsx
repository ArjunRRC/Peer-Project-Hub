import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import { tagStyle } from '../utils/colors'

const emptyForm = { title: '', description: '', tags: '', githubUrl: '', liveDemoUrl: '' }

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100'

const Field = ({ label, hint, children }) => (
  <div>
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
    {children}
  </div>
)

const ProjectForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/projects/${id}`).then((res) => {
      const p = res.data
      setForm({
        title: p.title,
        description: p.description,
        tags: (p.tags || []).join(', '),
        githubUrl: p.githubUrl,
        liveDemoUrl: p.liveDemoUrl || '',
      })
    })
  }, [id, isEdit])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const parsedTags = form.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const payload = { ...form, tags: parsedTags }
    try {
      if (isEdit) {
        await api.put(`/projects/${id}`, payload)
        navigate(`/projects/${id}`)
      } else {
        const res = await api.post('/projects', payload)
        navigate(`/projects/${res.data._id}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        to={isEdit ? `/projects/${id}` : '/'}
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
        Cancel
      </Link>

      <div className="animate-fade-up mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Edit Project' : 'Share a Project'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {isEdit
              ? 'Update the details of your project.'
              : 'Tell your peers what you built and how it works.'}
          </p>

          {error && (
            <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field label="Title">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. TaskFlow — Kanban Board"
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="What does it do? What did you learn building it?"
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field label="Tags" hint="comma-separated">
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="React, MongoDB, Express"
                className={inputClass}
              />
              {parsedTags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {parsedTags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tagStyle(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="GitHub Repo URL">
              <input
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                required
                type="url"
                placeholder="https://github.com/you/project"
                className={inputClass}
              />
            </Field>

            <Field label="Live Demo URL" hint="optional">
              <input
                name="liveDemoUrl"
                value={form.liveDemoUrl}
                onChange={handleChange}
                type="url"
                placeholder="https://your-demo.vercel.app"
                className={inputClass}
              />
            </Field>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
              </button>
              <Link
                to={isEdit ? `/projects/${id}` : '/'}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProjectForm
