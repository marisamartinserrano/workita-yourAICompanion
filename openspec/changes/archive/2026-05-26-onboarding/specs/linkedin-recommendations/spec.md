## ADDED Requirements

### Requirement: LinkedIn profile recommendations
The system SHALL generate specific, actionable recommendations to improve the candidate's LinkedIn profile, based on their CV content and LinkedIn algorithm best practices (profile summary, skills section, headline, consistency with CV, ATS filtering).

#### Scenario: Recommendations generated after analysis
- **WHEN** CV analysis completes and a LinkedIn URL is saved
- **THEN** the LinkedIn tab displays a list of specific improvement recommendations, each with a rationale explaining why the change matters

### Requirement: LinkedIn algorithm explainer
The system SHALL display a brief, collapsible explanation of how LinkedIn's algorithm works for candidates — covering profile completeness, keyword matching, and recruiter search behaviour — above the recommendations list.

#### Scenario: Explainer visible before recommendations
- **WHEN** the user views the LinkedIn tab after analysis
- **THEN** they see a collapsible "How LinkedIn works for candidates" section above the recommendations list

### Requirement: Recommendations without LinkedIn URL
The system SHALL still generate LinkedIn recommendations based on CV content alone if no LinkedIn URL is provided, noting that recommendations are generic without a profile URL.

#### Scenario: Recommendations work without URL
- **WHEN** the user triggers analysis without a LinkedIn URL saved
- **THEN** LinkedIn recommendations are still generated, with a note that results would be more specific with a LinkedIn URL
