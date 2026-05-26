## 1. Dependencies & Setup

- [x] 1.1 Add `pdf-parse`, `mammoth`, and `multer` to `package.json` dependencies; add `@types/pdf-parse`, `@types/multer` as dev dependencies
- [x] 1.2 Run `npm install` to update `package-lock.json`

## 2. Database Schema & Migration

- [x] 2.1 Add 7 new nullable columns to the `profiles` table in `server/db/schema.ts`: `cvFileName` (text), `cvFileData` (text), `cvFileType` (text), `cvAnalysisResult` (jsonb), `cvAnalysisUpdatedAt` (timestamp), `linkedinAnalysisResult` (jsonb), `linkedinAnalysisUpdatedAt` (timestamp)
- [x] 2.2 Run `npx drizzle-kit generate` to produce the SQL migration file
- [x] 2.3 Verify the generated migration SQL is correct (adds 7 nullable columns, no destructive changes)

## 3. AI Flow — LinkedIn Suitability Analysis

- [x] 3.1 Add `linkedinAnalysisFlow` to `server/ai/flows.ts` — input: `{ cvText: string, linkedinUrl?: string, targetRole?: string, industry?: string, seniority?: string }`
- [x] 3.2 Define output schema: `{ suitabilityStrengths: string[], suitabilityGaps: string[], harmonizationTips: string[], profileRecommendations: { text: string, rationale: string }[], hasLinkedinUrl: boolean, hasJobPreferences: boolean }`
- [x] 3.3 Write the AI prompt: role-targeted LinkedIn suitability assessment using target role, industry, seniority as context; include harmonization comparison with CV; include profile recommendations
- [x] 3.4 Wrap JSON.parse in try/catch; throw structured error on failure

## 4. Backend API — CV Upload

- [x] 4.1 Add `multer` middleware to `server/routes/profile.ts` configured for memory storage, 5MB limit, PDF/.doc/.docx filter
- [x] 4.2 Add `POST /profile/cv` route: receive file buffer, detect type (PDF vs docx), extract text using `pdf-parse` or `mammoth`, store `cvFileName` + `cvFileData` (base64) + `cvFileType` + `cvText` on the profile row
- [x] 4.3 Return `{ cvFileName, cvFileType, cvText: extractedText.substring(0, 100) }` (preview) from the upload endpoint
- [x] 4.4 If extracted text length < 100 chars, include `{ warning: "low_extraction" }` in the response

## 5. Backend API — Analysis Persistence

- [x] 5.1 Update `POST /profile/analyze` to save `cvAnalysisResult` and `cvAnalysisUpdatedAt` to the profile row after successful analysis
- [x] 5.2 Add `POST /profile/linkedin-analyze` route: fetch profile, run `linkedinAnalysisFlow` with CV text + LinkedIn URL + Job Preferences fields, save `linkedinAnalysisResult` and `linkedinAnalysisUpdatedAt` to profile, return result
- [x] 5.3 Update `GET /profile` to include `cvAnalysisResult`, `cvAnalysisUpdatedAt`, `cvFileName`, `cvFileType`, `linkedinAnalysisResult`, `linkedinAnalysisUpdatedAt` in the response

## 6. Navigation — Sidebar Profile Group

- [x] 6.1 Replace the single `My Profile → /onboarding` nav item in `Layout.tsx` with a collapsible **Profile** group using the same toggle pattern as Selection Process
- [x] 6.2 Add three sub-items: `🎯 Job Preferences → /profile`, `📄 CV Analysis → /profile/cv-analysis`, `🔗 LinkedIn Analysis → /profile/linkedin-analysis`
- [x] 6.3 Auto-expand the Profile group when the current route starts with `/profile`
- [x] 6.4 Update active-state logic so any `/profile*` route highlights the Profile group label

## 7. Routing

- [x] 7.1 Add routes `/profile`, `/profile/cv-analysis`, `/profile/linkedin-analysis` to `App.tsx`
- [x] 7.2 Redirect `/onboarding` → `/profile` for backwards compatibility

## 8. Frontend — Job Preferences Page

- [x] 8.1 Create `src/pages/Profile.tsx` containing only the Job Preferences form (7 fields + Save button) extracted from `Onboarding.tsx`
- [x] 8.2 Load existing profile on mount via `GET /profile`; save via `POST /profile`

## 9. Frontend — CV Analysis Page

- [x] 9.1 Create `src/pages/CvAnalysis.tsx` with a file upload input (accept PDF, .doc, .docx; max 5MB client-side guard)
- [x] 9.2 On mount, load stored CV info (`cvFileName`, `cvFileType`) and stored `cvAnalysisResult` + `cvAnalysisUpdatedAt` from `GET /profile`; display if present
- [x] 9.3 Show uploaded file name and date; show "No CV uploaded yet" if absent
- [x] 9.4 Show low-extraction warning banner when the upload response includes `warning: "low_extraction"`
- [x] 9.5 "Analyse CV" button: disabled if no CV uploaded; triggers `POST /profile/analyze`; shows loading spinner; renders `CvAnalysisPanel` with result on completion
- [x] 9.6 Show analysis timestamp ("Last analysed: <date>") when a stored result is displayed

## 10. Frontend — LinkedIn Analysis Page

- [x] 10.1 Create `src/pages/LinkedinAnalysis.tsx` with a LinkedIn URL input field + Save button
- [x] 10.2 On mount, load stored LinkedIn URL, `linkedinAnalysisResult`, and `linkedinAnalysisUpdatedAt` from `GET /profile`; display analysis if present
- [x] 10.3 "Analyse LinkedIn" button: triggers `POST /profile/linkedin-analyze`; shows loading spinner; renders results on completion
- [x] 10.4 Render `suitabilityStrengths` and `suitabilityGaps` as two-column panels (green/red, matching the New Candidature style)
- [x] 10.5 Render `harmonizationTips` as a distinct "Harmonize with your CV" section
- [x] 10.6 Render `profileRecommendations` with text + rationale (matching the existing LinkedIn recs card style)
- [x] 10.7 Show notice banners when `hasLinkedinUrl` is false or `hasJobPreferences` is false
- [x] 10.8 Retain collapsible "How LinkedIn works for candidates" explainer section
- [x] 10.9 Show analysis timestamp ("Last analysed: <date>") when a stored result is displayed

## 11. Cleanup

- [x] 11.1 Remove the tab bar and CV/LinkedIn tab content from `Onboarding.tsx` (or delete the file if fully replaced by `Profile.tsx`)
- [x] 11.2 Ensure `linkedinRecommendationsFlow` is not called anywhere after this change (it remains in `flows.ts` for reference but is no longer invoked)

## 12. Spec & OpenSpec Artifacts

- [x] 12.1 Update `openspec/specs/02-candidate-onboarding/spec.md` to reflect the removed tab layout and replaced CV paste input
- [x] 12.2 Add Implementation section to the main spec
