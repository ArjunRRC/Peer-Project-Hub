import dns from 'node:dns'
import mongoose from 'mongoose'

// Local-only workaround: some ISP/VPN resolvers can't answer the SRV/TXT lookups
// that mongodb+srv:// needs, producing "querySrv ECONNREFUSED" even though the
// OS resolver works. Vercel's DNS is fine, so skip it there (VERCEL is set
// automatically on their build and runtime).
if (!process.env.VERCEL) {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
}

// Serverless invocations reuse the same process while warm. Caching the
// connection on globalThis stops every cold start from opening a new one and
// exhausting the Atlas connection limit.
const cache = (globalThis.__mongoose ??= { conn: null, promise: null })

const connectDB = async () => {
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set')
    }
    cache.promise = mongoose.connect(process.env.MONGODB_URI, {
      // Fail fast instead of buffering queries until the function times out.
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    })
  }

  try {
    cache.conn = await cache.promise
  } catch (err) {
    // Clear the cached promise so the next request retries rather than
    // re-awaiting a permanently rejected one.
    cache.promise = null
    throw err
  }

  return cache.conn
}

export default connectDB
