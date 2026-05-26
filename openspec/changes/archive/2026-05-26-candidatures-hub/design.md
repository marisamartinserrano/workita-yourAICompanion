## Context

**Current state:**
- `POST /candidatures` accepts `{ jobDescription: string, jobUrl?: string }`, runs `analyzeJobFlow` immediately, returns full analysis + saves to DB
- `candidatures` table: `id, userId, jobUrl, jobTitle, company, status, matchPercentage, analysis (jsonb), createdAt, updatedAt`
- Navigation has two separate top-level items: "New Candidature" → `/candidature/new` and "Selection Process" → `/selection-process`
- `/candidature/new` is a full-page form with a large job description textarea; analysis results replace the form on submission
- `/selection-process` lists all candidatures with basic info

**New state:**
- `/candidatures` is the single hub — form + list on the same page
- Form is URL-first: user provides the job posting link; metadata fields are optional and AI-filled if blank
- The list below the form is the replacement for `/selection-process`
- Both old routes redirect to `/candidatures`

## Goals / Non-Goals

**Goals:**
- Single route and page for all candidature management
- URL-driven quick-add: paste a link, click save, done — AI fills the gaps
- Enriched data model: seniority, location, workMode, industry, labels, additionalInfo
- List with client-side keyword search + filters (no server-side search endpoint needed given typical candidate pipeline size <100)
- Collapsible "Candidatures" sidebar group matching the Profile group pattern
- `updatedAt` on `candidatures` updated when stages are patched (most-recent-activity sort)

**Non-Goals:**
- Real-time collaboration or shared candidature lists
- Server-side paginated search (client-side sufficient for <100 candidatures)
- Fetching/scraping LinkedIn job postings (requires auth; out of scope — URL stored, AI extraction skipped gracefully with a "could not extract" notice)
- Replacing or modifying the SelectionProcess detail page (`/candidature/:id`)

## Decisions

### 1. URL fetch + AI extraction on the server, not the client

When the user saves with empty optional fields, the server:
1. Fetches the job posting URL (plain HTTP GET, no browser needed)
2. Extracts visible text (strip HTML tags server-side with a regex or simple parser)
3. Passes extracted text to a new lightweight `extractJobMetadataFlow` (reuses Gemini, no heavy analysis)
4. Returns extracted fields to the client as part of the save response

Rationale: avoids CORS issues on the client; keeps AI calls server-side; consistent with existing pattern.

Alternative considered — run `analyzeJobFlow` immediately on save: rejected because it's too slow (15s) and too heavy for a quick-add form. Full analysis is preserved for later, triggered from the SelectionProcess page.

### 2. New `extractJobMetadataFlow` AI flow (lightweight)

Separate from `analyzeJobFlow`. Input: `{ jobText: string }`. Output: `{ jobTitle, company, role, seniority, location, workMode, industry }`. Prompt is short and returns a small JSON. Used only during quick-save when fields are empty.

`analyzeJobFlow` is still invoked for full analysis (match %, strengths, gaps, recommendations) — triggered separately, still stored in `analysis` jsonb column.

### 3. Client-side search and filter

The candidatures list is fetched once on mount. Search (keyword across jobTitle, company, role, industry) and all filters are applied in-memory in React. No new API endpoints needed.

Rationale: users typically have <100 active candidatures. Server-side search adds complexity with no benefit at this scale.

### 4. Labels as a text array stored as JSONB

`labels` column is `jsonb` (array of strings). Stored as `["priority", "tech"]`. Rendered as chips. Users type a label and press Enter or comma to add; existing labels from their own candidatures are suggested via autocomplete.

Alternative considered — separate `labels` join table: overkill for a personal app with one user per account.

### 5. Status values

`status` varchar(50) already exists with default `'applied'`. Extended set:
`applied` | `in_progress` | `offer` | `rejected` | `withdrawn` | `archived`

This is a user-managed high-level status distinct from the 10 `candidatureStages` statuses. Shown as a colour-coded badge on each list card.

### 6. Most-recent-activity sort

`candidatures.updatedAt` is bumped in the existing `PATCH /:id/stages/:stageId` handler. List is sorted `ORDER BY updatedAt DESC` from the server. No additional logic needed.

### 7. Navigation: "Candidatures" collapsible group

Same pattern as the Profile group in `Layout.tsx`:
- `candidaturesOpen` state, auto-expands when `location.pathname.startsWith('/candidature')`
- Single sub-item: "📋 My Candidatures → /candidatures"
- Group label "Candidatures" is itself a link to `/candidatures`
- Replaces "New Candidature" and "Selection Process" top-level nav items

### 8. URL fetch failure handling

If the server cannot fetch or parse the job posting URL (network error, auth-gated page, unsupported format):
- Candidature is still saved with the URL and any manually entered fields
- Response includes `{ autoFillStatus: 'failed', autoFillReason: '...' }`
- Client shows a dismissible amber banner: "We couldn't extract job details from the URL — you can fill them in manually"
- No retry logic; user can edit the candidature later

## Risks / Trade-offs

- **LinkedIn URLs will always fail auto-fill** — LinkedIn requires auth for job postings. Mitigation: detect `linkedin.com` in the URL and skip fetch entirely, showing a specific banner "LinkedIn job pages require login — add details manually."
- **HTML parsing quality** — stripping tags from arbitrary job posting pages may produce noisy text. Mitigation: truncate to 8000 chars before sending to AI; AI is instructed to return "Not found" for fields it cannot determine.
- **`updatedAt` not bumped on notes-only edits** — stage notes currently don't trigger candidature `updatedAt`. Accepted trade-off; most-recent-activity is driven by stage status changes.
- **Breaking schema change** — new columns are all nullable so existing rows are unaffected. No data migration needed beyond running `drizzle-kit push`.

## Migration Plan

1. Add 6 columns to `candidatures` in `schema.ts`
2. Run `drizzle-kit generate` + `drizzle-kit push` against the running DB
3. Update `POST /candidatures` to accept new fields + URL fetch + `extractJobMetadataFlow`
4. Update `GET /candidatures` to return new fields
5. Build `Candidatures.tsx` hub page
6. Update `Layout.tsx` nav
7. Update `App.tsx` routes + redirects
8. Rebuild Docker image

Rollback: revert `schema.ts` change and redeploy — nullable columns cause no data loss.
