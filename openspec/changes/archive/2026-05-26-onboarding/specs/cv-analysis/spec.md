## ADDED Requirements

### Requirement: CV skills and experience extraction
The system SHALL analyse the candidate's pasted CV text using AI and extract: a list of identified skills, years/areas of experience, and education qualifications.

#### Scenario: CV analysis returns structured skills
- **WHEN** the user clicks "Analyse CV" after saving a non-empty CV
- **THEN** the page displays a list of extracted skills, experience summary, and education details returned by the AI

### Requirement: CV gap identification
The system SHALL identify gaps or weak areas in the CV — such as missing quantified achievements, absent keywords, or thin descriptions — and present them as actionable improvement suggestions.

#### Scenario: Gaps are surfaced as suggestions
- **WHEN** CV analysis completes
- **THEN** the user sees a list of identified gaps with specific, actionable improvement suggestions for each

### Requirement: ATS simulation feedback
The system SHALL simulate how an ATS (Applicant Tracking System) would parse the CV and provide feedback on formatting, keyword density, and structure that may cause the CV to be filtered out.

#### Scenario: ATS feedback shown after analysis
- **WHEN** CV analysis completes
- **THEN** the user sees an ATS compatibility assessment including: formatting issues, missing keywords, and structural recommendations

### Requirement: Analysis requires saved CV
The system SHALL prevent analysis from running if the CV text field is empty, showing an inline prompt to paste CV content first.

#### Scenario: Empty CV blocks analysis
- **WHEN** the user clicks "Analyse CV" with no CV text saved
- **THEN** the button is disabled or an inline message instructs the user to paste their CV first
