## Why

The current profile page is a single route (`/onboarding`) with three tabs — Job Preferences, CV & Analysis, and LinkedIn — which hides important sections behind in-page navigation and limits each section to shallow functionality. CV upload (vs paste), persistent AI analysis results, and a proper LinkedIn suitability assessment are needed to make the profile genuinely useful; these require dedicated pages, file handling, and database persistence that a tab-based layout cannot cleanly support.

## What Changes

- **BREAKING** — Remove the three-tab layout from the Onboarding/Profile page; replace with three dedicated routes accessible from the left navigation under a collapsible "Profile" group
- Add a collapsible **Profile** group to the sidebar with three sub-items: Job Preferences (`/profile`), CV Analysis (`/profile/cv-analysis`), LinkedIn Analysis (`/profile/linkedin-analysis`)
- Replace CV text-paste with **file upload** (PDF, .doc, .docx); server extracts text and stores both the file and extracted text in the database
- **BREAKING** — Replace `linkedinRecommendationsFlow` with `linkedinAnalysisFlow` — a new, targeted flow that assesses LinkedIn profile suitability for the candidate's target role, industry, and seniority from Job Preferences
- Persist CV analysis results and LinkedIn analysis results to the `profiles` table (new JSONB columns); results are loaded and displayed when the user navigates to each section
- Add a DB schema migration: new columns on `profiles` — `cvFileName`, `cvFileData`, `cvFileType`, `cvAnalysisResult`, `cvAnalysisUpdatedAt`, `linkedinAnalysisResult`, `linkedinAnalysisUpdatedAt`

## Capabilities

### New Capabilities

- `cv-upload`: File upload for CV (PDF, .doc, .docx) with server-side text extraction; stores file and extracted text in DB; replaces text-paste input
- `cv-analysis-persistence`: CV analysis results stored in the `profiles` table and loaded on page entry; eliminates the lost-on-refresh problem
- `linkedin-suitability-analysis`: New AI flow assessing how well the candidate's LinkedIn profile aligns with their target role, industry, and seniority; surfaces strengths, gaps, and harmonization recommendations between CV and LinkedIn; results persisted in DB

### Modified Capabilities

- `candidate-onboarding`: **BREAKING** — three-tab layout removed; Job Preferences becomes a standalone page at `/profile`; CV and LinkedIn sections become separate routes; sidebar gains a collapsible Profile group

## Impact

- **`src/components/Layout.tsx`** — add collapsible Profile group with three sub-items; update `navItems` and active-state logic
- **`src/App.tsx`** — add routes `/profile`, `/profile/cv-analysis`, `/profile/linkedin-analysis`
- **`src/pages/Onboarding.tsx`** — **BREAKING** refactor: extract into `Profile.tsx` (job preferences only); create `CvAnalysis.tsx` and `LinkedinAnalysis.tsx` as new pages
- **`server/ai/flows.ts`** — add `linkedinAnalysisFlow`; deprecate `linkedinRecommendationsFlow`
- **`server/routes/profile.ts`** — add `POST /profile/cv` (file upload + extraction); update `POST /profile/analyze` to save results; add `POST /profile/linkedin-analyze`; update `GET /profile` to return stored analysis results
- **`server/db/schema.ts`** — add 7 new columns to `profiles` table
- **`drizzle.config.ts` / migrations** — generate and apply migration
- **`package.json`** — add `pdf-parse`, `mammoth`, `multer` + type declarations
- **`Dockerfile.server`** — no changes needed (npm ci picks up new deps)
