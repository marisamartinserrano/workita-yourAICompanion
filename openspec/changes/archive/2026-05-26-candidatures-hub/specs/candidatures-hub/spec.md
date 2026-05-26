## ADDED Requirements

### Requirement: Candidatures hub page
The system SHALL provide a `/candidatures` page accessible from the sidebar that serves as the single hub for all candidature management. The page SHALL display a quick-add form at the top and the candidatures list below.

#### Scenario: Navigating to the hub
- **WHEN** the user clicks "Candidatures" in the left sidebar
- **THEN** they are taken to `/candidatures` showing the add form and their candidatures list

#### Scenario: Empty state
- **WHEN** the user has no saved candidatures
- **THEN** the list area shows an empty state message inviting them to add their first candidature

### Requirement: Quick-add form with required URL
The system SHALL display a form with the following fields: job posting URL (required), role (optional), seniority (optional), location (optional), work mode — On-site / Hybrid / Remote (optional), industry (optional), labels (optional, multiple free-text tags), status (optional, defaults to "Applied"), and additional info (optional free-text). The form SHALL prevent submission if the URL field is empty.

#### Scenario: URL required validation
- **WHEN** the user clicks "Save" with an empty URL field
- **THEN** the form shows a validation error and does not submit

#### Scenario: Successful manual save with all fields
- **WHEN** the user fills in the URL and all optional fields and clicks "Save"
- **THEN** the candidature is saved and appears at the top of the list

### Requirement: AI auto-fill from job posting URL
The system SHALL, when optional metadata fields (role, seniority, location, work mode, industry) are left empty at save time, attempt to fetch the job posting URL server-side and use AI to extract those fields. Extracted values SHALL be saved to the candidature and reflected in the list immediately. If extraction fails (network error, auth-gated URL), the candidature SHALL still be saved and a dismissible warning banner SHALL inform the user.

#### Scenario: Auto-fill succeeds
- **WHEN** the user submits the form with only the URL
- **THEN** the saved candidature card shows the AI-extracted role, company, seniority, location, work mode, and industry

#### Scenario: LinkedIn URL auto-fill skipped
- **WHEN** the user submits a URL from linkedin.com
- **THEN** the candidature is saved and a banner reads "LinkedIn job pages require login — add details manually"

#### Scenario: Auto-fill fails for other URLs
- **WHEN** the server cannot fetch or parse the job posting URL
- **THEN** the candidature is saved with the manually entered fields only and a banner reads "We couldn't extract job details from the URL — you can fill them in manually"

### Requirement: Labels as user-defined tags
The system SHALL allow users to add multiple free-text labels to a candidature (e.g., "priority", "fintech", "referral"). Labels SHALL be entered by typing and pressing Enter or comma. Existing labels from the user's own candidatures SHALL be suggested via a dropdown as the user types. Labels SHALL be rendered as chips on the candidature card in the list.

#### Scenario: Adding a label
- **WHEN** the user types "priority" and presses Enter in the labels field
- **THEN** "priority" appears as a chip in the labels field and is saved with the candidature

#### Scenario: Label autocomplete from existing labels
- **WHEN** the user types "pri" in the labels field and they already have a candidature labelled "priority"
- **THEN** "priority" appears as a suggestion in the dropdown

### Requirement: Candidature status badge
The system SHALL allow users to set a high-level candidature status from: Applied, In Progress, Offer, Rejected, Withdrawn, Archived. The status SHALL default to "Applied" on creation. The status SHALL be displayed as a colour-coded badge on each candidature card. Users SHALL be able to change the status from the list card or the detail view.

#### Scenario: Default status on creation
- **WHEN** a new candidature is saved without a status
- **THEN** it appears in the list with the "Applied" badge

#### Scenario: Status updated from list
- **WHEN** the user changes the status of a candidature to "Rejected" from the list card
- **THEN** the badge updates immediately and the change is persisted

### Requirement: Candidatures list sorted by most recent activity
The system SHALL display all of the user's candidatures sorted by most recent activity (`updatedAt` descending). Activity includes: creating the candidature, updating any stage status, and editing candidature metadata.

#### Scenario: Most recently active candidature appears first
- **WHEN** the user marks a stage as completed on candidature B while candidature A was added more recently
- **THEN** candidature B appears above candidature A in the list

### Requirement: Keyword search
The system SHALL provide a search input that filters the candidatures list in real time by keyword. The keyword SHALL be matched against: job title, company name, role, and industry (case-insensitive). Results SHALL update as the user types with no debounce required.

#### Scenario: Keyword search filters list
- **WHEN** the user types "frontend" in the search input
- **THEN** only candidatures with "frontend" in their title, company, role, or industry are shown

#### Scenario: No results message
- **WHEN** the search or filter combination returns no candidatures
- **THEN** a "No candidatures match your search" message is displayed

### Requirement: Candidature list filters
The system SHALL provide filter controls for: company, role, seniority, industry, labels, and work mode. Multiple filter values within the same dimension SHALL be combined with OR logic. Filters across dimensions SHALL be combined with AND logic. Active filters SHALL be displayed and individually dismissible.

#### Scenario: Filtering by seniority
- **WHEN** the user selects "Senior" from the seniority filter
- **THEN** only candidatures with seniority "Senior" are shown

#### Scenario: Multiple filters active
- **WHEN** the user filters by seniority "Senior" AND work mode "Remote"
- **THEN** only candidatures that are both Senior and Remote are shown

#### Scenario: Dismissing a filter
- **WHEN** the user clicks the × on an active filter chip
- **THEN** that filter is removed and the list updates accordingly

### Requirement: Candidature card navigation to detail
Each candidature card in the list SHALL display: company, job title, match % (if analysis has been run), current stage, status badge, work mode, seniority, industry, labels, and creation date. Clicking a card SHALL navigate to the SelectionProcess detail page for that candidature (`/candidature/:id`).

#### Scenario: Clicking a candidature card
- **WHEN** the user clicks on a candidature card in the list
- **THEN** they are taken to `/candidature/:id` for that candidature

#### Scenario: Match % shown when analysis available
- **WHEN** a candidature has a stored `matchPercentage`
- **THEN** the card displays the match % with a colour indicator
