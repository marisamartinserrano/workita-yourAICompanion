import { Router, Response } from 'express'
import { db } from '../db/index.js'
import { candidatures, candidatureStages, profiles } from '../db/schema.js'
import { eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { analyzeJobFlow, extractJobMetadataFlow, summarizePositionFlow } from '../ai/flows.js'
import { stripHtml } from '../utils/stripHtml.js'

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
  const scheduled = ordered.find(s => s.status === 'scheduled')
  if (scheduled) return scheduled.stage
  const completed = [...ordered].reverse().find(s => s.status === 'completed')
  if (completed) return completed.stage
  return ordered[0]?.stage ?? 'Application submitted'
}

/** Attempt to fetch a URL and return stripped plain text, or null on failure */
async function fetchJobText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Workita/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const html = await res.text()
    return stripHtml(html)
  } catch {
    return null
  }
}

// ── GET /candidatures ─────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const results = await db.select().from(candidatures).where(eq(candidatures.userId, req.userId!))

  if (results.length === 0) { res.json([]); return }

  const allStages = await db
    .select({ candidatureId: candidatureStages.candidatureId, stage: candidatureStages.stage, status: candidatureStages.status })
    .from(candidatureStages)
    .where(inArray(candidatureStages.candidatureId, results.map(c => c.id)))

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

// ── POST /candidatures/extract ────────────────────────────────────────────────
// Fetch a job posting URL and run AI extraction — returns fields without saving.
// Used by the frontend to pre-fill the quick-add form before submission.

router.post('/extract', requireAuth, async (req: AuthRequest, res: Response) => {
  const { jobUrl, jobText: rawJobText } = req.body as { jobUrl?: string; jobText?: string }

  // If raw text is provided directly (e.g. pasted from LinkedIn), use it immediately
  if (rawJobText && rawJobText.trim().length > 20) {
    try {
      const fields = await extractJobMetadataFlow({ jobText: rawJobText.trim() })
      res.json({ autoFillStatus: 'success', fields })
    } catch (err) {
      console.error('extract from pasted text error:', err)
      res.json({ autoFillStatus: 'failed', fields: null })
    }
    return
  }

  if (!jobUrl) { res.status(400).json({ error: 'jobUrl or jobText is required' }); return }

  const isLinkedin = jobUrl.toLowerCase().includes('linkedin.com')
  if (isLinkedin) {
    res.json({ autoFillStatus: 'linkedin', fields: null })
    return
  }

  const jobText = await fetchJobText(jobUrl)
  if (!jobText) {
    res.json({ autoFillStatus: 'failed', fields: null })
    return
  }

  try {
    const fields = await extractJobMetadataFlow({ jobText })
    res.json({ autoFillStatus: 'success', fields })
  } catch (err) {
    console.error('extract endpoint AI error:', err)
    res.json({ autoFillStatus: 'failed', fields: null })
  }
})

// ── GET /candidatures/labels ──────────────────────────────────────────────────
// Must be defined before /:id to avoid "labels" being treated as an id param

router.get('/labels', requireAuth, async (req: AuthRequest, res: Response) => {
  const results = await db
    .select({ labels: candidatures.labels })
    .from(candidatures)
    .where(eq(candidatures.userId, req.userId!))

  const labelSet = new Set<string>()
  for (const row of results) {
    if (Array.isArray(row.labels)) {
      for (const l of row.labels as string[]) labelSet.add(l)
    }
  }
  res.json([...labelSet].sort())
})

// ── GET /candidatures/:id ─────────────────────────────────────────────────────

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const [candidature] = await db.select().from(candidatures).where(eq(candidatures.id, req.params.id))
  if (!candidature || candidature.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
  const stages = await db.select().from(candidatureStages).where(eq(candidatureStages.candidatureId, req.params.id))
  res.json({ ...candidature, stages })
})

