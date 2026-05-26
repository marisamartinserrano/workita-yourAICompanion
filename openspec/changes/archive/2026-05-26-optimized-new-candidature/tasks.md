## 1. Database Schema

- [x] 1.1 Add a nullable `positionSummary` (text) column to the `candidatures` table in `server/db/schema.ts`
- [x] 1.2 Run `npx drizzle-kit generate` to produce the SQL migration file
- [x] 1.3 Run `npx drizzle-kit push` (with `DATABASE_URL=postgresql://workita:workita@localhost:5432/workita`) to apply the migration

## 2. AI Flow — summarizePositionFlow

- [x] 2.1 Add `summarizePositionFlow` to `server/ai/flows.ts`: input `{ jobText: string }`, output `{ summary: string }` — a plain-text structured block with: role/company, key responsibilities, must-have skills, nice-to-haves, seniority signals, one-sentence company context
- [x] 2.2 Write a compact prompt instructing the model to extract those 6 fields from the job text; truncate input to 8000 chars; return ONLY the plain-text summary, no JSON, no markdown
- [x] 2.3 Update `interviewPrepFlow` input schema in `server/ai/flows.ts` to accept an optional `positionSummary: string`; when present, include it in the prompt under a "Job Posting Context" section

## 3. Backend — Candidatures route

- [x] 3.1 In `server/routes/candidatures.ts` `POST /`, after the `analyzeJobFlow` block, add a `summarizePositionFlow` call wrapped in try/catch (non-fatal); store the result string in a local variable `positionSummaryText`
- [x] 3.2 Pass `positionSummary: positionSummaryText ?? null` into the `db.insert(candidatures).values(...)` call
- [x] 3.3 Verify `GET /candidatures/:id` returns `positionSummary` (it will automatically since `db.select()` returns all columns — just confirm the field is present in the response)

## 4. Backend — AI route

- [x] 4.1 In `server/routes/ai.ts` `POST /interview-prep`, destructure and accept optional `positionSummary: string` from `req.body`
- [x] 4.2 Forward `positionSummary` to `interviewPrepFlow` call

## 5. Frontend — Selection Process page

- [x] 5.1 In `src/pages/SelectionProcess.tsx`, confirm the loaded `candidature` object includes `positionSummary` (it will since the API returns all columns)
- [x] 5.2 In the `POST /ai/interview-prep` call, add `positionSummary: candidature.positionSummary ?? undefined` to the request body

## 6. Rebuild & Verify

- [x] 6.1 Run `docker compose up --build -d` to rebuild server and client containers
- [ ] 6.2 Add a candidature with a non-LinkedIn URL; verify `positionSummary` is stored (check via the API response or DB)
- [ ] 6.3 Open the Selection Process for that candidature; click any interview stage; verify the generated questions reference specific skills or responsibilities from the actual posting
- [ ] 6.4 Open the Selection Process for an older candidature (no `positionSummary`); verify interview prep still works (graceful fallback)
