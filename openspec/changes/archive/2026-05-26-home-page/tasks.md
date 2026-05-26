# Tasks: Home Page Dashboard (Spec 01)

## Backend

- [x] Enrich `GET /candidatures` to join `candidature_stages` and return `currentStage`
- [x] Add `isInInterview` boolean flag (server-side set lookup against 8 interview stage names)
- [x] Import `inArray` from drizzle-orm for single-query stage fetch (no N+1)

## Frontend — Dashboard

- [x] Add `currentStage` and `isInInterview` to `Candidature` interface
- [x] Stats panel: total applications, interviewing count, offers count, avg match %
- [x] `StatCard` component with icon, value, label, optional sub-label
- [x] `MatchBadge` component — colour-coded green/amber/red by threshold
- [x] Active candidatures list with stage badge (colour per stage) and match %
- [x] Loading skeleton (3 `animate-pulse` placeholder rows)
- [x] Empty state with direct CTA button linking to New Candidature
- [x] Quick actions: New Candidature, Update Profile, Practice Quizzes
- [x] Welcome message with user first name from Google SSO

## Frontend — Layout / Navigation

- [x] Add "My Profile" (Onboarding) to desktop sidebar nav
- [x] Add mobile bottom nav bar (fixed, 5 icons)
- [x] Active link detection supports prefix matching (e.g. `/candidature/*`)

## Spec

- [x] All 7 acceptance criteria marked as complete in `openspec/specs/01-home-page/spec.md`
- [x] Implementation notes added to spec (date, commit reference, decisions)
