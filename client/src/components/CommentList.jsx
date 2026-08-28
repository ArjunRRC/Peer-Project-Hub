import { avatarStyle, initials } from '../utils/colors'

const CommentList = ({ comments }) => {
  if (!comments.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-8 text-center text-sm text-slate-400">
        No comments yet — start the discussion.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => {
        const author = comment.author?.displayName || comment.author?.email || 'Unknown'
        return (
          <li
            key={comment._id}
            className="animate-fade-up flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[11px] font-bold text-white ${avatarStyle(author)}`}
            >
              {initials(author)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium text-slate-800">{author}</span>
                <span className="text-xs text-slate-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed wrap-break-word text-slate-600">
                {comment.text}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default CommentList
