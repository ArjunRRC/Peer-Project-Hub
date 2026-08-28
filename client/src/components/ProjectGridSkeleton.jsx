const ProjectGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
)

export default ProjectGridSkeleton
