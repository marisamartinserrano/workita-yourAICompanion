## MODIFIED Requirements

### Requirement: Navigation sections
The navigation menu MUST include the following top-level sections in order:
  1. **Home** — Dashboard with job search progress overview
  2. **Profile** (collapsible group) — Job Preferences, CV Analysis, LinkedIn Analysis
  3. **Candidatures** (collapsible group) — My Candidatures hub at `/candidatures`
  4. **Closing** — Close a candidature and provide feedback
  5. **Glossary** — Key terms and concepts
  6. **Quizzes** — Playful practice quizzes

The **Candidatures** group SHALL follow the same collapsible pattern as the Profile group:
  - Group label is itself a link to `/candidatures`
  - Auto-expands when the current route starts with `/candidature`
  - Sub-item: 📋 My Candidatures → `/candidatures`

#### Scenario: Candidatures group auto-expands on candidature routes
- **WHEN** the user is on `/candidature/:id`
- **THEN** the Candidatures group in the sidebar is expanded and highlighted

#### Scenario: Clicking Candidatures navigates to hub
- **WHEN** the user clicks the "Candidatures" group label in the sidebar
- **THEN** they are taken to `/candidatures`

## REMOVED Requirements

### Requirement: Standalone New Candidature and Selection Process menu items
**Reason**: Replaced by the "Candidatures" collapsible group. The hub at `/candidatures` serves both functions — adding new candidatures and listing existing ones.
**Migration**: `/candidature/new` redirects to `/candidatures`. `/selection-process` redirects to `/candidatures`.
