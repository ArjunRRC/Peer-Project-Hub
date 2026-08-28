const AuthCard = ({ title, subtitle, error, children, footer }) => (
  <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-14">
    <div className="animate-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
      <div className="h-1.5 bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="p-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-200">
          <svg viewBox="0 0 24 24" className="size-6 text-white" aria-hidden="true">
            <path
              d="M8 6 3 12l5 6m8-12 5 6-5 6m-2-15-4 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-center text-sm text-slate-500">{subtitle}</p>}

        {error && (
          <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </div>
    {footer && <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>}
  </div>
)

export const authButtonClass =
  'w-full rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60'

export default AuthCard
