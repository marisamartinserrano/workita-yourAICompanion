## ADDED Requirements

### Requirement: Networking outreach guidance
The system SHALL generate and display role-specific networking guidance after job analysis, providing actionable tips for reaching out to the recruiter, hiring manager, and relevant company employees via LinkedIn or email.

#### Scenario: Networking guidance shown after analysis
- **WHEN** AI analysis completes
- **THEN** the results view shows a "Networking" section with a list of outreach tips specific to the role and company

#### Scenario: Networking guidance without company detail
- **WHEN** AI analysis completes but the job description contains limited company or contact information
- **THEN** the networking guidance falls back to best-practice outreach tips (e.g. how to find the hiring manager on LinkedIn, connection request messaging advice)
