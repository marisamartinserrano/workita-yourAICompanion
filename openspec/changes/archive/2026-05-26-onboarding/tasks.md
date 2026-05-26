## 1. AI Flows

- [x] 1.1 Add `cvAnalysisFlow` to `server/ai/flows.ts` — input: cvText; output: skills[], experience[], education[], gaps[], atsFeedback[]
- [x] 1.2 Add `linkedinRecommendationsFlow` to `server/ai/flows.ts` — input: cvText, linkedinUrl?; output: recommendations[]{text, rationale}, hasLinkedinUrl
- [x] 1.3 Wrap AI JSON parsing in try/catch in both flows; return structured error on failure

## 2. Backend API

- [x] 2.1 Add `POST /api/profile/analyze` route to `server/routes/profile.ts`
- [x] 2.2 Route fetches saved profile for the authenticated user, runs cvAnalysisFlow + linkedinRecommendationsFlow, returns combined result
- [x] 2.3 Return 400 if no CV text is saved on the profile

## 3. Frontend — Onboarding Page Redesign

- [x] 3.1 Add tab state to `Onboarding.tsx` with three tabs: Job Preferences / CV & Analysis / LinkedIn
- [x] 3.2 Render tab bar with active indicator and keyboard navigation (arrow keys)
- [x] 3.3 Job Preferences tab: move all 7 preference fields and Save button into this tab
- [x] 3.4 CV & Analysis tab: CV textarea + Save button + "Analyse CV" trigger button
- [x] 3.5 Disable "Analyse CV" button when `form.cvText` is empty; show hint text
- [x] 3.6 LinkedIn tab: LinkedIn URL field + Save button + LinkedIn recommendations panel

## 4. Frontend — CV Analysis Results Panel

- [x] 4.1 Add `cvAnalysis` state to hold analysis results (null until triggered)
- [x] 4.2 Show loading spinner while analysis is running (POST to `/profile/analyze`)
- [x] 4.3 Render extracted skills as tags/chips
- [x] 4.4 Render experience and education as a summary list
- [x] 4.5 Render gaps as a warning list with actionable suggestions
- [x] 4.6 Render ATS feedback as a checklist with pass/warn/fail indicators

## 5. Frontend — LinkedIn Recommendations Panel

- [x] 5.1 Add `linkedinRecs` state to hold recommendations (null until triggered)
- [x] 5.2 Add collapsible "How LinkedIn works for candidates" explainer section
- [x] 5.3 Render each recommendation with its rationale
- [x] 5.4 Show note when no LinkedIn URL is saved ("Results would be more specific with your LinkedIn URL")

## 6. Spec & OpenSpec Artifacts

- [x] 6.1 Update `openspec/specs/02-candidate-onboarding/spec.md` acceptance criteria to checked
- [x] 6.2 Add Implementation section to spec
