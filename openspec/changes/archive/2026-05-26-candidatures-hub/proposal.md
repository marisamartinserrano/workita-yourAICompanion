## Why

Candidatures are currently added through an isolated "New Candidature" page and listed under a separate "Selection Process" menu item — two disconnected surfaces that make it hard to manage a pipeline of applications. Users need a single, permanent hub where they can add, browse, search, and filter all their candidatures from one place.

## What Changes

- Add a **Candidatures** collapsible group to the left sidebar, replacing the standalone "New Candidature" and "Selection Process" top-level items
- New `/candidatures` hub page with two areas:
  - **Quick-add form** at the top: link to job posting (required), role, seniority, location, work mode, industry, labels, status, additional info — all optional except the link; if optional fields are left blank the AI auto-fills them from the job posting URL
  - **Candidatures list** below: all saved candidatures sorted by most recent activity, with keyword search and filters (company, role, seniority, industry, labels, work mode)
- **BREAKING**: `candidatures` DB table gains 6 new nullable columns: `seniority`, `location`, `workMode`, `industry`, `labels` (text array), `additionalInfo`; also adds `jobDescription` (text) to store the fetched posting text for AI auto-fill
- `POST /candidatures` accepts the new fields; when optional metadata fields are empty, the server fetches the URL, extracts job description text, and runs a lightweight AI extraction to fill them
- `GET /candidatures` returns the enriched fields for use in the list and filters
- `/candidature/new` route **redirects** to `/candidatures` (backwards compatibility)
- `SelectionProcessList` page (`/selection-process`) **merged** into the candidatures hub list; the route redirects to `/candidatures`

## Capabilities

### New Capabilities

- `candidatures-hub`: Single-page hub for managing all candidatures — quick-add form with AI auto-fill from job URL, searchable and filterable candidature list

### Modified Capabilities

- `03-new-candidature`: Candidature creation flow changes — form is now embedded in the hub at `/candidatures`; input changes from "job description text (required) + URL (optional)" to "URL (required) + metadata fields (optional, AI-filled)"; full AI analysis (match %, strengths, gaps) is preserved but triggered from the hub or on first open
- `00-navigation-menu`: "New Candidature" and "Selection Process" top-level items replaced by a "Candidatures" collapsible group (same pattern as Profile group) linking to `/candidatures`

## Impact

- `server/db/schema.ts`: 6 new nullable columns on `candidatures` table
- `drizzle/migrations/`: new migration SQL required
- `server/routes/candidatures.ts`: `POST /` updated to accept new fields + AI auto-fill from URL; `GET /` returns new fields; `updatedAt` bumped on stage patch
- `src/pages/Candidatures.tsx`: new page (hub)
- `src/pages/NewCandidature.tsx`: kept as redirect shim
- `src/pages/SelectionProcessList.tsx`: kept as redirect shim
- `src/components/Layout.tsx`: nav updated — "Candidatures" group replaces "New Candidature" and "Selection Process" items
- `src/App.tsx`: new `/candidatures` route added; `/candidature/new` and `/selection-process` redirect to `/candidatures`
- No new npm dependencies needed (URL fetch via built-in `fetch`; AI via existing `analyzeJobFlow`)
