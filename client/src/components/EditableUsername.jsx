import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const EditableUsername = () => {
  const { dbUser, currentUser, updateProfile } = useAuth()
  const displayed = dbUser?.displayName || currentUser?.email || 'Anonymous'

  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(displayed)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const startEditing = () => {
    setValue(displayed)
    setError('')
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
    setError('')
  }

  const save = async () => {
    const trimmed = value.trim()
    if (!trimmed) return setError('Username cannot be empty')
    if (trimmed === displayed) return cancel()

    setSaving(true)
    setError('')
    try {
      await updateProfile({ displayName: trimmed })
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save username')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancel()
    }
  }

  if (!editing) {
    return (
      <div className="min-w-0">
        <div className="flex items-center justify-center gap-1.5">
          <h2 className="truncate text-base font-semibold text-slate-900" title={displayed}>
            {displayed}
          </h2>
          <button
            onClick={startEditing}
            aria-label="Edit username"
            title="Edit username"
            className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="mt-0.5 truncate text-center text-xs text-slate-400" title={currentUser?.email}>
          {currentUser?.email}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        maxLength={40}
        aria-label="Username"
        className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-center text-sm font-semibold text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
      />
      {error && <p className="mt-1.5 text-center text-xs text-rose-600">{error}</p>}
      <div className="mt-2 flex justify-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={cancel}
          disabled={saving}
          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default EditableUsername
