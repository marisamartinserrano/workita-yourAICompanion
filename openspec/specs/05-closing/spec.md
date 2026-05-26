# Spec: 05 — Closing

## Overview

The Closing journey allows users to formally close a candidature — whether they received an offer, withdrew, or were rejected. It captures the reason, any company feedback, and the user's experience rating to improve future guidance.

## Requirements

### Functional Requirements

**Candidature Selection**
- FR-01: The Closing page MUST display a list of all open (non-closed) candidatures with:
  - Job title and company name
  - Current stage
  - Last updated date
- FR-02: The list MUST default to the most recently active candidature.
- FR-03: The user MUST be able to select any open candidature to close.

**Closing Reason**
- FR-04: The user MUST select a closing reason from a predefined list:
  - Received offer — accepted
  - Received offer — declined
  - Accepted offer from another company
  - No longer interested in the role
  - Position filled by the company
  - Position put on hold or cancelled
  - Did not pass the selection process
  - Other
- FR-05: The selected reason MUST be persisted in the database.

**Company Feedback**
- FR-06: The user MUST be able to enter free-text feedback received from the hiring company (e.g., "Profile not a fit", "Position put on hold").
- FR-07: This field MUST be optional.
- FR-08: The feedback MUST be persisted in the database.

**Candidature Status**
- FR-09: Closing a candidature MUST update its status to `closed` in the database.
- FR-10: Closed candidatures MUST no longer appear in the open candidatures list but MUST remain accessible in a history or archive view.

**User Feedback**
- FR-11: After closing, the user MUST be prompted to rate their experience with Workita's guidance on a scale of 1–5 stars.
- FR-12: The user MAY provide additional free-text feedback about the app.
- FR-13: This rating and feedback MUST be stored in the database for product analytics.

### Non-Functional Requirements

- NFR-01: Closing a candidature MUST complete in under 2 seconds.
- NFR-02: Closed candidatures MUST be retrievable for historical analysis.

## Scenarios

### Scenario 1: Closing with an accepted offer
**Given** the user received and accepted an offer from Company A  
**When** they open Closing, select Company A's candidature, choose "Received offer — accepted", and submit  
**Then** the candidature is marked as closed and removed from the active list

### Scenario 2: Providing company feedback
**Given** the user was rejected after the final interview  
**When** they close the candidature and enter "The role required more enterprise experience than I currently have" as company feedback  
**Then** the feedback is stored and associated with that candidature

### Scenario 3: Rating the app experience
**Given** the user has just closed a candidature  
**When** prompted to rate Workita  
**Then** they can select 1–5 stars and optionally write a comment; both are saved

### Scenario 4: No open candidatures
**Given** all candidatures are already closed  
**When** the user opens the Closing page  
**Then** they see an empty state: "No open candidatures to close."

## Acceptance Criteria

- [ ] Open candidatures list shows title, company, stage, last updated date
- [ ] Most recently active candidature is pre-selected
- [ ] All predefined closing reasons are available for selection
- [ ] Company feedback field is present (optional)
- [ ] Candidature status is set to `closed` on submission
- [ ] Closed candidatures disappear from the open list
- [ ] 1–5 star rating prompt appears after closing
- [ ] Rating and optional feedback are persisted
- [ ] Empty state is shown when no open candidatures exist
