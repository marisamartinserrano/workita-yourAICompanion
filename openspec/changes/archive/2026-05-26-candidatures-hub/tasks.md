## 1. Database Schema

- [x] 1.1 Add 6 new nullable columns to the `candidatures` table in `server/db/schema.ts`: `seniority` (text), `location` (text), `workMode` (text), `industry` (text), `labels` (jsonb), `additionalInfo` (text); also add `jobDescription` (text) to store fetched posting text
- [x] 1.2 Run `npx drizzle-kit generate` to produce the SQL migration file
- [x] 1.3 Run `npx drizzle-kit push` (with `DATABASE_URL=postgresql://workita:workita@localhost:5432/workita`) to apply the migration to the running DB

## 2. AI Flow — extractJobMetadataFlow

- [x] 2.1 Add `extractJobMetadataFlow` to `server/ai/flows.ts`: input `{ jobText: string }`, output `{ jobTitle: string, company: string, role: string, seniority: string, location: string, workMode: string, industry: string }` — all fields return "Not found" if not present in the text
- [x] 2.2 Write a compact AI prompt: instruct model to act as a job posting parser extracting the 7 fields; truncate input to 8000 chars; return ONLY JSON, no markdown; wrap in `extractJson` + try/catch

## 3. Backend API — Candidatures route updates

- [x] 3.1 In `server/routes/candidatures.ts`, update `POST /` to accept `{ jobUrl, role?, seniority?, location?, workMode?, industry?, labels?, status?, additionalInfo? }`; make `jobUrl` required (400 if missing); remove `jobDescription` from required input
- [x] 3.2 In `POST /`, after saving with manually provided fields: if any of `{ role, seniority, location, workMode, industry }` are empty, attempt to fetch the `jobUrl` (plain `fetch`, text extraction via strip-HTML helper); if fetch succeeds, run `extractJobMetadataFlow` and fill empty fields from the result; set `autoFillStatus: 'success' | 'failed' | 'skipped'` in the response; detect `linkedin.com` in URL and skip fetch (set `autoFillStatus: 'linkedin'`)
- [x] 3.3 Write a `stripHtml(html: string): string` helper in `server/utils/stripHtml.ts` that removes HTML tags, collapses whitespace, and returns plain text (regex-based, no new dependencies)
- [x] 3.4 Store `jobDescription` (the fetched + stripped text, truncated to 20000 chars) on the candidature record when auto-fill succeeds
- [x] 3.5 Update `POST /` to also run `analyzeJobFlow` when `jobDescription` is available (fetched or from old flow) and a candidate profile exists; save `matchPercentage` and `analysis` as before; return `hasProfile` flag
- [x] 3.6 Update `GET /` to include the new columns (`seniority`, `location`, `workMode`, `industry`, `labels`, `additionalInfo`) in the response
- [x] 3.7 In `PATCH /:id/stages/:stageId`, after updating the stage, bump `candidatures.updatedAt` to `new Date()` so most-recent-activity sort works

## 4. Backend API — New endpoint for label autocomplete

- [x] 4.1 Add `GET /candidatures/labels` route in `server/routes/candidatures.ts`: returns the distinct union of all label values across the user's candidatures (extracted from the `labels` jsonb array column); returns `string[]`

## 5. Navigation — Sidebar Candidatures Group

- [x] 5.1 In `src/components/Layout.tsx`, remove the standalone "New Candidature → /candidature/new" and "Selection Process → /selection-process" nav items
- [x] 5.2 Add a `candidaturesOpen` / `setCandidaturesOpen` state; auto-expand when `location.pathname.startsWith('/candidature')`
- [x] 5.3 Add a collapsible **Candidatures** group with one sub-item: `📋 My Candidatures → /candidatures`; use the same toggle + active-state pattern as the Profile group

## 6. Routing

- [x] 6.1 Add route `/candidatures` → `<Candidatures />` to `src/App.tsx`
- [x] 6.2 Change the existing `/candidature/new` route to `<Navigate to="/candidatures" replace />`
- [x] 6.3 Change the existing `/selection-process` route to `<Navigate to="/candidatures" replace />`
- [x] 6.4 Import the new `Candidatures` page in `App.tsx`; remove the `NewCandidature` and `SelectionProcessList` imports (those pages will become redirect shims or be removed)

## 7. Frontend — Candidatures Hub Page

- [x] 7.1 Create `src/pages/Candidatures.tsx`; on mount call `GET /api/candidatures` and `GET /api/candidatures/labels` to load candidatures and available label suggestions
- [x] 7.2 Implement the quick-add form: URL input (required, with validation), role, seniority (dropdown: Junior/Mid-level/Senior/Lead/Manager/Director/C-Level/Not specified), location, work mode (dropdown: On-site/Hybrid/Remote), industry, labels (chip input with autocomplete from loaded label suggestions), status (dropdown: Applied/In Progress/Offer/Rejected/Withdrawn/Archived), additional info (textarea); form state managed locally; "Save" button disabled while URL is empty
- [x] 7.3 On form submit: `POST /api/candidatures` with all form fields; on response prepend the new candidature to the list; show an autoFillStatus banner if applicable (success notice: "Job details auto-filled ✓"; linkedin warning; failure warning); reset form on success
- [x] 7.4 Build a `CandidatureCard` sub-component rendering: company + job title (bold), match % badge (if present), current stage pill, status colour-coded badge, work mode + seniority + industry as small metadata, labels as chips, creation date; clicking the card navigates to `/candidature/:id`
- [x] 7.5 Build the status badge colour map: Applied → blue, In Progress → violet, Offer → green, Rejected → red, Withdrawn → gray, Archived → gray
- [x] 7.6 Implement keyword search: a text input that filters the candidatures array in-memory by jobTitle, company, role, and industry (case-insensitive includes)
- [x] 7.7 Implement filter panel: collapsible filter bar with multi-select chips/dropdowns for company, role, seniority, industry, labels, and work mode; active filters shown as dismissible chips above the list; AND logic across dimensions, OR within each dimension
- [x] 7.8 Sort the filtered list by `updatedAt` descending before rendering; show "No candidatures match your search" when the filtered list is empty
- [x] 7.9 Add empty state when `candidatures.length === 0` before any search/filter is applied: friendly message + illustration/emoji prompting the user to add their first candidature

## 8. Frontend — Shim old pages

- [x] 8.1 Replace `src/pages/NewCandidature.tsx` content with `export { default } from './Candidatures'` (acts as a shim in case anything still imports it)
- [x] 8.2 Replace `src/pages/SelectionProcessList.tsx` content with `export { default } from './Candidatures'`

## 9. Rebuild & Verify

- [x] 9.1 Run `docker compose up --build -d` to rebuild server and client containers
- [ ] 9.2 Verify the "Candidatures" sidebar group appears, auto-expands on `/candidature/:id`, and sub-item navigates to `/candidatures`
- [ ] 9.3 Add a candidature with URL only; verify auto-fill banner and extracted metadata appear on the card
- [ ] 9.4 Add a LinkedIn URL; verify the "LinkedIn job pages require login" banner appears and the candidature is saved
- [ ] 9.5 Verify keyword search and at least 2 filters work correctly
- [ ] 9.6 Verify clicking a candidature card navigates to the SelectionProcess detail page
- [ ] 9.7 Verify `/candidature/new` and `/selection-process` redirect to `/candidatures`
