## MODIFIED Requirements

### Requirement: ATS Simulation Feedback
The system SHALL simulate how an ATS (modelled on Greenhouse) would parse the CV and provide a structured simulation covering:
  - **Extracted fields**: what the ATS would successfully parse (name, contact info, work history, education, skills)
  - **At-risk content**: CV elements that may be discarded or garbled (tables, multi-column layouts, text boxes, graphics, image-based headers)
  - **Keyword presence**: which ATS-critical keywords are present and which commonly expected keywords for the role type are absent
  - **Compatibility score**: 0–100 score with tier label (Excellent / Good / Needs Work / At Risk) and a brief explanation

#### Scenario: ATS simulation panel shown after analysis
- **WHEN** the user runs CV analysis
- **THEN** the results panel shows an "ATS Simulation" section with extracted fields, at-risk content, keyword presence, and a compatibility score

#### Scenario: Old result handled gracefully
- **WHEN** a stored `cvAnalysisResult` does not contain `atsSimulation`
- **THEN** the ATS section shows "Re-analyse your CV to see the ATS simulation" without hiding other stored results

## REMOVED Requirements

### Requirement: ATS pass/warn/fail checklist
**Reason**: Replaced by the richer ATS Simulation panel (extracted fields, at-risk content, keywords, score) introduced by the `cv-ats-simulation` change. The four-item pass/warn/fail array (`atsFeedback`) is no longer part of the AI flow output schema.
**Migration**: Any stored `cvAnalysisResult` containing `atsFeedback` will continue to display other sections (skills, experience, education, gaps) normally. The ATS section will prompt the user to re-analyse to generate the new simulation output.
