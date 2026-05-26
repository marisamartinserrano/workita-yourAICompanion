## Why

The New Candidature core flow (submit job description → AI analysis → save → navigate to selection process) is functional, but three spec requirements remain unimplemented: structured role requirements are not extracted, networking guidance is absent, and users without a profile receive no contextual notice. Completing these gaps closes the full spec 03 feature set.

## What Changes

- Extend `analyzeJobFlow` to extract and return structured `roleRequirements` (skills, experience level, salary) and `networkingGuidance` (outreach tips for recruiter, hiring manager, company employees)
- Add `roleRequirements` panel to the `NewCandidature.tsx` results view (FR-04)
- Add `networkingGuidance` section to the results view (FR-12)
- Add a no-profile banner when the backend detects no saved profile — "Complete your profile for a personalised match score" (NFR-02)
- Update `POST /candidatures` to include a `hasProfile` flag in the response so the frontend can conditionally render the banner
- FR-15 (glossary auto-generation) deferred to the spec 06 — Glossary change

## Capabilities

### New Capabilities

- `role-requirements`: AI extraction of structured role requirements from the job description — required skills list, experience level, and expected salary range (if mentioned)
- `networking-guidance`: AI-generated, role-specific outreach guidance for contacting the recruiter, hiring manager, and relevant company employees on LinkedIn or by email

### Modified Capabilities

- `new-candidature`: Extend results view with role requirements panel, networking guidance section, and a no-profile completion banner; extend `POST /candidatures` response with `hasProfile` flag

## Impact

- **`server/ai/flows.ts`** — extend `analyzeJobFlow` output schema and prompt to include `roleRequirements` and `networkingGuidance`
- **`server/routes/candidatures.ts`** — include `hasProfile: boolean` in the `POST /candidatures` response body
- **`src/pages/NewCandidature.tsx`** — add role requirements panel, networking guidance section, and conditional no-profile banner to the results view
- No database schema changes required
