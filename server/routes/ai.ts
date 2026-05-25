import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { interviewPrepFlow, glossaryFlow, quizFlow } from '../ai/flows.js'

const router = Router()

router.post('/interview-prep', requireAuth, async (req: AuthRequest, res: Response) => {
  const { jobTitle, company, stage, candidateProfile } = req.body as {
    jobTitle: string; company: string; stage: string; candidateProfile?: string
  }
  const result = await interviewPrepFlow({ jobTitle, company, stage, candidateProfile })
  res.json(result)
})

router.post('/glossary', requireAuth, async (req: AuthRequest, res: Response) => {
  const { jobDescription, industry } = req.body as { jobDescription: string; industry?: string }
  const result = await glossaryFlow({ jobDescription, industry })
  res.json(result)
})

router.post('/quiz', requireAuth, async (req: AuthRequest, res: Response) => {
  const { jobTitle, topic, difficulty } = req.body as {
    jobTitle: string; topic: string; difficulty: 'easy' | 'medium' | 'hard'
  }
  const result = await quizFlow({ jobTitle, topic, difficulty })
  res.json(result)
})

export default router
