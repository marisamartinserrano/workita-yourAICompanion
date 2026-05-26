## MODIFIED Requirements

### Requirement: AI Analysis at candidature creation
When job description text is successfully fetched from the posting URL, the system SHALL run both `analyzeJobFlow` (when a candidate profile exists) and `summarizePositionFlow` (always), and persist their results on the candidature record. Both flows are non-fatal: a failure in either SHALL not prevent the candidature from being saved. The `positionSummary` result SHALL be stored in the new `positionSummary` column on the candidature record.

#### Scenario: Both flows run when job description is available and profile exists
- **WHEN** a candidature is created with a fetchable posting URL and the user has a candidate profile
- **THEN** both `analyzeJobFlow` and `summarizePositionFlow` complete; `matchPercentage`, `analysis`, and `positionSummary` are all persisted on the candidature

#### Scenario: Only summarizePositionFlow runs when no profile exists
- **WHEN** a candidature is created with a fetchable posting URL but the user has no candidate profile
- **THEN** `summarizePositionFlow` runs and `positionSummary` is stored; `analyzeJobFlow` is skipped; `matchPercentage` and `analysis` remain null

#### Scenario: Neither flow runs when job description is unavailable
- **WHEN** a candidature is created without fetchable job description text
- **THEN** neither `analyzeJobFlow` nor `summarizePositionFlow` run; all three fields remain null
