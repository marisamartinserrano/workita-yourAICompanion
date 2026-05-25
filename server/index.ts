import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { setupAuth } from './routes/auth.js'
import authRouter from './routes/auth.js'
import profileRouter from './routes/profile.js'
import candidaturesRouter from './routes/candidatures.js'
import aiRouter from './routes/ai.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

setupAuth(app)

app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/candidatures', candidaturesRouter)
app.use('/api/ai', aiRouter)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Workita server running on http://localhost:${PORT}`)
})
