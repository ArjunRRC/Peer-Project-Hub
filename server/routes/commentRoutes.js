import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getComments, createComment, deleteComment } from '../controllers/commentController.js'

const router = express.Router({ mergeParams: true })

router.route('/').get(getComments).post(requireAuth, createComment)

router.delete('/:commentId', requireAuth, deleteComment)

export default router
