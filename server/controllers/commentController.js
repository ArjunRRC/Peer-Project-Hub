import Comment from '../models/Comment.js'
import Project from '../models/Project.js'

export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ project: req.params.projectId })
      .populate('author', 'displayName email')
      .sort({ createdAt: -1 })
    res.json(comments)
  } catch (err) {
    next(err)
  }
}

export const createComment = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }
    const comment = await Comment.create({
      project: project._id,
      author: req.user._id,
      text: req.body.text,
    })
    await comment.populate('author', 'displayName email')
    res.status(201).json(comment)
  } catch (err) {
    next(err)
  }
}

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) {
      res.status(404)
      throw new Error('Comment not found')
    }
    if (!comment.author.equals(req.user._id)) {
      res.status(403)
      throw new Error('Not authorized to delete this comment')
    }
    await comment.deleteOne()
    res.json({ message: 'Comment deleted' })
  } catch (err) {
    next(err)
  }
}
