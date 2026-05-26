## Why

The current CV Analysis page gives generic pass/warn/fail feedback on formatting and keywords, but candidates cannot see *what* an ATS like Greenhouse actually extracts from their CV or why certain content gets lost in parsing. Without a concrete simulation, candidates have no way to understand the risk of using tables, text boxes, or columns — common CV design choices that silently strip information.

## What Changes

- Replace the generic `atsFeedback` (4 category pass/warn/fail cards) in the CV Analysis page with a rich **ATS Simulation panel** modelled on Greenhouse's parsing behaviour
- The AI flow produces a structured simulation of what Greenhouse would extract vs. filter, broken into:
  - **Extracted fields**: name, email, phone, location, current title, work history entries, education entries, skills list
  - **Filtered / at-risk content**: specific CV elements (tables, columns, text boxes, graphics, headers/footers, inline images) detected or inferred from the CV text that ATS parsers typically discard
  - **Keyword presence**: which ATS-critical keywords (action verbs, role titles, tech terms) are present and which common ones for this type of role are absent
  - **Compatibility score**: 0–100 ATS compatibility rating with a short explanation
- Update `cvAnalysisFlow` output schema to replace `atsFeedback` with `atsSimulation`
- Update `CvAnalysis.tsx` to render the new simulation panel in place of the old ATS checklist

## Capabilities

### New Capabilities

- `cv-ats-simulation`: ATS parsing simulation panel showing extracted fields, filtered content risks, keyword presence, and a compatibility score for the uploaded CV

### Modified Capabilities

- `02-candidate-onboarding`: CV Analysis tab behaviour changes — `atsFeedback` array replaced by `atsSimulation` object with richer structure; **BREAKING** (schema change to `cvAnalysisResult` stored in DB)
- `08-cv-analysis`: ATS feedback section requirements updated to reflect simulation output

## Impact

- `server/ai/flows.ts`: `cvAnalysisFlow` output schema updated — `atsFeedback` array removed, `atsSimulation` object added
- `server/db/schema.ts`: `cvAnalysisResult` jsonb column stores the new shape (old stored results will be re-analysed on next click; no migration needed)
- `src/pages/CvAnalysis.tsx`: `CvAnalysisPanel` component updated to render `atsSimulation` instead of `atsFeedback`
- No new dependencies required
