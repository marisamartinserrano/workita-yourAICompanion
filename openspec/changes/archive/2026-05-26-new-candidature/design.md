## Context

The New Candidature page submits a job description to `POST /api/candidatures`, which runs `analyzeJobFlow` and persists the result. The current `analyzeJobFlow` output schema covers match percentage, strengths, gaps, key differentiators, ATS keywords, CV recommendations, LinkedIn recommendations, and a company summary string — but does not extract structured role requirements (FR-04) or produce networking guidance (FR-12). The frontend results view renders all current fields but has no role requirements panel, no networking section, and no no-profile banner.

## Goals / Non-Goals

**Goals:**
- Extend `analyzeJobFlow` to output `roleRequirements` (skills, experience level, salary) and `networkingGuidance` (outreach tips)
- Add `hasProfile` to the `POST /candidatures` response so the client knows whether to render the no-profile banner
- Add role requirements, networking guidance, and conditional no-profile banner to `NewCandidature.tsx`

**Non-Goals:**
- Glossary auto-generation at candidature creation time (deferred to spec 06 — Glossary change)
- Persisting `roleRequirements` or `networkingGuidance` as separate DB columns (already stored inside the `analysis` JSONB field)
- Fetching live company data (analysis is prompt-based, not web-scraping)

## Decisions

**1. Extend `analyzeJobFlow` rather than add new flows**

`roleRequirements` and `networkingGuidance` are derived from the same job description that `analyzeJobFlow` already processes. Running a single AI call with an expanded prompt is faster and cheaper than two sequential calls.

Alternative: separate `roleRequirementsFlow` and `networkingGuidanceFlow`. Rejected — doubles AI latency with no benefit; both outputs depend only on the job description and candidate profile already in scope.

**2. `hasProfile` flag in `POST /candidatures` response body**

The route already fetches the candidate profile to pass to the AI. Adding `hasProfile: boolean` to the response body is a zero-cost addition. The frontend uses this to conditionally render the no-profile banner after analysis.

Alternative: client checks profile independently via `GET /profile`. Rejected — requires an extra round trip; the server already has this information.

**3. Networking guidance in the prompt, not a separate section**

`networkingGuidance` is an array of outreach tips (strings). It fits naturally in the expanded `analyzeJobFlow` output schema alongside existing recommendation arrays. No new data model or route is needed.

**4. Role requirements as a structured object, not flat fields**

`roleRequirements` is typed as `{ skills: string[], experienceLevel: string, salary: string }`. This mirrors how the data is used in the UI (skills as chips, experience and salary as labeled values) and keeps the AI output schema self-documenting.

## Risks / Trade-offs

- **Prompt length growth** → Adding `roleRequirements` and `networkingGuidance` to the prompt increases token usage per analysis call. Mitigation: the additions are compact instructions; Gemini 2.5 Flash handles the expanded schema well within its context window.
- **Salary extraction reliability** → Salary ranges are often absent or vague in job descriptions. Mitigation: `salary` field returns `"Not specified"` when not found; UI renders it conditionally.
- **`hasProfile` flag is not a security boundary** → It's a UX hint only; no analysis data is hidden from profileless users, per NFR-02. This is intentional.

## Open Questions

- Should `networkingGuidance` tips be role/company-specific (e.g. "search for the hiring manager at Stripe on LinkedIn") or generic best practices? → Aim for specific where possible; fall back to best-practice language when company/role detail is insufficient.