// ── POST /candidatures ────────────────────────────────────────────────────────

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const {
    jobUrl,
    company,
    role,
    seniority,
    location,
    workMode,
    industry,
    labels,
    status,
    additionalInfo,
  } = req.body as {
    jobUrl?: string
    company?: string
    role?: string
    seniority?: string
    location?: string
    workMode?: string
    industry?: string
    labels?: string[]
    status?: string
    additionalInfo?: string
  }

  if (!jobUrl) {
    res.status(400).json({ error: 'jobUrl is required' })
    return
  }

  // Get candidate profile
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))

  // Determine if we need to auto-fill metadata from the URL
  const needsAutoFill = !role || !seniority || !location || !workMode || !industry

  let autoFillStatus: 'success' | 'failed' | 'skipped' | 'linkedin' = 'skipped'
  let fetchedJobDescription: string | null = null
  let extractedMeta: {
    jobTitle: string; company: string; role: string; seniority: string
    location: string; workMode: string; industry: string
  } | null = null

  if (needsAutoFill) {
    const isLinkedin = jobUrl.toLowerCase().includes('linkedin.com')
    if (isLinkedin) {
      autoFillStatus = 'linkedin'
    } else {
      fetchedJobDescription = await fetchJobText(jobUrl)
      if (fetchedJobDescription) {
        try {
          extractedMeta = await extractJobMetadataFlow({ jobText: fetchedJobDescription })
          autoFillStatus = 'success'
        } catch (err) {
          console.error('Auto-fill AI extraction failed:', err)
          autoFillStatus = 'failed'
        }
      } else {
        autoFillStatus = 'failed'
      }
    }
  }

  // Resolve final values: use provided field if present, else extracted, else fallback
  const notFound = (v: string | undefined | null) => (!v || v === 'Not found') ? null : v
  const finalJobTitle = notFound(extractedMeta?.jobTitle) ?? 'Untitled Position'
  const finalCompany  = notFound(company) ?? notFound(extractedMeta?.company) ?? 'Unknown Company'
  const finalRole      = notFound(role)     ?? notFound(extractedMeta?.role)
  const finalSeniority = notFound(seniority) ?? notFound(extractedMeta?.seniority)
  const finalLocation  = notFound(location)  ?? notFound(extractedMeta?.location)
  const finalWorkMode  = notFound(workMode)  ?? notFound(extractedMeta?.workMode)
  const finalIndustry  = notFound(industry)  ?? notFound(extractedMeta?.industry)
  const jobDescriptionText = fetchedJobDescription
    ? fetchedJobDescription.slice(0, 20000)
    : null

  const id = randomUUID()

  // Run full AI analysis if we have job description text and a profile
  let matchPercentage: number | null = null
  let analysis: unknown = null
  if (jobDescriptionText && profile) {
    try {
      const result = await analyzeJobFlow({
        jobDescription: jobDescriptionText,
        candidateProfile: {
          cvText: profile.cvText ?? undefined,
          role: profile.role ?? undefined,
          seniority: profile.seniority ?? undefined,
          industry: profile.industry ?? undefined,
        },
      })
      matchPercentage = result.matchPercentage
      analysis = result
    } catch (err) {
      console.error('analyzeJobFlow failed during candidature creation:', err)
      // Non-fatal: candidature saved without analysis
    }
  }

  // Generate position summary for enriched interview prep (non-fatal)
  let positionSummaryText: string | null = null
  if (jobDescriptionText) {
    try {
      const result = await summarizePositionFlow({ jobText: jobDescriptionText })
      positionSummaryText = result.summary
    } catch (err) {
      console.error('summarizePositionFlow failed during candidature creation:', err)
      // Non-fatal: candidature saved without position summary
    }
  }

  const [candidature] = await db
    .insert(candidatures)
    .values({
      id,
      userId: req.userId!,
      jobUrl,
      jobTitle: finalJobTitle,
      company: finalCompany,
      status: status ?? 'applied',
      matchPercentage: matchPercentage ?? undefined,
      analysis: analysis as Record<string, unknown> ?? undefined,
      role: finalRole,
      seniority: finalSeniority,
      location: finalLocation,
      workMode: finalWorkMode,
      industry: finalIndustry,
      labels: labels ?? [],
      additionalInfo: additionalInfo ?? null,
      jobDescription: jobDescriptionText,
      positionSummary: positionSummaryText,
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

  res.json({
    ...candidature,
    currentStage: 'Application submitted',
    isInInterview: false,
    hasProfile: !!profile,
    autoFillStatus,
  })
})

// ── PATCH /candidatures/:id/stages/:stageId ───────────────────────────────────

router.patch('/:id/stages/:stageId', requireAuth, async (req: AuthRequest, res: Response) => {
  const [cand] = await db.select({ userId: candidatures.userId }).from(candidatures).where(eq(candidatures.id, req.params.id))
  if (!cand || cand.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }

  const [stage] = await db
    .update(candidatureStages)
    .set({
      status: req.body.status,
      notes: req.body.notes,
      completedAt: req.body.status === 'completed' ? new Date() : null,
    })
    .where(eq(candidatureStages.id, req.params.stageId))
    .returning()

  // Bump candidature updatedAt for most-recent-activity sort
  await db
    .update(candidatures)
    .set({ updatedAt: new Date() })
    .where(eq(candidatures.id, req.params.id))

  res.json(stage)
})

// ── DELETE /candidatures/:id ──────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const [c] = await db.select().from(candidatures).where(eq(candidatures.id, req.params.id))
  if (!c || c.userId !== req.userId) { res.status(404).json({ error: 'Not found' }); return }
  await db.delete(candidatureStages).where(eq(candidatureStages.candidatureId, req.params.id))
  await db.delete(candidatures).where(eq(candidatures.id, req.params.id))
  res.json({ message: 'Deleted' })
})

export default router
