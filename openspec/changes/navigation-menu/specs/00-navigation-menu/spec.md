# Spec: 00 — Navigation Menu

## Overview

The navigation menu is the persistent left-side panel that anchors every screen in Workita. It tells users where they are, lets them jump between journeys instantly, and reflects the structure of the entire application.

## Requirements

### Functional Requirements

- FR-01: The navigation menu MUST always be visible on the left side of the screen across all authenticated pages.
- FR-02: The active section MUST be visually highlighted so users know where they are at all times.
- FR-03: Clicking any menu item MUST navigate the user to the corresponding section without a full page reload (SPA navigation).
- FR-04: The menu MUST include the following top-level sections in order:
  1. **Home** — Dashboard with job search progress overview.
  2. **Onboarding / Profile** — Input and update job preferences, CV, and LinkedIn URL.
  3. **New Candidature** — Start a new job application.
  4. **Selection Process** — Track and get guidance for each interview stage.
  5. **Closing** — Close a candidature and provide feedback.
  6. **Glossary** — Key terms and concepts.
  7. **Quizzes** — Playful practice quizzes.
- FR-05: The Selection Process section MUST display the 10 interview sub-stages as nested items or on navigation:
  - Application submitted
  - Interview with recruiter
  - Technical interview
  - Use case or assignment
  - Team interview
  - Manager interview
  - Client/Stakeholder interview
  - Cultural interview
  - Leadership interview
  - Offer received / Candidature rejected
- FR-06: The menu MUST display the logged-in user's name and avatar (from Google SSO).
- FR-07: The menu MUST include a logout option.
- FR-08: The menu MUST be hidden or replaced with a top bar on unauthenticated pages (Login).

### Non-Functional Requirements

- NFR-01: Menu transitions MUST complete in under 200ms.
- NFR-02: The menu MUST be responsive — collapse to an icon-only rail on tablet and a hamburger on mobile.
- NFR-03: All menu items MUST be keyboard-navigable and accessible (WCAG 2.1 AA).

## Scenarios

### Scenario 1: User navigates to a section
**Given** the user is logged in and on any page  
**When** they click "Glossary" in the navigation menu  
**Then** they are taken to the Glossary page and "Glossary" is highlighted as the active item

### Scenario 2: User sees their identity
**Given** the user is logged in  
**When** they look at the navigation menu  
**Then** they see their Google profile picture and display name

### Scenario 3: Unauthenticated user
**Given** the user is not logged in  
**When** they access any page  
**Then** the left navigation menu is not shown and they are redirected to the Login page

### Scenario 4: Active route highlighting
**Given** the user is on the "New Candidature" page  
**When** they look at the navigation menu  
**Then** "New Candidature" is visually distinguished from the other items

## Acceptance Criteria

- [ ] Navigation menu is visible on all authenticated pages
- [ ] Active menu item is highlighted
- [ ] All 7 top-level sections are present and clickable
- [ ] Selection Process sub-stages are accessible from the menu
- [ ] User name and avatar are displayed
- [ ] Logout works from the menu
- [ ] Menu is not shown on the Login page
- [ ] Navigation does not trigger a full page reload

## Out of Scope

- Role-based menu visibility (all journeys are accessible to all users)
- Collapsible sub-menus for other sections beyond Selection Process
