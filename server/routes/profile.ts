import { Router, Response } from 'express'
import { db } from '../db/index.js'
import { profiles } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAuth, AuthRequest } from '../middleware/auth.js'

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

export default router
