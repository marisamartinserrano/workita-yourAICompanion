## Context

The existing onboarding page collects and persists 9 profile fields (role, seniority, industry, location, work mode, salary, preferred companies, CV text, LinkedIn URL) via a single form. The backend upserts a `profiles` row on save. No AI analysis is triggered from the profile page today — CV analysis only happens as a side effect of job analysis in `analyzeJobFlow`.

Spec 02 requires the onboarding page to surface AI-powered CV analysis (skills extraction, gap identification, ATS simulation) and LinkedIn recommendations directly on the profile page, independent of any candidature.

## Goals / Non-Goals

**Goals:**
- Add two new Genkit AI flows: `cvAnalysisFlow` and `linkedinRecommendationsFlow`
- Add `POST /api/profile/analyze` endpoint that runs both flows against saved profile data
- Redesign Onboarding page into three tabs: Job Preferences / CV & Analysis / LinkedIn
- Show AI analysis results inline with loading states and error handling
- Keep analysis results in component state only (session-only, no DB persistence needed)

**Non-Goals:**
- Persisting AI analysis results to the database (CV text is persisted; analysis output is derived on demand)
- File upload for CV (paste-only in v1)
- Fetching live LinkedIn profile data (URL only; recommendations based on CV content)
- Profile completeness score or progress indicator (future spec)

## Decisions

**1. Tabbed layout over single scrolling form**

The page has three distinct concerns (preferences, CV, LinkedIn) that benefit from separation. Tabs reduce visual overwhelm and allow the AI results panel to sit cleanly alongside its trigger section.

Alternative considered: accordion sections. Rejected because collapsing sections hides context when reviewing results.

**2. Analysis triggered on demand (not on save)**

A separate "Analyse CV" button triggers the AI call after saving. This keeps save fast (< 500ms) and makes the AI step explicit and repeatable.

Alternative: auto-trigger on save. Rejected — increases save latency and runs unnecessarily when only preferences change.

**3. Two focused AI flows instead of one combined flow**

`cvAnalysisFlow` and `linkedinRecommendationsFlow` are separate Genkit flows with distinct output schemas. This makes each independently callable, testable, and extendable.

Alternative: single `profileAnalysisFlow`. Rejected — mixes concerns and makes partial failures harder to handle.

**4. Analysis results in component state, not DB**

Analysis is derived from CV text, which is already persisted. Re-running analysis is cheap and always reflects the latest CV. Storing structured results adds schema complexity for little benefit in v1.

## Risks / Trade-offs

- **AI latency (NFR-01: ≤ 10s)** → Both flows run sequentially via a single `/profile/analyze` call. If total time exceeds 10s, switch to parallel Promise.all on the server. Mitigation: monitor response times post-deploy.
- **Gemini JSON parsing** → AI flows use `JSON.parse(text)` which will throw on malformed output. Mitigation: wrap in try/catch; return structured error to client.
- **No LinkedIn data fetch** → Recommendations are based solely on CV content and best-practice prompting, not the actual LinkedIn profile. This is a known limitation; noted in the UI.

## Open Questions

- Should the LinkedIn recommendations panel show a "Why this matters" explainer section (FR-10 asks for rationale + brief LinkedIn algorithm explanation)? → Yes, include as a collapsible info block above the recommendations list.
