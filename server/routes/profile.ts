import { Router, Response } from 'express'
import { db } from '../db/index.js'
import { profiles } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { cvAnalysisFlow, linkedinRecommendationsFlow } from '../ai/flows.js'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))
  res.json(profile ?? null)
})

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const existing = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))

  if (existing.length > 0) {
    const [updated] = await db
      .update(profiles)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(profiles.userId, req.userId!))
      .returning()
    res.json(updated)
  } else {
    const [created] = await db
      .insert(profiles)
      .values({ id: randomUUID(), userId: req.userId!, ...req.body })
      .returning()
    res.json(created)
  }
})

router.post('/analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))

  if (!profile?.cvText) {
    res.status(400).json({ error: 'No CV text saved. Please save your CV first.' })
    return
  }

  try {
    const [cvAnalysis, linkedinRecommendations] = await Promise.all([
      cvAnalysisFlow({ cvText: profile.cvText }),
      linkedinRecommendationsFlow({
        cvText: profile.cvText,
        linkedinUrl: profile.linkedinUrl ?? undefined,
      }),
    ])
    res.json({ cvAnalysis, linkedinRecommendations })
  } catch (err) {
    console.error('Profile analysis error:', err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})

export default router
