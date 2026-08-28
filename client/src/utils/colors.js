// Full class strings (not built at runtime) so Tailwind's scanner keeps them.
const TAG_STYLES = [
  'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'bg-amber-50 text-amber-700 ring-amber-200',
  'bg-sky-50 text-sky-700 ring-sky-200',
  'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
  'bg-rose-50 text-rose-700 ring-rose-200',
  'bg-teal-50 text-teal-700 ring-teal-200',
  'bg-violet-50 text-violet-700 ring-violet-200',
]

const AVATAR_STYLES = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-sky-500 to-blue-500',
  'from-fuchsia-500 to-pink-500',
  'from-rose-500 to-red-500',
]

const hash = (value = '') => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Same tag always gets the same colour, so the palette reads as intentional.
export const tagStyle = (tag) => TAG_STYLES[hash(tag) % TAG_STYLES.length]

export const avatarStyle = (name) => AVATAR_STYLES[hash(name) % AVATAR_STYLES.length]

export const initials = (name = '') =>
  name
    .trim()
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?'
