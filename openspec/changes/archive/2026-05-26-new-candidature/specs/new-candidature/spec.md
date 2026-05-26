## MODIFIED Requirements

### Requirement: AI analysis results display
The results view SHALL display all AI analysis output including: job title, company, match percentage, company summary, role requirements (skills, experience level, salary), strengths, gaps, key differentiators, ATS keywords, CV recommendations, LinkedIn recommendations, and networking guidance.

#### Scenario: Full results view after analysis
- **WHEN** AI analysis completes successfully
- **THEN** the results page displays all analysis sections: company summary, role requirements panel, match score, strengths, gaps, key differentiators, ATS keywords, CV recommendations, LinkedIn recommendations, and networking guidance

#### Scenario: Navigate to Selection Process
- **WHEN** the candidature is created and results are displayed
- **THEN** a "Track Selection Process" button is visible and navigates the user to the selection process tracker for this candidature

## ADDED Requirements

### Requirement: No-profile completion banner
The system SHALL display a banner on the analysis results view when the user has no saved profile, informing them that their match score and recommendations would be more personalised with a complete profile.

#### Scenario: Banner shown for profileless user
- **WHEN** the user submits a job description and has no saved profile
- **THEN** the results view shows a banner: "Complete your profile for a personalised match score" with a link to the Onboarding/Profile page

#### Scenario: No banner when profile exists
- **WHEN** the user submits a job description and has a saved profile
- **THEN** no completion banner is shown in the results view
