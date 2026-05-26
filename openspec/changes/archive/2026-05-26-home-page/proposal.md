# Proposal: Home Page Dashboard (Spec 01)

## Summary

Implement the Home Page dashboard as defined in `openspec/specs/01-home-page/spec.md`. This is the first screen users see after logging in via Google SSO and the central hub for tracking job search progress.

## Problem Statement

After login, users have no overview of their job search status. They need a single page that surfaces key metrics, active applications, and shortcuts to the most common actions — without having to navigate to multiple sections.

## Proposed Solution

Build a responsive dashboard page at `/dashboard` that:

1. **Greets the user by first name** (retrieved from Google SSO profile)
2. **Shows 4 summary stats** — Total applications, Active interview stages, Offers received, Average match %
3. **Lists active candidatures** with job title, company, current stage (from `candidature_stages` table), and match % colour-coded by score
4. **Provides 3 quick-action cards** — New Candidature, Update Profile, Practice Quizzes
5. **Shows an empty state** with CTA when no candidatures exist

## Scope

**In scope:**
- `src/pages/Dashboard.tsx` — full redesign
- `src/components/Layout.tsx` — add My Profile nav link, mobile bottom nav
- `server/routes/candidatures.ts` — enrich GET `/candidatures` with `currentStage` and `isInInterview` fields

**Out of scope:**
- Candidature detail page (Spec 03/04)
- Profile editing (Spec 02)
- Notifications or real-time updates

## Acceptance Criteria

See `openspec/specs/01-home-page/spec.md` — all criteria implemented.
