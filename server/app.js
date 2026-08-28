import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import projectRoutes from './routes/projectRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// CORS_ORIGIN restricts the API to your deployed frontend. Unset (local dev, or
// client and API served from the same Vercel domain) falls back to allowing any
// origin, which is what the dev proxy needs.
const corsOrigin = process.env.CORS_ORIGIN
app.use(cors(corsOrigin ? { origin: corsOrigin.split(',').map((o) => o.trim()) } : {}))
app.use(express.json())

// Declared before the DB middleware on purpose: health must answer even when
// Mongo is unreachable, so a broken deployment is distinguishable from a
// broken database. It actively opens the connection rather than just reading
// readyState — on a cold serverless instance nothing has connected yet, so
// reporting readyState alone would say "disconnected" even when Mongo is fine.
app.get('/api/health', async (req, res) => {
  try {
    await connectDB()
    res.json({ status: 'ok', db: 'connected' })
  } catch (err) {
    // Still 200: the server itself is up. `db` and `reason` say what's wrong.
    res.json({ status: 'ok', db: 'disconnected', reason: err.message })
  }
})

// Connect per request rather than at import time: on serverless the first
// request is what wakes the function, and connectDB caches the live connection
// so this is a no-op once warm.
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    next(err)
  }
})

app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectId/comments', commentRoutes)
app.use('/api/users', userRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
