import { useState } from 'react'

const base =
  'w-full rounded-xl border bg-slate-50/60 px-4 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4'
const ok = 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
const bad = 'border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100'

const AuthField = ({ id, label, type = 'text', error, hint, value, onChange, onBlur, ...rest }) => {
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const invalid = Boolean(error)

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        {hint && !invalid && <span className="text-xs text-slate-400">{hint}</span>}
      </div>

      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? 'text' : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className={`${base} ${invalid ? bad : ok} ${isPassword ? 'pr-11' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            title={reveal ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-indigo-600"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              {reveal ? (
                <path
                  d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.2A9.5 9.5 0 0112 5c5 0 9 4.5 9 7a11 11 0 01-2.4 3.5M6.2 6.7A11.6 11.6 0 003 12c0 2.5 4 7 9 7a9.7 9.7 0 003.9-.8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <>
                  <path
                    d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>

      {invalid && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1 text-xs text-rose-600">
          <svg viewBox="0 0 24 24" className="mt-px size-3.5 shrink-0" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M12 7.5v5m0 3.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default AuthField
