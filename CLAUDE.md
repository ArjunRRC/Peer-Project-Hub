# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Peer Project Hub: a platform for students to post coding projects, browse others' projects, leave
comments, and bookmark favorites. Two independent npm projects, not a monorepo tool — `client/` and
`server/` each have their own `package.json`, `node_modules`, and `.env`.

## Commands

Server (`server/`, run from that directory):
- `npm install` — install dependencies
- `npm run dev` — start with Node's `--watch` (auto-restart on file change)
- `npm start` — start without watch mode
- No test suite or lint script exists yet.

Client (`client/`, run from that directory):
- `npm install` — install dependencies
- `npm run dev` — Vite dev server on http://localhost:5173, proxies `/api/*` to
  `http://localhost:5000` (see `vite.config.js`)
- `npm run build` — production build to `dist/`
- `npm run lint` — oxlint (`.oxlintrc.json`)
- No test suite exists yet.

Both need a `.env` file (copy from each folder's `.env.example`) before running. The server boots
and serves public routes fine even with placeholder Firebase values — only routes behind
`requireAuth` need real Firebase Admin credentials (see Auth section below).

## Architecture

### Data flow

React (client/) → Axios (`client/src/utils/api.js`, baseURL `/api`, proxied to the server in dev) →
Express (`server/server.js`) → `routes/` → `controllers/` → Mongoose `models/` → MongoDB.

### Auth: two separate Firebase integrations, both required

- **Client**: `firebase/auth` (`client/src/utils/firebase.js`) handles signup/login and issues ID
  tokens. `client/src/context/AuthContext.jsx` wraps the app, exposing `currentUser` (the raw
  Firebase user) and `dbUser` (the corresponding Mongo `User` document, fetched from `/users/me`).
  Axios attaches the current user's ID token as a Bearer header on every request
  (`api.js` request interceptor) — routes never need to pass the token manually.
- **Server**: `server/middleware/auth.js` (`requireAuth`) verifies that ID token with
  `firebase-admin` (`server/config/firebaseAdmin.js`). On first successful verification for a given
  Firebase UID, it **lazily creates the Mongo `User` document** — there is no separate
  `/signup` API endpoint; the Express-side user record is created implicitly the first time an
  authenticated request comes in.
- `firebaseAdmin.js` only calls `admin.initializeApp()` if all three `FIREBASE_*` env vars are
  present. If they're missing, the server still starts (public GET routes work), but `requireAuth`
  returns a `500` with an explicit "not configured" message instead of crashing the process. Don't
  reintroduce eager initialization here — that regressed to a hard crash on boot during scaffolding.
- Ownership checks (only a project's/comment's creator can edit/delete it) are enforced in the
  controllers (`project.owner.equals(req.user._id)`), not just hidden in the UI.

### Route → controller → model layering

- `routes/projectRoutes.js` — `/api/projects` (public GET, `requireAuth` for POST/PUT/DELETE)
- `routes/commentRoutes.js` — mounted at `/api/projects/:projectId/comments` in `server.js` with
  `mergeParams: true` so `req.params.projectId` is available inside a router that only knows about
  `:commentId` itself
- `routes/userRoutes.js` — `/api/users/me`, `/me/projects`, `/me/favorites` (all `requireAuth`)
- Every controller function follows try/catch → `next(err)`, caught by the centralized
  `notFound`/`errorHandler` middleware in `server.js` (must stay mounted last, after all routes)

### Client structure

- `src/context/AuthContext.jsx` — the only source of auth state; `useAuth()` elsewhere
- `src/utils/api.js` / `src/utils/firebase.js` — the only two places that know about the API
  base URL or Firebase config
- `src/pages/ProjectForm.jsx` — shared by both `/projects/new` and `/projects/:id/edit` (checked via
  `useParams().id` presence), not two separate components
- Route ordering in `App.jsx` relies on React Router v6's specificity-based ranking: static
  `/projects/new` correctly wins over `/projects/:id` regardless of declaration order

### Domain model

- **User**: `firebaseUid` (unique), `email`, `displayName`, `bio`, `favorites` (ref Project[])
- **Project**: `title`, `description`, `tags[]`, `githubUrl`, `liveDemoUrl` (optional), `owner` (ref
  User), `likes` (ref User[] — membership *is* the like, so one account counts at most once;
  toggled via `POST /api/projects/:id/like` using atomic `$addToSet`/`$pull`)
- **Comment**: `project` (ref), `author` (ref User), `text`

### Implemented beyond MVP

Favorites/bookmarking (Stage 2 in the original spec) is fully wired end-to-end: toggle endpoint at
`POST /api/users/me/favorites/:projectId`, list at `GET /api/users/me/favorites`, and a `/favorites`
page in the client. Likes are also wired end-to-end (see Domain model). A profile page
(`/profile/:tab` — own/liked/favorite projects, with an inline-editable username via
`PATCH /api/users/me`) and feed pagination are implemented. Ratings, search/filter and analytics
are not.

### Pagination

`GET /api/projects` is the only paginated endpoint. It takes `?page=&limit=` (defaults 1/12, limit
capped at 50, bad input clamped) and returns `{ projects, total, page, pages, limit }` — an object,
not the bare array it used to be. The client keeps the page in the URL (`/?page=2`) via
`useSearchParams`, and clamps back if it lands past the last page (e.g. after deletions).

**Sorts feeding `skip()` must include `_id` as a tiebreaker** (`.sort({ createdAt: -1, _id: -1 })`).
Seeded projects share a `createdAt` to the millisecond, and without a total order MongoDB is free to
return rows in a different order per query — which made `skip()` repeat one project on page 2 and
drop another entirely. The project list endpoints all do this now; keep it that way.

### Auth form validation

- Rules live in `client/src/utils/validation.js` (`EMAIL_REGEX`, `NAME_REGEX`, `PASSWORD_MIN`) and
  are shared by both auth pages; `components/AuthField.jsx` renders label + error + reveal toggle.
- **Signup** validates name, email, password (min 6) and confirm-password. **Login deliberately
  validates format only** — no composition rules — because accounts created before any rule change
  (including the `testpass123` seed accounts) must still be able to sign in. Don't "tighten" login.
- Fields validate on blur and on submit, and only re-validate while typing once a field has been
  blurred, so errors don't fire mid-first-entry.
- `NAME_REGEX` is duplicated in `server/controllers/userController.js` — the client can be bypassed,
  so `PATCH /api/users/me` enforces it too. Keep the two copies in sync.
- Signup sets the name in three places in order: Firebase `updateProfile` → `getIdToken(true)` →
  `PATCH /users/me`. The token refresh matters: `requireAuth` reads `decoded.name` when lazily
  creating the Mongo user, and the pre-refresh token doesn't carry it.
- `requireAuth` upserts (`findOneAndUpdate` + `$setOnInsert`) rather than find-then-create, because
  signup fires two authenticated requests concurrently and find-then-create races the unique index
  on `firebaseUid`.

### UI conventions

- **Favorite = heart** (`components/HeartButton.jsx`): outlined white by default, solid red when
  favorited. **Like = thumbs-up with a count** (`components/LikeButton.jsx`) — deliberately a
  different icon so the two actions never read as the same thing.
- Favorite state lives in `AuthContext` (`favorites`, `isFavorited`, `toggleFavorite`), not in each
  page, so the heart agrees across the feed, detail page and `/favorites`. Both toggles update
  optimistically and roll back on failure.
- `ProjectCard` uses a stretched-link pattern: an `absolute inset-0` `<Link>` covers the card, the
  content sits above it with `pointer-events-none` so clicks fall through, and only the
  heart/like controls re-enable pointer events. Don't nest those buttons inside the `<Link>` —
  that's invalid HTML and clicking them would navigate.
- Destructive/irreversible actions use `components/ConfirmDialog.jsx` (logout, delete project),
  not `window.confirm`.
- Tag chips and avatars get a stable colour hashed from their text (`utils/colors.js`). The class
  strings there are written out in full because Tailwind scans source statically — don't build
  them by string concatenation.
