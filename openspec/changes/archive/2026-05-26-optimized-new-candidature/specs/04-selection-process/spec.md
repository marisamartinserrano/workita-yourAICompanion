## MODIFIED Requirements

### Requirement: AI Interview Preparation
The system SHALL generate interview preparation content for a selected stage using: the job title, company name, interview stage, candidate background (when available), and the position summary stored on the candidature (when available). When a position summary is present, the generated questions, tips, and sample answers SHALL be grounded in the specific responsibilities, must-have skills, and context of that posting rather than generic role-level content. When the position summary is absent, the system SHALL fall back to title-and-company-only generation as today.

#### Scenario: Interview prep with position summary available
- **WHEN** the user selects an interview stage for a candidature that has a stored `positionSummary`
- **THEN** the AI generates 5 questions and sample answers that directly reference the specific skills, responsibilities, and context described in the job posting

#### Scenario: Interview prep without position summary (fallback)
- **WHEN** the user selects an interview stage for a candidature where `positionSummary` is `null`
- **THEN** the AI generates interview prep using only the job title and company name, as it does today

#### Scenario: Position summary passed through the API
- **WHEN** the frontend calls `POST /ai/interview-prep` with a `positionSummary` field
- **THEN** the route forwards it to `interviewPrepFlow` and includes it in the generation prompt
