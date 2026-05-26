## Why

The candidate profile is the foundation for every AI-powered recommendation in Workita. Without a rich profile (CV, preferences, LinkedIn URL), the AI cannot personalise match scores, strengths, gaps, or interview prep. The onboarding flow must collect this data, persist it, and immediately analyse the CV to surface actionable feedback — making the first experience valuable from minute one.

## What Changes

- Add CV analysis AI flow: extract skills, experience, education, identify gaps, simulate ATS parsing
- Add LinkedIn recommendations AI flow: generate specific profile improvements with rationale
- Expose new `/profile/analyze` API endpoint that runs both AI flows against the saved CV + LinkedIn URL
- Redesign the Onboarding page into tabbed sections: Job Preferences / CV & Analysis / LinkedIn
- Show AI-generated analysis results inline on the page after save + analyse
- Display ATS simulation feedback (formatting, keywords, structure)

## Capabilities

### New Capabilities

- `cv-analysis`: AI analysis of pasted CV text — extracts skills/experience/education, identifies gaps, simulates ATS parsing, and suggests improvements
- `linkedin-recommendations`: AI-generated LinkedIn profile improvement recommendations based on CV content and LinkedIn algorithm best practices

### Modified Capabilities

- `candidate-onboarding`: Extends the existing onboarding form with AI analysis results panel, tabbed layout, and a trigger to run CV + LinkedIn analysis after saving

## Impact

- **`server/ai/flows.ts`** — add `cvAnalysisFlow` and `linkedinRecommendationsFlow`
- **`server/routes/profile.ts`** — add `POST /profile/analyze` endpoint
- **`server/routes/ai.ts`** — register the new AI route
- **`src/pages/Onboarding.tsx`** — full redesign: tabs, analysis results, loading states
- No schema changes required (CV text and LinkedIn URL already stored in `profiles` table)
