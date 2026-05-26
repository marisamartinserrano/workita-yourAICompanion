## ADDED Requirements

### Requirement: Role requirements extraction
The system SHALL extract and display structured role requirements from the job description, including: a list of required skills, the expected experience level, and the salary range (if mentioned).

#### Scenario: Role requirements displayed after analysis
- **WHEN** the user clicks "Analyse Job" and AI analysis completes
- **THEN** the results view shows a "Role Requirements" panel with a list of required skills as chips, the experience level as a labelled value, and the salary range (or "Not specified" if absent)

#### Scenario: Salary not mentioned in job description
- **WHEN** AI analysis completes and the job description contains no salary information
- **THEN** the salary field displays "Not specified" and no error or empty state is shown
