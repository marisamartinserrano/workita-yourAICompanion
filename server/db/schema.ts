import { pgTable, text, timestamp, integer, varchar, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  googleId: text('google_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  picture: text('picture'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role'),
  seniority: text('seniority'),
  industry: text('industry'),
  location: text('location'),
  workMode: text('work_mode'),
  salaryExpectations: text('salary_expectations'),
  preferredCompanies: text('preferred_companies'),
  cvText: text('cv_text'),
  linkedinUrl: text('linkedin_url'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const candidatures = pgTable('candidatures', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  jobUrl: text('job_url'),
  jobTitle: text('job_title').notNull(),
  company: text('company').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('applied'),
  matchPercentage: integer('match_percentage'),
  analysis: jsonb('analysis'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const candidatureStages = pgTable('candidature_stages', {
  id: text('id').primaryKey(),
  candidatureId: text('candidature_id').notNull().references(() => candidatures.id),
  stage: text('stage').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  notes: text('notes'),
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
