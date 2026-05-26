## ADDED Requirements

### Requirement: ATS simulation panel shows extracted fields
The system SHALL display a structured panel showing what fields the ATS (modelled on Greenhouse) would successfully extract from the candidate's CV, including: full name, email address, phone number, location, LinkedIn URL, current job title, work history entries (company, title, dates), education entries (institution, degree, dates), and skills list. Fields not found in the CV SHALL be shown as "Not found".

#### Scenario: Extracted fields rendered after analysis
- **WHEN** the user runs CV analysis
- **THEN** the results panel shows a "What the ATS extracts" section listing each extracted field and its detected value (or "Not found")

#### Scenario: Missing contact field flagged
- **WHEN** the CV does not contain a phone number
- **THEN** the phone field in the extracted fields panel shows "Not found" with a visual indicator

### Requirement: ATS filtered content risks identified
The system SHALL display a list of CV elements that are at risk of being discarded or garbled by ATS parsing — such as tables, multi-column layouts, text boxes, inline graphics, and image-based headers. Each risk SHALL be described with the type of element detected and the reason it may cause parsing failure. If no risks are detected, a "No formatting risks detected" message SHALL be shown.

#### Scenario: Table risk detected
- **WHEN** the CV text contains patterns suggesting a table (e.g. repeated delimiter characters or aligned columns)
- **THEN** the "At-risk content" section lists "Table detected" with an explanation that ATS parsers may garble table content into unreadable text

#### Scenario: No risks detected
- **WHEN** the CV text shows no formatting risk patterns
- **THEN** the "At-risk content" section displays "No formatting risks detected" with a green indicator

### Requirement: ATS keyword presence report
The system SHALL display which ATS-critical keywords are present in the CV and which commonly expected keywords for the candidate's apparent role type are absent. Present keywords SHALL be shown in green; absent keywords SHALL be shown in amber. A note SHALL clarify that keywords are role-type generic (not matched against a specific job description).

#### Scenario: Present keywords shown in green
- **WHEN** the analysis identifies keywords present in the CV
- **THEN** they are shown as green chips in the keyword panel

#### Scenario: Absent keywords shown in amber
- **WHEN** the analysis identifies commonly expected keywords that are missing from the CV
- **THEN** they are shown as amber chips with a label "Consider adding"

### Requirement: ATS compatibility score
The system SHALL display a 0–100 ATS compatibility score with a tier label (Excellent ≥85 / Good 70–84 / Needs Work 50–69 / At Risk <50) and a 1–2 sentence explanation of the main factors driving the score.

#### Scenario: Score tier label matches score value
- **WHEN** the analysis returns a compatibility score of 72
- **THEN** the score is displayed as "72 — Good" with an appropriate colour indicator

#### Scenario: At Risk score shown prominently
- **WHEN** the analysis returns a compatibility score below 50
- **THEN** the score is displayed with a red "At Risk" label and the explanation is shown prominently

### Requirement: Graceful fallback for old analysis results
The system SHALL detect when a stored `cvAnalysisResult` does not contain the `atsSimulation` field (results from before this change) and SHALL display a prompt "Re-analyse your CV to see the ATS simulation" instead of the ATS section, without hiding the rest of the stored results.

#### Scenario: Old result displayed without error
- **WHEN** a stored CV analysis result contains `atsFeedback` but no `atsSimulation`
- **THEN** the skills, experience, education, and gaps sections render normally and the ATS section shows "Re-analyse your CV to see the ATS simulation"
