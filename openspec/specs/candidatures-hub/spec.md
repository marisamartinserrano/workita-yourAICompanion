# Spec: Candidatures Hub

## Overview

The Candidatures Hub is the central page for managing all job applications in Workita. It consolidates candidature creation and tracking into a single view, replacing the standalone New Candidature page and Selection Process list. Users can add candidatures via a quick-add form, browse their existing applications, and search or filter the list — all from `/candidatures`.

## Requirements

### Functional Requirements

**Hub page**
- FR-01: The system SHALL provide a `/candidatures` page accessible from the sidebar that serves as the single hub for all candidature management.
- FR-02: The page SHALL display a collapsible quick-add form at the top and the candidatures list below.
- FR-03: When the user has no saved candidatures, the list area SHALL show an empty state message inviting them to add their first candidature.

**Quick-add form**
- FR-04: The form SHALL include the following fields: job posting URL (required), company (optional, AI-filled), role (optional, AI-filled), seniority (optional, AI-filled — dropdown: Junior / Mid-level / Senior / Lead / Manager / Director / C-Level), location (optional, AI-filled), work mode (optional, AI-filled — On-site / Hybrid / Remote), industry (optional, AI-filled), labels (optional, multiple free-text tags), status (optional, defaults to "Applied"), and additional info (optional free-text).
- FR-05: The form SHALL prevent submission if the URL field is empty.

**AI auto-fill from job posting URL**
- FR-06: When the job posting URL is entered, the system SHALL attempt to fetch and parse it server-side (after an 800 ms debounce) and pre-fill the company, role, seniority, location, work mode, and industry fields in the form before submission.
- FR-07: If any metadata fields are still empty at save time, the server SHALL attempt extraction again during the POST request.
- FR-08: If extraction fails (network error, auth-gated URL), the candidature SHALL still be saved and a dismissible warning banner SHALL inform the user.
- FR-09: For LinkedIn URLs, the system SHALL skip the fetch attempt and show a dismissible warning that LinkedIn pages require login. A paste-text fallback SHALL allow the user to paste the job description text for AI extraction instead.
- FR-10: The URL input field SHALL show an inline status indicator (⏳ extracting / ✅ success / ⚠️ LinkedIn / ℹ️ failed) while extraction is in progress or completed.

**Labels**
- FR-11: The system SHALL allow users to add multiple free-text labels to a candidature (e.g., "priority", "fintech", "referral").
- FR-12: Labels SHALL be entered by typing and pressing Enter or comma.
- FR-13: Existing labels from the user's own candidatures SHALL be suggested via a dropdown as the user types.
- FR-14: Labels SHALL be rendered as chips on the candidature card in the list.

**Candidature status badge**
- FR-15: The system SHALL allow users to set a high-level candidature status from: Applied, In Progress, Offer, Rejected, Withdrawn, Archived. Status defaults to "Applied" on creation.
- FR-16: The status SHALL be displayed as a colour-coded badge on each candidature card.

**Candidatures list**
- FR-17: The list SHALL display all of the user's candidatures sorted by most recent activity (`updatedAt` descending).
- FR-18: Activity that updates `updatedAt` includes: creating the candidature, updating any stage status, and editing candidature metadata.

**Keyword search**
- FR-19: The system SHALL provide a search input that filters the candidatures list in real time by keyword.
- FR-20: The keyword SHALL be matched against: job title, company name, role, and industry (case-insensitive).

**Filters**
- FR-21: The system SHALL provide filter controls for: company, role, seniority, industry, labels, and work mode.
- FR-22: Multiple filter values within the same dimension SHALL be combined with OR logic. Filters across dimensions SHALL be combined with AND logic.
- FR-23: Active filters SHALL be displayed as dismissible chips above the list.

**Candidature card**
- FR-24: Each card SHALL display: company, job title, match % (if available), current selection stage, status badge, work mode, seniority, location, industry, labels, and creation / last-updated date.
- FR-25: Clicking a card SHALL navigate to the SelectionProcess detail page for that candidature at `/candidature/:id`.

### Non-Functional Requirements

- NFR-01: URL extraction debounce SHALL be 800 ms to avoid excessive API calls while the user types.
- NFR-02: Search and filter results SHALL update synchronously in-memory with no round-trip to the server.
- NFR-03: The quick-add form SHALL be collapsible so it doesn't crowd the list for returning users.

## Scenarios

### Scenario 1: Navigating to the hub
**Given** the user is logged in  
**When** they click "Candidatures" in the left sidebar  
**Then** they are taken to `/candidatures` showing the add form and their candidatures list

### Scenario 2: Empty state
**Given** the user has no saved candidatures  
**When** they visit `/candidatures`  
**Then** the list area shows an empty state message with a button to add their first candidature

### Scenario 3: AI auto-fill from URL
**Given** the user has entered a job posting URL in the form  
**When** 800 ms passes without further typing  
**Then** the form fields for company, role, seniority, location, work mode, and industry are filled with the AI-extracted values; the user can edit them before saving

### Scenario 4: LinkedIn URL — paste fallback
**Given** the user pastes a LinkedIn URL  
**When** extraction runs  
**Then** a warning is shown that LinkedIn requires login; a textarea appears allowing the user to paste the job description manually for AI extraction

### Scenario 5: Auto-fill fails
**Given** the job posting URL cannot be fetched or parsed  
**When** extraction completes  
**Then** an ℹ️ indicator appears next to the URL field and a note prompts the user to fill in fields manually

### Scenario 6: Keyword search filters list
**Given** the user has multiple candidatures  
**When** they type "frontend" in the search input  
**Then** only candidatures with "frontend" in their title, company, role, or industry are shown

### Scenario 7: Multiple filters active
**Given** the user has applied seniority "Senior" AND work mode "Remote" filters  
**When** the filter is evaluated  
**Then** only candidatures that are both Senior and Remote are shown

### Scenario 8: Clicking a candidature card
**Given** the user is viewing the candidatures list  
**When** they click on a candidature card  
**Then** they are taken to `/candidature/:id` for that candidature

## Acceptance Criteria

- [x] `/candidatures` page accessible from sidebar
- [x] Quick-add form with URL required, all other fields optional
- [x] AI auto-fills company, role, seniority, location, work mode, industry from URL (debounced 800 ms)
- [x] LinkedIn URL shows warning + paste-text fallback
- [x] Save succeeds even when extraction fails; banner shown
- [x] Labels entered as chips; autocomplete from existing labels
- [x] Status badge is colour-coded
- [x] List sorted by most recent activity
- [x] Keyword search filters in real time (title, company, role, industry)
- [x] Filters: company, role, seniority, industry, labels, work mode; AND across dimensions, OR within
- [x] Active filter chips are dismissible
- [x] Empty state shown when no candidatures
- [x] "No results" message shown when search/filter returns nothing
- [x] Candidature card navigates to `/candidature/:id`

## Implementation

**Status:** ✅ Implemented — 2026-05-26

**Notes:**
- Replaces standalone `/candidature/new` (redirects to `/candidatures`) and `/selection-process` list (redirects to `/candidatures`)
- `POST /candidatures/extract` endpoint handles URL fetch + AI extraction without saving; returns `{ autoFillStatus, fields }`
- `GET /candidatures/labels` returns distinct union of all label values for the user
- `POST /candidatures` accepts: `{ jobUrl, company?, role?, seniority?, location?, workMode?, industry?, labels?, status?, additionalInfo? }`
- `jobDescription` (fetched + stripped text, truncated to 20 000 chars) stored on the candidature record for future re-analysis
- `analyzeJobFlow` still runs at save time if `jobDescription` + profile are both available
