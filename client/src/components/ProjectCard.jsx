import { Link } from 'react-router-dom'
import HeartButton from './HeartButton'
import LikeButton from './LikeButton'
import { avatarStyle, initials, tagStyle } from '../utils/colors'
import { useAuth } from '../context/AuthContext'

const ProjectCard = ({ project, onLikesChange }) => {
  const { dbUser } = useAuth()
  const author = project.owner?.displayName || project.owner?.email || 'Unknown'
  const isOwner = dbUser && project.owner?._id === dbUser._id

  return (
    <article className="group animate-fade-up relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60">
      {/* Stretched click target — sits under the interactive controls below */}
      <Link
        to={`/projects/${project._id}`}
        aria-label={`View ${project.title}`}
        className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      />

      {/* pointer-events-none lets clicks fall through to the stretched link */}
      <div className="pointer-events-none relative">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-indigo-600">
            {project.title}
          </h2>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {project.description}
        </p>
        {project.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tagStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                +{project.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pointer-events-none relative mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[10px] font-bold text-white ${avatarStyle(author)}`}
          >
            {initials(author)}
          </span>
          <span className="truncate text-xs text-slate-500">{author}</span>
        </div>
        {/* Only the controls take clicks; the rest falls through to the card link */}
        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <LikeButton
            projectId={project._id}
            likes={project.likes || []}
            onChange={(likes) => onLikesChange?.(project._id, likes)}
          />
          {!isOwner && <HeartButton projectId={project._id} />}
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
