import { Router, Response } from 'express'
import multer from 'multer'
import { db } from '../db/index.js'
import { profiles } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { cvAnalysisFlow, linkedinAnalysisFlow } from '../ai/flows.js'

const router = Router()

// ─── Multer: memory storage, 5MB limit, PDF/.doc/.docx only ──────────────────

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('INVALID_FILE_TYPE'))
    }
  },
})

// ─── GET /profile ─────────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))
  res.json(profile ?? null)
})

// ─── POST /profile ────────────────────────────────────────────────────────────

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

// ─── POST /profile/cv ─────────────────────────────────────────────────────────

router.post('/cv', requireAuth, upload.single('cv'), async (req: AuthRequest, res: Response) => {
  const file = req.file
  if (!file) {
    res.status(400).json({ error: 'No file uploaded.' })
    return
  }

  // Extract text based on file type
  let extractedText = ''
  try {
    if (file.mimetype === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const parsed = await pdfParse(file.buffer)
      extractedText = parsed.text ?? ''
    } else {
      // .doc / .docx
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer: file.buffer })
      extractedText = result.value ?? ''
    }
  } catch (err) {
    console.error('CV text extraction error:', err)
    extractedText = ''
  }

  const lowExtraction = extractedText.trim().length < 100
  const cvFileData = file.buffer.toString('base64')

  // Upsert profile with CV file data + extracted text
  const existing = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))
  if (existing.length > 0) {
    await db.update(profiles)
      .set({
        cvFileName: file.originalname,
        cvFileData,
        cvFileType: file.mimetype,
        cvText: extractedText || existing[0].cvText,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, req.userId!))
  } else {
    await db.insert(profiles).values({
      id: randomUUID(),
      userId: req.userId!,
      cvFileName: file.originalname,
      cvFileData,
      cvFileType: file.mimetype,
      cvText: extractedText,
    })
  }

  res.json({
    cvFileName: file.originalname,
    cvFileType: file.mimetype,
    cvTextPreview: extractedText.substring(0, 100),
    ...(lowExtraction ? { warning: 'low_extraction' } : {}),
  })
})

// ─── POST /profile/analyze ────────────────────────────────────────────────────

router.post('/analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))

  if (!profile?.cvText) {
    res.status(400).json({ error: 'No CV text saved. Please upload your CV first.' })
    return
  }

  try {
    const cvAnalysis = await cvAnalysisFlow({ cvText: profile.cvText })

    // Persist result
    await db.update(profiles)
      .set({ cvAnalysisResult: cvAnalysis, cvAnalysisUpdatedAt: new Date(), updatedAt: new Date() })
      .where(eq(profiles.userId, req.userId!))

    res.json({ cvAnalysis })
  } catch (err) {
    console.error('CV analysis error:', err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})

// ─── POST /profile/linkedin-analyze ──────────────────────────────────────────

router.post('/linkedin-analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.userId!))

  if (!profile?.cvText) {
    res.status(400).json({ error: 'No CV saved. Please upload your CV first.' })
    return
  }

  try {
    const linkedinAnalysis = await linkedinAnalysisFlow({
      cvText: profile.cvText,
      linkedinUrl: profile.linkedinUrl ?? undefined,
      targetRole: profile.role ?? undefined,
      industry: profile.industry ?? undefined,
      seniority: profile.seniority ?? undefined,
    })

    // Persist result
    await db.update(profiles)
      .set({ linkedinAnalysisResult: linkedinAnalysis, linkedinAnalysisUpdatedAt: new Date(), updatedAt: new Date() })
      .where(eq(profiles.userId, req.userId!))

    res.json({ linkedinAnalysis })
  } catch (err) {
    console.error('LinkedIn analysis error:', err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})

export default router
