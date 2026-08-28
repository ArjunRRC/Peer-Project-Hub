import { useEffect } from 'react'

const TONES = {
  danger: {
    ring: 'bg-rose-100 text-rose-600',
    button: 'bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600',
  },
  brand: {
    ring: 'bg-indigo-100 text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-indigo-600',
  },
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'brand',
  icon,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    // Stop the page behind the dialog from scrolling while it's open
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onCancel])

  if (!open) return null

  const tones = TONES[tone] || TONES.brand

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        aria-label="Close dialog"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-slate-900/50 backdrop-blur-sm"
      />
      <div className="animate-scale-in relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5">
        <div className={`mx-auto flex size-12 items-center justify-center rounded-full ${tones.ring}`}>
          {icon || (
            <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden="true">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <h2 id="confirm-title" className="mt-4 text-center text-lg font-semibold text-slate-900">
          {title}
        </h2>
        {message && <p className="mt-2 text-center text-sm text-slate-500">{message}</p>}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${tones.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
