# Peer Project Hub — Client

React (Vite) frontend for Peer Project Hub. See the repo root [CLAUDE.md](../CLAUDE.md) for full
project context, tech stack, and backend setup.

## Setup

```bash
npm install
cp .env.example .env   # fill in Firebase web app config
npm run dev
```

Runs on http://localhost:5173 and proxies `/api` requests to the server at http://localhost:5000
(see `vite.config.js`).

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint
