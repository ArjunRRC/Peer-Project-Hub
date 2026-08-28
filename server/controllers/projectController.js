import Project from '../models/Project.js'

export const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 50

export const getProjects = async (req, res, next) => {
  try {
    // Clamp both values — a bad ?page=abc or ?limit=99999 shouldn't reach Mongo.
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE),
    )

    const [projects, total] = await Promise.all([
      Project.find()
        .populate('owner', 'displayName email')
        // _id breaks ties: seeded projects share a createdAt to the millisecond,
        // and without a total order skip() can repeat one row and drop another.
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Project.countDocuments(),
    ])

    res.json({ projects, total, page, pages: Math.max(1, Math.ceil(total / limit)), limit })
  } catch (err) {
    next(err)
  }
}

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'owner',
      'displayName email',
    )
    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }
    res.json(project)
  } catch (err) {
    next(err)
  }
}

export const createProject = async (req, res, next) => {
  try {
    const { title, description, tags, githubUrl, liveDemoUrl } = req.body
    const project = await Project.create({
      title,
      description,
      tags,
      githubUrl,
      liveDemoUrl,
      owner: req.user._id,
    })
    res.status(201).json(project)
  } catch (err) {
    next(err)
  }
}

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }
    if (!project.owner.equals(req.user._id)) {
      res.status(403)
      throw new Error('Not authorized to edit this project')
    }
    const { title, description, tags, githubUrl, liveDemoUrl } = req.body
    Object.assign(project, { title, description, tags, githubUrl, liveDemoUrl })
    await project.save()
    res.json(project)
  } catch (err) {
    next(err)
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }
    if (!project.owner.equals(req.user._id)) {
      res.status(403)
      throw new Error('Not authorized to delete this project')
    }
    await project.deleteOne()
    res.json({ message: 'Project deleted' })
  } catch (err) {
    next(err)
  }
}

export const toggleLike = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }
    const userId = req.user._id
    const liked = project.likes.some((likeId) => likeId.equals(userId))
    // $addToSet/$pull are atomic, so a user can never end up in `likes` twice
    // (one like per account) even if two requests race.
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      liked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true },
    )
    res.json({ likes: updated.likes, likeCount: updated.likes.length, liked: !liked })
  } catch (err) {
    next(err)
  }
}
