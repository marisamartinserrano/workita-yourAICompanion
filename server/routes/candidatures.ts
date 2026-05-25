import { Router, Response } from 'express'
import { db } from '../db/index.js'
import { candidatures, candidatureStages, profiles } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { analyzeJobFlow } from '../ai/flows.js'

const router = Router()

const SELECTION_STAGES = [
  'Application submitted',
  'Interview with recruiter',
  'Technical interview',
  'Use case or assignment',
  'Team interview',
  'Manager interview',
  'Client/Stakeholder interview',
  'Cultural interview',
  'Leadership interview',
  'Offer received',
]

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const results = await db.select().from(candidatures).where(eq(candidatures.userId, req.userId!))
  res.json(results)
})

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const [candidature] = await db.select().from(candidatures).where(eq(candidatures.id, req.params.id))
  if (!candidature || candidature.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
  const stages = await db.select().from(candidatureStages).where(eq(candidatureStages.candidatureId, req.params.id))
  res.json({ ...candidature, stages })
})

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { jobDescription, jobUrl } = req.body as { jobDescription: string; jobUrl?: string }

  // Get candidate profile for analysis
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))

  // Run AI analysis
  const analysis = await analyzeJobFlow({
    jobDescription,
    candidateProfile: {
      cvText: profile?.cvText ?? undefined,
      role: profile?.role ?? undefined,
      seniority: profile?.seniority ?? undefined,
      industry: profile?.industry ?? undefined,
    },
  })

  const id = randomUUID()
  const [candidature] = await db
    .insert(candidatures)
    .values({
      id,
      userId: req.userId!,
      jobUrl: jobUrl ?? null,
      jobTitle: analysis.jobTitle,
      company: analysis.company,
      matchPercentage: analysis.matchPercentage,
      analysis,
      status: 'applied',
    })
    .returning()

  // Create selection stages
  await db.insert(candidatureStages).values(
    SELECTION_STAGES.map((stage) => ({
      id: randomUUID(),
      candidatureId: id,
      stage,
      status: stage === 'Application submitted' ? 'completed' : 'pending',
    }))
  )

  res.json(candidature)
})

router.patch('/:id/stages/:stageId', requireAuth, async (req: AuthRequest, res: Response) => {
  const [stage] = await db
    .update(candidatureStages)
    .set({ status: req.body.status, notes: req.body.notes, completedAt: req.body.status === 'completed' ? new Date() : null })
    .where(eq(candidatureStages.id, req.params.stageId))
    .returning()
  res.json(stage)
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const [c] = await db.select().from(candidatures).where(eq(candidatures.id, req.params.id))
  if (!c || c.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
  await db.delete(candidatureStages).where(eq(candidatureStages.candidatureId, req.params.id))
  await db.delete(candidatures).where(eq(candidatures.id, req.params.id))
  res.json({ message: 'Deleted' })
})

export default router
