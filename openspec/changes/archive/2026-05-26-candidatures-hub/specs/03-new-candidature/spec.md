## MODIFIED Requirements

### Requirement: Input
The user MUST be able to start a new candidature by providing:
  - A link to the job description (LinkedIn, company website, etc.) — **required**
  - Role — optional (AI-filled from URL if left blank)
  - Seniority — optional (AI-filled from URL if left blank)
  - Location — optional (AI-filled from URL if left blank)
  - Work mode (On-site / Hybrid / Remote) — optional (AI-filled from URL if left blank)
  - Industry — optional (AI-filled from URL if left blank)
  - Labels — optional, multiple free-text tags
  - Status — optional, defaults to "Applied"
  - Additional info — optional free-text

The form is embedded in the Candidatures hub page at `/candidatures`, not on a standalone page.
The system MUST validate that the URL field is provided before saving.

#### Scenario: Successful candidature creation with URL only
- **WHEN** the user enters a job posting URL and clicks Save
- **THEN** the candidature is created; the server fetches the URL and AI fills in role, company, seniority, location, work mode, and industry; the card appears in the list with the extracted values

#### Scenario: Manual creation with all fields
- **WHEN** the user fills in the URL and all optional fields
- **THEN** the candidature is saved with the provided values (no AI auto-fill needed)

#### Scenario: URL missing
- **WHEN** the user clicks Save without entering a URL
- **THEN** a validation error is shown and no API call is made

## REMOVED Requirements

### Requirement: Job description text field required
**Reason**: Replaced by URL-first input model. The job description text is now fetched server-side from the provided URL; users no longer paste raw job description text to create a candidature.
**Migration**: Existing candidatures stored with `jobDescription` text are unaffected — the column remains in the DB. New candidatures are created via URL; `jobDescription` is populated server-side from the fetched URL content.
