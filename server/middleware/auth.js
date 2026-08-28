import admin from '../config/firebaseAdmin.js'
import User from '../models/User.js'

export const requireAuth = async (req, res, next) => {
  if (!admin.apps.length) {
    return res
      .status(500)
      .json({ message: 'Firebase Admin credentials are not configured on the server' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' })
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    // Upsert rather than find-then-create: signup fires two authenticated
    // requests at once (the auth listener's GET /users/me and the PATCH that
    // sets the chosen name), and a find-then-create race would hit the unique
    // index on firebaseUid and fail one of them.
    const user = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          firebaseUid: decoded.uid,
          email: decoded.email,
          displayName: decoded.name || decoded.email,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
