# Peer Project Hub

A platform where students post coding projects, browse what their peers are building, comment,
like, and bookmark favourites.

**Live demo:** <https://peer-project-hub-chi.vercel.app>

## Demo accounts

Sign in with any of these to explore without registering — each owns two projects, so you can see
that edit/delete controls only appear for their own work:

| Email | Password |
| --- | --- |
| `alice@example.com` | `testpass123` |
| `ben@example.com` | `testpass123` |
| `priya@example.com` | `testpass123` |

You can also sign up with your own email.

## Features

- **Firebase email/password auth** — tokens verified server-side with the Firebase Admin SDK
- **Projects** — full CRUD, with edit/delete restricted to the owner (enforced in the API, not just hidden in the UI)
- **Comments** on each project
- **Likes** — one per account, guaranteed atomically at the database level
- **Favourites** — bookmark projects to a personal list
- **Profile page** — your own, liked, and favourited projects, with an inline-editable username
- **Paginated feed** with a stable sort order
- **Form validation** — regex-checked name and email, minimum password length, confirm-password

## Tech stack

React 19 · React Router · Tailwind CSS v4 · Vite · Axios · Firebase Auth
Node.js · Express · MongoDB Atlas · Mongoose · Firebase Admin

## Architecture

```
client/          React app (Vite)
server/          Express app — app.js exports it, server.js runs it locally
api/index.js     Vercel serverless entry; wraps the same Express app
vercel.json      Routes /api/* to the function, everything else to the SPA
```

The client calls the relative path `/api`, so in production the frontend and API share one domain
and no CORS is involved. In development, Vite proxies `/api` to `localhost:5000`.

## Running locally

Both halves need their own `.env` (copy from each `.env.example`).

```bash
# terminal 1
cd server && npm install && npm run dev     # http://localhost:5000

# terminal 2
cd client && npm install && npm run dev     # http://localhost:5173
```

Seed sample data (creates the demo accounts above, plus projects and comments):

```bash
cd server && npm run seed
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo. Leave the root
   directory as `./` — `vercel.json` handles the rest.
3. Add these **Environment Variables** (Settings → Environment Variables), for all environments:

   | Name | Value |
   | --- | --- |
   | `MONGODB_URI` | Your Atlas connection string |
   | `FIREBASE_PROJECT_ID` | From the service account JSON |
   | `FIREBASE_CLIENT_EMAIL` | From the service account JSON |
   | `FIREBASE_PRIVATE_KEY` | From the service account JSON, quoted, `\n` escapes intact |
   | `VITE_FIREBASE_API_KEY` | Firebase web config |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web config |
   | `VITE_FIREBASE_PROJECT_ID` | Firebase web config |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web config |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web config |
   | `VITE_FIREBASE_APP_ID` | Firebase web config |

   Do **not** set `VITE_API_URL` — the client should use the relative `/api` path.

4. **MongoDB Atlas → Network Access:** add `0.0.0.0/0`. Vercel's serverless functions have dynamic
   egress IPs, so a fixed allowlist entry cannot work.
5. **Firebase Console → Authentication → Settings → Authorised domains:** add your
   `*.vercel.app` domain, or login fails with `auth/unauthorized-domain`.
6. Deploy, then check `https://<your-app>.vercel.app/api/health` — it should return
   `{"status":"ok","db":"connected"}`.
