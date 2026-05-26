## 1. AI Flow — Extend analyzeJobFlow

- [x] 1.1 Add `roleRequirements` to `analyzeJobFlow` output schema in `server/ai/flows.ts` — shape: `{ skills: string[], experienceLevel: string, salary: string }`
- [x] 1.2 Add `networkingGuidance` to `analyzeJobFlow` output schema — shape: `string[]`
- [x] 1.3 Update the `analyzeJobFlow` prompt to instruct the AI to extract `roleRequirements` and generate `networkingGuidance` tips
- [x] 1.4 Wrap the `analyzeJobFlow` JSON.parse in try/catch; return structured error on failure

## 2. Backend API — POST /candidatures

- [x] 2.1 Add `hasProfile: boolean` to the `POST /candidatures` response body in `server/routes/candidatures.ts` (true if a profile row exists for the user)

## 3. Frontend — Results View

- [x] 3.1 Update `Analysis` interface in `NewCandidature.tsx` to include `roleRequirements` and `networkingGuidance`
- [x] 3.2 Update `Candidature` interface (or API response type) to include `hasProfile: boolean`
- [x] 3.3 Add no-profile banner: render a dismissible info banner when `hasProfile` is false, with a link to `/onboarding`
- [x] 3.4 Add Role Requirements panel: display `roleRequirements.skills` as chips, `experienceLevel` and `salary` as labelled values
- [x] 3.5 Add Networking Guidance section: render `networkingGuidance` as a bulleted list with a 🤝 heading
- [x] 3.6 Position new panels in the results layout: Role Requirements below Company Summary; Networking Guidance below LinkedIn Recommendations

## 4. Spec & OpenSpec Artifacts

- [x] 4.1 Update `openspec/specs/03-new-candidature/spec.md` acceptance criteria to checked
- [x] 4.2 Add Implementation section to spec
