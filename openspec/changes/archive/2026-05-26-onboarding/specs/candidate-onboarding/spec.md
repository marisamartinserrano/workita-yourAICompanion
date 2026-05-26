## MODIFIED Requirements

### Requirement: Onboarding page layout
The onboarding/profile page SHALL be organised into three tabs: **Job Preferences**, **CV & Analysis**, and **LinkedIn**. Each tab groups related fields and AI output together, replacing the current single-scroll form.

#### Scenario: User navigates between tabs
- **WHEN** the user clicks the "CV & Analysis" tab
- **THEN** the CV textarea and analysis results panel are shown; the Job Preferences fields are hidden

### Requirement: CV analysis trigger
After saving profile data, the **CV & Analysis** tab SHALL display an "Analyse CV" button. Clicking it sends the saved CV to the AI and displays results inline. The button SHALL be disabled if no CV text has been saved.

#### Scenario: Analyse button triggers AI and shows results
- **WHEN** the user clicks "Analyse CV" with CV text saved
- **THEN** a loading indicator is shown, then the results panel displays: extracted skills, experience, education, gaps, and ATS feedback

#### Scenario: Analyse button disabled without CV
- **WHEN** the user visits the CV & Analysis tab with no CV text saved
- **THEN** the "Analyse CV" button is disabled and a hint reads "Save your CV first to run analysis"
