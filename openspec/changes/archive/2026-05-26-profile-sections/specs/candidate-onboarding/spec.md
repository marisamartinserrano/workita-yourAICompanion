## MODIFIED Requirements

### Requirement: Onboarding page layout
The profile sections SHALL be organised as three separate pages accessible from the left navigation under a collapsible **Profile** group, replacing the previous three-tab layout on a single `/onboarding` route.

- **Job Preferences** at `/profile` — target role, seniority, industry, location, work mode, salary, preferred companies
- **CV Analysis** at `/profile/cv-analysis` — CV file upload, analysis trigger, persisted analysis results
- **LinkedIn Analysis** at `/profile/linkedin-analysis` — LinkedIn URL input, suitability analysis trigger, persisted results

#### Scenario: User navigates to Job Preferences
- **WHEN** the user clicks "Job Preferences" in the Profile group in the sidebar
- **THEN** they are taken to `/profile` showing only the job preferences form

#### Scenario: User navigates to CV Analysis
- **WHEN** the user clicks "CV Analysis" in the Profile group in the sidebar
- **THEN** they are taken to `/profile/cv-analysis` showing the CV upload section and any stored analysis results

#### Scenario: User navigates to LinkedIn Analysis
- **WHEN** the user clicks "LinkedIn Analysis" in the Profile group in the sidebar
- **THEN** they are taken to `/profile/linkedin-analysis` showing the LinkedIn URL field and any stored analysis results

## REMOVED Requirements

### Requirement: CV text paste input
**Reason**: Replaced by CV file upload (PDF, .doc, .docx). File upload provides a better user experience and enables future file-based features. Text extraction from the uploaded file replaces manual paste.
**Migration**: Existing `cvText` values in the database are preserved and continue to be used for AI analysis. Users who previously pasted CV text can upload a file to replace it; the extracted text overwrites the stored `cvText`.
