import { Router, Response } from 'express'
import { db } from '../db/index.js'
import { candidatures, candidatureStages, profiles } from '../db/schema.js'
import { eq, inArray } from 'drizzle-orm'
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

const INTERVIEW_STAGES = new Set([
  'Interview with recruiter',
  'Technical interview',
  'Use case or assignment',
  'Team interview',
  'Manager interview',
  'Client/Stakeholder interview',
  'Cultural interview',
  'Leadership interview',
])

/** Derive the current active stage name for a list of stages */
function getCurrentStage(stages: { stage: string; status: string }[]): string {
  const ordered = SELECTION_STAGES.map(name => stages.find(s => s.stage === name)).filter(Boolean) as { stage: string; status: string }[]
  // Priority: scheduled first, then last completed, then first pending
  const scheduled = ordered.find(s => s.status === 'scheduled')
  if (scheduled) return scheduled.stage
  const completed = [...ordered].reverse().find(s => s.status === 'completed')
  if (completed) return completed.stage
  return ordered[0]?.stage ?? 'Application submitted'
}

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const results = await db.select().from(candidatures).where(eq(candidatures.userId, req.userId!))

  if (results.length === 0) { res.json([]); return }

  // Fetch all stages for this user's candidatures in one query
  const allStages = await db
    .select({ candidatureId: candidatureStages.candidatureId, stage: candidatureStages.stage, status: candidatureStages.status })
    .from(candidatureStages)
    .where(inArray(candidatureStages.candidatureId, results.map(c => c.id)))

  // Group stages by candidature id
  const stageMap = new Map<string, { stage: string; status: string }[]>()
  for (const s of allStages) {
    if (!stageMap.has(s.candidatureId)) stageMap.set(s.candidatureId, [])
    stageMap.get(s.candidatureId)!.push(s)
  }

  const enriched = results.map(c => ({
    ...c,
    currentStage: getCurrentStage(stageMap.get(c.id) ?? []),
    isInInterview: INTERVIEW_STAGES.has(getCurrentStage(stageMap.get(c.id) ?? [])),
  }))

  res.json(enriched)
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
