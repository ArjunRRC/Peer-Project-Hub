import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getMe,
  updateMe,
  getMyProjects,
  getLikedProjects,
  getFavorites,
  toggleFavorite,
} from '../controllers/userController.js'

const router = express.Router()

router.route('/me').get(requireAuth, getMe).patch(requireAuth, updateMe)
router.get('/me/projects', requireAuth, getMyProjects)
router.get('/me/likes', requireAuth, getLikedProjects)
router.get('/me/favorites', requireAuth, getFavorites)
router.post('/me/favorites/:projectId', requireAuth, toggleFavorite)

export default router
