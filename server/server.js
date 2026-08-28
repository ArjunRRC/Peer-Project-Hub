// Local development entry point. On Vercel the app is served by api/index.js
// as a serverless function instead, and this file is never run.
import app from './app.js'
import connectDB from './config/db.js'

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    // Don't exit: public GET routes still work, and `node --watch` would
    // otherwise sit dead until the next file change.
    console.error(`MongoDB connection error: ${err.message}`)
  })

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Without this, a busy port surfaces as an unhandled 'error' event and a raw
// stack trace. The usual cause is a second `npm run dev` (or an orphaned one
// from an earlier run) still holding the port.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} is already in use — another server is still running.\n` +
        `  Find it:  npx kill-port ${PORT}    (or set PORT=5001 in server/.env)\n`,
    )
    process.exit(1)
  }
  throw err
})
