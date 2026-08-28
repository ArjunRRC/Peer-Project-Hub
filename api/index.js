// Vercel serverless entry point. Everything under /api/* is rewritten here by
// vercel.json and handed to the same Express app used in local development.
import app from '../server/app.js'

export default function handler(req, res) {
  // Depending on how the rewrite resolves, Vercel may hand us the path with or
  // without the /api prefix. The Express routes are all mounted under /api, so
  // normalise before delegating.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`
  }
  return app(req, res)
}
