import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
} from '../controllers/projectController.js'

const router = express.Router()

router.route('/').get(getProjects).post(requireAuth, createProject)

router
  .route('/:id')
  .get(getProjectById)
  .put(requireAuth, updateProject)
  .delete(requireAuth, deleteProject)

router.post('/:id/like', requireAuth, toggleLike)

export default router
