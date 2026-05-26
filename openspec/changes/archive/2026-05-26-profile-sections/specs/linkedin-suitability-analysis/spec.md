## ADDED Requirements

### Requirement: LinkedIn profile suitability analysis
The system SHALL analyse how well the candidate's LinkedIn profile positions them for their target role, using the target role, industry, and seniority level from Job Preferences as context. The analysis SHALL identify suitability strengths, gaps, and specific recommendations to improve the profile.

#### Scenario: Suitability analysis with full profile context
- **WHEN** the user triggers LinkedIn analysis with a LinkedIn URL saved, CV uploaded, and Job Preferences filled (role, industry, seniority)
- **THEN** the analysis returns: suitability strengths (what the profile does well for the target role), suitability gaps (what is missing or misaligned), and specific improvement recommendations each with a rationale

#### Scenario: Analysis without LinkedIn URL
- **WHEN** the user triggers LinkedIn analysis with no LinkedIn URL saved
- **THEN** analysis still runs based on CV content and Job Preferences alone, with a notice: "Add your LinkedIn URL for a more targeted assessment"

#### Scenario: Analysis without Job Preferences
- **WHEN** the user triggers LinkedIn analysis with no target role, industry, or seniority set
- **THEN** analysis still runs with a notice: "Complete your Job Preferences for a role-specific assessment"

### Requirement: CV and LinkedIn harmonization recommendations
The system SHALL compare the candidate's CV content and LinkedIn profile and identify inconsistencies or missed opportunities to align the two, presenting specific harmonization tips.

#### Scenario: Harmonization tips shown after analysis
- **WHEN** LinkedIn analysis completes and both CV text and LinkedIn URL are available
- **THEN** the results include a dedicated "Harmonize with your CV" section listing specific actions to align the LinkedIn profile with the CV content

### Requirement: LinkedIn algorithm explainer retained
The system SHALL continue to display the collapsible "How LinkedIn works for candidates" explainer section on the LinkedIn Analysis page.

#### Scenario: Explainer visible on LinkedIn Analysis page
- **WHEN** the user views the LinkedIn Analysis page
- **THEN** a collapsible "How LinkedIn works for candidates" section is present above the analysis results
