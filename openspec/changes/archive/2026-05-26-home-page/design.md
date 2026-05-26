# Design: Home Page Dashboard (Spec 01)

## Architecture

### Backend change — `server/routes/candidatures.ts`

The `GET /candidatures` route was enriched to return two new fields per candidature:

| Field | Type | Description |
|-------|------|-------------|
| `currentStage` | `string` | Derived from `candidature_stages`: first `scheduled`, else last `completed`, else first `pending` |
| `isInInterview` | `boolean` | `true` if `currentStage` is one of the 8 interview stages |

A single extra query fetches all stages for the user's candidatures using `inArray`, avoiding N+1 queries.

```
GET /api/candidatures
→ candidatures[] + currentStage + isInInterview
```

### Frontend — `src/pages/Dashboard.tsx`

Stats are computed client-side from the enriched candidature list:

| Stat | Computation |
|------|-------------|
| Total applications | `candidatures.length` |
| Interviewing | `candidatures.filter(c => c.isInInterview).length` |
| Offers | `candidatures.filter(c => c.status === 'offer' \|\| c.currentStage === 'Offer received').length` |
| Avg match % | `sum(matchPercentage) / length`, shown as `—` when empty |

### Frontend — `src/components/Layout.tsx`

- Desktop: persistent left sidebar (56px wide), active link highlighted with `bg-primary-50`
- Mobile: fixed bottom nav bar with icon + truncated label

## Key Design Decisions

1. **Current stage from `candidature_stages`, not `candidatures.status`** — The `status` field on the candidature (`applied`, `interviewing`, `offer`, `rejected`) is coarse-grained. The actual position in the pipeline is more accurately represented by the active stage row in `candidature_stages`.

2. **Interview count via `isInInterview` flag** — Computed server-side using a `Set` lookup against the 8 known interview stage names. This avoids fragile string comparisons on the frontend.

3. **Match % colour coding** — Green ≥75%, amber ≥50%, red <50%. Matches common traffic-light conventions used in ATS tools.

4. **Loading skeleton** — Three placeholder `animate-pulse` divs shown while fetching, preventing layout shift.

5. **Empty state with direct CTA** — When no candidatures exist, a full-width empty state card is shown with a primary CTA button rather than a plain text link, reducing friction for new users.

## Component Structure

```
Dashboard
├── Welcome header (FR-07)
├── Stats panel — 4 StatCard components (FR-03)
├── Quick actions — 3 Link cards (FR-05)
└── Applications list (FR-04)
    ├── Loading skeleton
    ├── Empty state (FR-06)
    └── Candidature rows with MatchBadge + stage badge
```
