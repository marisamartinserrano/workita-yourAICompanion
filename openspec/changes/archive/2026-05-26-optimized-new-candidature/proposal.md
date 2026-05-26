## Why

Interview preparation in Workita currently generates questions using only the job title, company name, and stage — producing generic advice that could apply to any job with that title. Since the fetched job description text is already available at candidature creation time, we can derive a structured position summary from it and feed it into every subsequent interview prep call, making the questions, tips, and sample answers tightly relevant to the specific role, requirements, and context of that posting.

## What Changes

- **Position summary generation**: at candidature creation, if job description text is available, run a new AI flow (`summarizePositionFlow`) to produce a concise structured summary (key responsibilities, must-have skills, nice-to-haves, seniority signals, company context) and store it on the candidature record.
- **Database**: add a `positionSummary` (text, nullable) column to the `candidatures` table.
- **Interview prep enrichment**: pass the stored `positionSummary` from the candidature through the `/ai/interview-prep` endpoint into `interviewPrepFlow`, so questions and sample answers directly reference the real requirements of the role.
- **Selection Process frontend**: when opening interview prep for a stage, include the `positionSummary` from the loaded candidature in the API request.

## Capabilities

### New Capabilities
- `position-summary`: AI-generated structured summary of a job posting — generated at candidature creation from the fetched job description text and stored for reuse across all interview prep calls for that candidature.

### Modified Capabilities
- `04-selection-process`: FR-08 changes — interview prep must now use the position summary (when available) in addition to job title and company name, producing stage-specific questions grounded in the actual role requirements.
- `03-new-candidature`: candidature creation now triggers position summary generation alongside the existing `analyzeJobFlow`; `positionSummary` is persisted on the candidature record.

## Impact

- **`server/db/schema.ts`**: new `positionSummary` text column on `candidatures`
- **Drizzle migration**: `drizzle-kit generate` + `drizzle-kit push`
- **`server/ai/flows.ts`**: new `summarizePositionFlow`; updated `interviewPrepFlow` input schema to accept optional `positionSummary`
- **`server/routes/candidatures.ts`** (`POST /`): call `summarizePositionFlow` when `jobDescriptionText` is available; persist result
- **`server/routes/ai.ts`** (`POST /interview-prep`): accept and forward optional `positionSummary`
- **`src/pages/SelectionProcess.tsx`** (or equivalent): read `positionSummary` from the loaded candidature; include in interview-prep API call
