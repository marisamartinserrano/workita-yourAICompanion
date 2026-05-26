# Spec: 01 — Home Page (Dashboard)

## Overview

The Home page is the landing page after login. It gives users a clear snapshot of their job search progress — applications submitted, upcoming interviews, and recent activity — and provides quick-access shortcuts to the most common actions.

## Requirements

### Functional Requirements

- FR-01: The Home page MUST be the first page shown after a successful Google SSO login or registration.
- FR-02: The Home page MUST be accessible at any time from the navigation menu.
- FR-03: The dashboard MUST display the following summary stats:
  - Total number of applications submitted
  - Number of applications currently in an interview stage
  - Number of offers received
  - Average match percentage across all candidatures
- FR-04: The Home page MUST show a list of the user's active candidatures with:
  - Job title and company name
  - Current stage / status
  - Match percentage
  - Link to the candidature detail
- FR-05: The Home page MUST include quick-action shortcuts:
  - "New Candidature" → navigates to New Candidature page
  - "Update Profile" → navigates to Onboarding/Profile page
  - "Practice Quizzes" → navigates to Quizzes page
- FR-06: If the user has no candidatures, the page MUST show an empty state with a prompt to create their first candidature.
- FR-07: The welcome message MUST include the user's first name (retrieved from Google SSO).

### Non-Functional Requirements

- NFR-01: The dashboard stats MUST load within 1 second on a local network.
- NFR-02: The page MUST render correctly on desktop (1280px+), tablet (768px), and mobile (375px).

## Scenarios

### Scenario 1: First-time user lands on Home
**Given** the user has just registered via Google SSO  
**When** they are redirected to the Home page  
**Then** they see a welcome message with their first name, zero stats, and a prompt to create their first candidature

### Scenario 2: Returning user with active applications
**Given** the user has 3 open candidatures  
**When** they navigate to the Home page  
**Then** they see their stats (3 applications, correct interview count, average match %) and the list of their candidatures

### Scenario 3: Quick action navigation
**Given** the user is on the Home page  
**When** they click "New Candidature"  
**Then** they are taken directly to the New Candidature page

## Acceptance Criteria

- [ ] Home page is shown immediately after login
- [ ] Welcome message includes the user's first name
- [ ] Stats panel shows correct totals from the database
- [ ] Active candidatures list is rendered with title, company, stage, and match %
- [ ] Empty state is shown when there are no candidatures
- [ ] All 3 quick-action shortcuts navigate to the correct pages
- [ ] Page is accessible from the navigation menu at all times
