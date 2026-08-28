import 'dotenv/config'
import dns from 'node:dns'
import mongoose from 'mongoose'
import admin from './config/firebaseAdmin.js'
import User from './models/User.js'
import Project from './models/Project.js'
import Comment from './models/Comment.js'

dns.setServers(['8.8.8.8', '1.1.1.1'])

const SEED_PASSWORD = 'testpass123'

const seedAccounts = [
  { email: 'alice@example.com', displayName: 'Alice Chen', bio: 'Frontend dev learning React.' },
  {
    email: 'ben@example.com',
    displayName: 'Ben Okafor',
    bio: 'Backend-focused, into Node and MongoDB.',
  },
  { email: 'priya@example.com', displayName: 'Priya Nair', bio: 'Full-stack, loves Python and Vue.' },
]

const ensureFirebaseUser = async ({ email, displayName }) => {
  try {
    return await admin.auth().getUserByEmail(email)
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return admin.auth().createUser({ email, password: SEED_PASSWORD, displayName })
    }
    throw err
  }
}

const run = async () => {
  if (!admin.apps.length) {
    console.error(
      'Firebase Admin is not configured (check server/.env) - cannot create login-able seed accounts.',
    )
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  // Clean up fake, non-loginable seed users from an earlier version of this script.
  await User.deleteMany({ firebaseUid: { $in: ['seed-alice', 'seed-ben', 'seed-priya'] } })

  // Deleting those users used to leave their projects behind with a dangling
  // `owner` ref, which the UI renders as "by Unknown". Sweep any project whose
  // owner no longer exists, plus comments left pointing at nothing.
  const liveUserIds = await User.distinct('_id')
  const orphanedProjects = await Project.find({ owner: { $nin: liveUserIds } }).select('_id')
  if (orphanedProjects.length) {
    const ids = orphanedProjects.map((p) => p._id)
    await Comment.deleteMany({ project: { $in: ids } })
    await Project.deleteMany({ _id: { $in: ids } })
    console.log(`Removed ${ids.length} orphaned project(s) with no existing owner`)
  }
  const liveProjectIds = await Project.distinct('_id')
  await Comment.deleteMany({
    $or: [{ author: { $nin: liveUserIds } }, { project: { $nin: liveProjectIds } }],
  })
  await User.updateMany({}, { $pull: { favorites: { $nin: liveProjectIds } } })

  const users = []
  for (const account of seedAccounts) {
    const firebaseUser = await ensureFirebaseUser(account)
    const user = await User.findOneAndUpdate(
      { firebaseUid: firebaseUser.uid },
      {
        firebaseUid: firebaseUser.uid,
        email: account.email,
        displayName: account.displayName,
        bio: account.bio,
      },
      { upsert: true, new: true },
    )
    users.push(user)
  }
  const [alice, ben, priya] = users
  console.log(`Seeded ${users.length} sample users (Firebase Auth + MongoDB)`)

  await Project.deleteMany({ owner: { $in: users.map((u) => u._id) } })
  await Comment.deleteMany({ author: { $in: users.map((u) => u._id) } })

  const projects = await Project.insertMany([
    {
      title: 'TaskFlow - Kanban Board',
      description:
        'A drag-and-drop Kanban board built with React and Firebase for real-time sync across devices.',
      tags: ['React', 'Firebase', 'TailwindCSS'],
      githubUrl: 'https://github.com/alicechen/taskflow',
      liveDemoUrl: 'https://taskflow-demo.vercel.app',
      owner: alice._id,
    },
    {
      title: 'Weather Now',
      description:
        'A minimal weather app that geolocates the user and pulls live forecasts from a public weather API.',
      tags: ['JavaScript', 'API', 'CSS'],
      githubUrl: 'https://github.com/alicechen/weather-now',
      owner: alice._id,
    },
    {
      title: 'Recipe Vault API',
      description:
        'A REST API for storing and searching personal recipes, with tag-based filtering and JWT auth.',
      tags: ['Node.js', 'Express', 'MongoDB'],
      githubUrl: 'https://github.com/benokafor/recipe-vault-api',
      owner: ben._id,
    },
    {
      title: 'DevLinks',
      description:
        'A Linktree clone for developers to showcase their projects, GitHub, and socials in one page.',
      tags: ['Express', 'MongoDB', 'EJS'],
      githubUrl: 'https://github.com/benokafor/devlinks',
      liveDemoUrl: 'https://devlinks-ben.onrender.com',
      owner: ben._id,
    },
    {
      title: 'Budget Buddy',
      description: 'A personal budgeting tool with monthly spending charts and category breakdowns.',
      tags: ['Vue', 'Python', 'Flask'],
      githubUrl: 'https://github.com/priyanair/budget-buddy',
      owner: priya._id,
    },
    {
      title: 'Study Timer',
      description: 'A Pomodoro-style study timer with session history and streak tracking.',
      tags: ['React', 'MongoDB', 'Express'],
      githubUrl: 'https://github.com/priyanair/study-timer',
      liveDemoUrl: 'https://study-timer-psi.vercel.app',
      owner: priya._id,
    },
    {
      title: 'Campus Eats',
      description:
        'Pre-order food from campus canteens and skip the queue. Live order tracking and a slot picker so meals are ready when you arrive.',
      tags: ['React', 'Node.js', 'Stripe'],
      githubUrl: 'https://github.com/alicechen/campus-eats',
      liveDemoUrl: 'https://campus-eats-demo.vercel.app',
      owner: alice._id,
    },
    {
      title: 'PixelPal',
      description:
        'A browser-based pixel art editor with layers, an onion-skin animation preview, and export to PNG or animated GIF.',
      tags: ['JavaScript', 'Canvas', 'CSS'],
      githubUrl: 'https://github.com/alicechen/pixelpal',
      owner: alice._id,
    },
    {
      title: 'QuizForge',
      description:
        'A REST API for building and grading quizzes, with question banks, randomised ordering and per-attempt scoring.',
      tags: ['Node.js', 'Express', 'PostgreSQL'],
      githubUrl: 'https://github.com/benokafor/quizforge',
      owner: ben._id,
    },
    {
      title: 'ShelfSpace',
      description:
        'Track what you are reading, set yearly goals, and log notes per chapter. Imports your existing library from a CSV export.',
      tags: ['Express', 'MongoDB', 'Chart.js'],
      githubUrl: 'https://github.com/benokafor/shelfspace',
      liveDemoUrl: 'https://shelfspace-ben.onrender.com',
      owner: ben._id,
    },
    {
      title: 'TrailMap',
      description:
        'Plan hiking routes on an interactive map with elevation profiles, water-stop markers and offline GPX export.',
      tags: ['Vue', 'Leaflet', 'Python'],
      githubUrl: 'https://github.com/priyanair/trailmap',
      liveDemoUrl: 'https://trailmap-priya.netlify.app',
      owner: priya._id,
    },
    {
      title: 'NoteNest',
      description:
        'An offline-first markdown notebook. Everything is stored in IndexedDB, with full-text search and one-click export to a zip.',
      tags: ['React', 'IndexedDB', 'Markdown'],
      githubUrl: 'https://github.com/priyanair/notenest',
      owner: priya._id,
    },
  ])
  console.log(`Seeded ${projects.length} sample projects`)

  const comments = await Comment.insertMany([
    { project: projects[0]._id, author: ben._id, text: 'Love the drag-and-drop feel, super smooth!' },
    { project: projects[0]._id, author: priya._id, text: 'Would be great to see a dark mode.' },
    { project: projects[2]._id, author: alice._id, text: 'Clean API design, nice use of tag filtering.' },
    { project: projects[4]._id, author: ben._id, text: 'The category charts are a nice touch.' },
    { project: projects[5]._id, author: alice._id, text: 'Used this to study for finals, works great!' },
    { project: projects[6]._id, author: ben._id, text: 'The slot picker is a really nice touch - solves the queue problem properly.' },
    { project: projects[8]._id, author: alice._id, text: 'Randomised ordering per attempt is smart. Does it seed off the user id?' },
    { project: projects[10]._id, author: ben._id, text: 'Elevation profiles look great. GPX export sold me on this.' },
    { project: projects[11]._id, author: priya._id, text: 'Offline-first was the right call here, works perfectly on the train.' },
  ])
  console.log(`Seeded ${comments.length} sample comments`)

  // insertMany stamps every row in the same millisecond, which makes feed order
  // arbitrary. Spread them out. createdAt is immutable to Mongoose when
  // timestamps: true, so go through the native driver.
  const now = Date.now()
  for (let i = 0; i < projects.length; i++) {
    const ts = new Date(now - (i + 1) * 7 * 3600 * 1000)
    await Project.collection.updateOne(
      { _id: projects[i]._id },
      { $set: { createdAt: ts, updatedAt: ts } },
    )
  }

  const realUser = await User.findOne({ _id: { $nin: users.map((u) => u._id) } })
  if (realUser) {
    await User.updateOne(
      { _id: realUser._id },
      { $addToSet: { favorites: { $each: [projects[0]._id, projects[4]._id] } } },
    )
    console.log(`Added 2 sample favorites to your account (${realUser.email})`)
  }

  await mongoose.disconnect()
  console.log('Done')
  console.log('')
  console.log('Log in as any seed user with password:', SEED_PASSWORD)
  seedAccounts.forEach((a) => console.log(' -', a.email))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
