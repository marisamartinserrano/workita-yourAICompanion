## ADDED Requirements

### Requirement: Position summary generation at candidature creation
When job description text is available during candidature creation, the system SHALL generate a compact structured position summary using an AI flow (`summarizePositionFlow`) and persist it on the candidature record. The summary SHALL be stored in a `positionSummary` column (nullable text) on the `candidatures` table. If generation fails or job description text is unavailable, the candidature SHALL still be saved with `positionSummary` set to `null`.

#### Scenario: Summary generated when job description is available
- **WHEN** a candidature is created and the server successfully fetches and strips job description text from the posting URL
- **THEN** `summarizePositionFlow` runs and the resulting summary is persisted as `positionSummary` on the candidature record

#### Scenario: Summary skipped when job description is unavailable
- **WHEN** a candidature is created but the URL fetch fails or the URL is a LinkedIn page
- **THEN** the candidature is saved with `positionSummary` set to `null` and no error is surfaced to the user

#### Scenario: Summary generation failure is non-fatal
- **WHEN** `summarizePositionFlow` throws an error during candidature creation
- **THEN** the candidature is still saved; `positionSummary` is `null`; no error is returned to the client

### Requirement: Position summary format
The position summary SHALL be plain text structured as labelled fields covering: role title and company, key responsibilities, must-have skills, nice-to-have skills, seniority signals, and a one-sentence company/team context extracted from the posting. The summary SHALL be derived from job description text truncated to 8000 characters. All fields SHALL fall back to "Not specified" when not mentioned in the posting.

#### Scenario: Summary contains role-specific requirements
- **WHEN** the job description includes required skills and responsibilities
- **THEN** the position summary reflects those specific requirements, not generic placeholders
