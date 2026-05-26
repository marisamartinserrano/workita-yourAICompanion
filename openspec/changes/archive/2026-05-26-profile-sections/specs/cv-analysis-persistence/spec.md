## ADDED Requirements

### Requirement: CV analysis results persisted to database
The system SHALL save the CV analysis result (skills, experience, education, gaps, ATS feedback) to the `profiles` table after every successful analysis run. The stored result SHALL be loaded and displayed automatically when the user navigates to the CV Analysis page.

#### Scenario: Analysis result displayed on return visit
- **WHEN** the user navigates to the CV Analysis page and a stored analysis result exists
- **THEN** the analysis panel is shown immediately without requiring the user to re-run analysis; a timestamp shows when the analysis was last run

#### Scenario: Analysis result saved after running
- **WHEN** the user clicks "Analyse CV" and analysis completes successfully
- **THEN** the result is saved to the database and displayed on screen; subsequent page visits show the saved result

#### Scenario: No stored analysis on first visit
- **WHEN** the user navigates to the CV Analysis page for the first time with no prior analysis
- **THEN** the analysis panel is empty and an "Analyse CV" button is shown (enabled only if a CV has been uploaded)

### Requirement: LinkedIn analysis results persisted to database
The system SHALL save the LinkedIn analysis result (suitability strengths, gaps, harmonization tips, profile recommendations) to the `profiles` table after every successful analysis run. The stored result SHALL be loaded and displayed automatically when the user navigates to the LinkedIn Analysis page.

#### Scenario: LinkedIn analysis result displayed on return visit
- **WHEN** the user navigates to the LinkedIn Analysis page and a stored analysis result exists
- **THEN** the analysis panel is shown immediately with a timestamp of when it was last run

#### Scenario: LinkedIn analysis result saved after running
- **WHEN** the user triggers LinkedIn analysis and it completes successfully
- **THEN** the result is saved to the database and displayed; subsequent visits show the saved result
