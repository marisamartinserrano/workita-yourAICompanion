import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { requireAuth, AuthRequest } from '../middleware/auth.js'
import { Response } from 'express'

export function setupAuth(app: ReturnType<typeof import('express').default>) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.FRONTEND_URL?.replace(':8080', ':3001') || 'http://localhost:3001'}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id
          const email = profile.emails?.[0]?.value ?? ''
          const name = profile.displayName
          const picture = profile.photos?.[0]?.value

          let [user] = await db.select().from(users).where(eq(users.googleId, googleId))

          if (!user) {
            const [newUser] = await db
              .insert(users)
              .values({ id: randomUUID(), googleId, email, name, picture })
              .returning()
            user = newUser
          }

          done(null, user)
        } catch (err) {
          done(err as Error)
        }
      }
    )
  )

  app.use(passport.initialize())
}

const router = Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    const user = req.user as { id: string; name: string; email: string; picture?: string }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080'
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
  }
)

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.userId!))
  if (!user) { res.status(404).json({ error: 'User not found' }); return }
  res.json(user)
})

router.post('/logout', (_req, res: Response) => {
  res.json({ message: 'Logged out' })
})

export default router
