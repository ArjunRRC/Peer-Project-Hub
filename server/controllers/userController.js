import User from '../models/User.js'
import Project from '../models/Project.js'

// Keep in sync with NAME_REGEX in client/src/utils/validation.js
const NAME_REGEX = /^[A-Za-z][A-Za-z0-9 ._'-]{1,39}$/

export const getMe = async (req, res) => {
  res.json(req.user)
}

export const updateMe = async (req, res, next) => {
  try {
    const { displayName, bio } = req.body
    const user = await User.findById(req.user._id)

    if (displayName !== undefined) {
      const trimmed = String(displayName).trim()
      if (!trimmed) {
        res.status(400)
        throw new Error('Username cannot be empty')
      }
      // Mirrors NAME_REGEX in client/src/utils/validation.js — the client can be
      // bypassed, so the rule has to hold here too.
      if (!NAME_REGEX.test(trimmed)) {
        res.status(400)
        throw new Error(
          "Username must be 2-40 characters, start with a letter, and use only letters, numbers, spaces or . _ ' -",
        )
      }
      user.displayName = trimmed
    }
    if (bio !== undefined) user.bio = String(bio).trim()

    await user.save()
    res.json(user)
  } catch (err) {
    next(err)
  }
}

export const getMyProjects = async (req, res, next) => {
  try {
    // Populated so the client can render these with the same ProjectCard as
    // the feed (which reads owner.displayName and compares owner._id).
    const projects = await Project.find({ owner: req.user._id })
      .populate('owner', 'displayName email')
      .sort({ createdAt: -1, _id: -1 })
    res.json(projects)
  } catch (err) {
    next(err)
  }
}

export const getLikedProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ likes: req.user._id })
      .populate('owner', 'displayName email')
      .sort({ createdAt: -1, _id: -1 })
    res.json(projects)
  } catch (err) {
    next(err)
  }
}

export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'owner', select: 'displayName email' },
    })
    res.json(user.favorites)
  } catch (err) {
    next(err)
  }
}

export const toggleFavorite = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const project = await Project.findById(projectId)
    if (!project) {
      res.status(404)
      throw new Error('Project not found')
    }
    const user = await User.findById(req.user._id)
    const index = user.favorites.findIndex((favId) => favId.equals(projectId))
    if (index === -1) {
      user.favorites.push(projectId)
    } else {
      user.favorites.splice(index, 1)
    }
    await user.save()
    res.json({ favorites: user.favorites })
  } catch (err) {
    next(err)
  }
}
