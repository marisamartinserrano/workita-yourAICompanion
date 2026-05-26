## Context

The profile page currently lives at `/onboarding` as a single route with a three-tab React component. Tab 1 (Job Preferences) is a simple form. Tab 2 (CV & Analysis) accepts pasted text and displays AI results in component state only. Tab 3 (LinkedIn) stores a URL and generates generic recommendations alongside CV analysis. Analysis results are lost on refresh; no file storage exists; the LinkedIn flow is not scoped to the user's target role.

This change replaces the tab layout with three dedicated routes and pages, adds CV file upload with server-side text extraction, persists analysis results to the database, and replaces the generic LinkedIn recommendations flow with a role-targeted LinkedIn suitability analysis.

## Goals / Non-Goals

**Goals:**
- Three standalone pages under `/profile`, `/profile/cv-analysis`, `/profile/linkedin-analysis` with their own routes and sidebar nav entries
- CV file upload (PDF, .doc, .docx), server-side extraction, storage of both file bytes and extracted text
- Persist CV analysis and LinkedIn analysis results to the `profiles` table; load on page entry
- LinkedIn suitability analysis scoped to role + industry + seniority from Job Preferences
- DB schema migration via drizzle-kit

**Non-Goals:**
- File storage outside the database (no S3, no filesystem — base64 in DB is acceptable for v1 CV sizes)
- Live LinkedIn profile fetching (URL only; analysis is prompt-based)
- CV version history (only the most recent CV is stored)
- Streaming AI responses (results appear when complete)

## Decisions

**1. Three separate pages, not a router-within-a-page**

Each profile section gets its own route (`/profile`, `/profile/cv-analysis`, `/profile/linkedin-analysis`) and React component. This allows independent loading, back/forward navigation, and clean URL sharing — impossible with tab state.

Alternative: Keep one `/onboarding` route, use query params (`?tab=cv`). Rejected — doesn't solve the lost-state problem on refresh and keeps the three concerns coupled.

**2. CV file stored as base64 in a `text` DB column**

PostgreSQL `text` columns handle arbitrary length. Base64 encoding adds ~33% overhead but keeps the schema simple (no `bytea` casting complexity) and works with Drizzle's existing `text()` column type. For typical CV sizes (< 500KB), this is negligible.

Alternative: `bytea` column. Rejected — requires explicit casting in Drizzle queries and complicates the REST serialisation.
Alternative: Object storage (S3/MinIO). Rejected — adds infra dependency not warranted for v1.

**3. Text extraction at upload time, not at analysis time**

`pdf-parse` and `mammoth` run on the server during `POST /profile/cv`. The extracted `cvText` is stored immediately alongside the file. Analysis always reads from `cvText` — no re-extraction needed.

Alternative: Extract at analysis time. Rejected — couples extraction latency to analysis latency; upload should be fast and decoupled.

**4. `linkedinAnalysisFlow` replaces `linkedinRecommendationsFlow`**

The new flow takes `cvText + linkedinUrl + targetRole + industry + seniority` and returns a suitability assessment: `suitabilityStrengths`, `suitabilityGaps`, `harmonizationTips`, `profileRecommendations`. The old flow's output (`recommendations[]` + `hasLinkedinUrl`) is incompatible with the new shape.

The old flow is kept in `flows.ts` until `analyzeJobFlow` (which has its own `linkedinRecommendations` field) can be audited — removing it now would break the job analysis endpoint.

**5. Analysis results stored in `profiles` table, not a new table**

`cvAnalysisResult` and `linkedinAnalysisResult` are `jsonb` columns on `profiles`. This avoids a join on every profile load and keeps the data model flat. Analysis is 1-to-1 with a user's profile (not per-candidature).

Alternative: Separate `profile_analyses` table. Rejected — adds join complexity for no benefit; analyses are not versioned in v1.

**6. Sidebar Profile group mirrors Selection Process pattern**

The existing sidebar already has a collapsible group for Selection Process sub-stages. The Profile group uses the same toggle pattern: a chevron button alongside the nav item, an `isOpen` state, and sub-items rendered as indented links (not just labels).

## Risks / Trade-offs

- **Large CV files** → Base64 of a 2MB PDF is ~2.7MB in the DB. Mitigation: add a 5MB client-side file size guard before upload.
- **Text extraction quality** → `pdf-parse` may produce garbled text from scanned/image-only PDFs. Mitigation: show a warning if extracted text is very short (< 100 chars); prompt user to paste text manually as fallback.
- **Migration on running DB** → Adding nullable columns to `profiles` is safe (no data loss, no locking on small tables). Mitigation: all new columns are nullable; existing rows are unaffected.
- **`linkedinRecommendationsFlow` deprecation** → `analyzeJobFlow` references `linkedinRecommendations` in its output, which is a separate string array unrelated to the new flow. Ensure no code references the old standalone flow after this change.

## Migration Plan

1. Run `npx drizzle-kit generate` to produce the SQL migration file
2. Run `npx drizzle-kit migrate` (or `db:migrate` npm script) at container start — the server's Dockerfile already runs migrations before starting
3. All new columns are nullable — zero-downtime addition
4. Rollback: drop the 7 new columns (no data depends on them at deploy time)

## Open Questions

- Should the CV Analysis page show a "re-extract text" option if the user suspects their PDF was scanned? → Defer to v2; add a manual text override textarea as fallback.
