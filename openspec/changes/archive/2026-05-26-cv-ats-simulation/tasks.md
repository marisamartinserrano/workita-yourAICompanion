## 1. AI Flow — Update cvAnalysisFlow

- [x] 1.1 In `server/ai/flows.ts`, replace the `atsFeedback` output field in `cvAnalysisFlow`'s Zod output schema with an `atsSimulation` object: `{ extractedFields: { name, email, phone, location, linkedinUrl, currentTitle, workHistory: string[], education: string[], skills: string[] }, atRiskContent: { element: string, reason: string }[], keywords: { present: string[], absent: string[] }, score: number, scoreTier: string, scoreExplanation: string }`
- [x] 1.2 Update the AI prompt in `cvAnalysisFlow` to instruct the model to produce the `atsSimulation` object instead of `atsFeedback`; prompt should model Greenhouse ATS behaviour; include inference rules for detecting tables/columns/text-boxes from text artifacts; include generic role-type keyword inference; include the 0–100 scoring criteria (contact info 20pts, structural parseability 30pts, keyword density 25pts, work history clarity 25pts)
- [x] 1.3 Update the JSON template in the prompt to show the exact `atsSimulation` shape; update the field count rules to keep the response compact (max 10 at-risk items, max 15 present keywords, max 10 absent keywords)
- [x] 1.4 Verify the `extractJson` helper and try/catch error logging remain in place

## 2. Frontend — Update CvAnalysisPanel

- [x] 2.1 In `src/pages/CvAnalysis.tsx`, update the TypeScript type for `cvAnalysisResult` to replace `atsFeedback` with `atsSimulation` (matching the new Zod schema shape)
- [x] 2.2 Remove the existing ATS feedback rendering block (the pass/warn/fail checklist) from `CvAnalysisPanel`
- [x] 2.3 Add graceful fallback: if the stored result has `atsFeedback` but no `atsSimulation`, render a soft prompt "Re-analyse your CV to see the ATS simulation" in the ATS section; leave all other sections (skills, experience, education, gaps) rendering normally
- [x] 2.4 Add an "ATS Simulation" section to `CvAnalysisPanel` with four sub-sections:
  - **Extracted Fields**: table/list showing each field (name, email, phone, location, LinkedIn, current title) with its detected value or "Not found" in grey italic; work history, education, skills shown as count summaries (e.g. "3 work entries detected")
  - **At-Risk Content**: list of `{ element, reason }` items with an amber warning icon; if array is empty show "No formatting risks detected" with a green check
  - **Keyword Presence**: present keywords as green chips, absent keywords as amber chips with a "Consider adding" label; note below stating "Keywords are role-type generic, not matched to a specific job description"
  - **Compatibility Score**: large score number with tier label coloured by tier (green ≥85, teal 70–84, amber 50–69, red <50); score explanation text below

## 3. Rebuild & Verify

- [x] 3.1 Run `docker compose up --build -d` to rebuild the server and client containers with the updated flow and UI
- [ ] 3.2 Upload a CV and run analysis; verify the ATS Simulation section renders with all four sub-sections
- [ ] 3.3 Verify that a CV with obvious table patterns (e.g. skills listed in columns) triggers at least one at-risk content item
- [ ] 3.4 Verify the score and tier label display correctly and the tier colour matches the score range
