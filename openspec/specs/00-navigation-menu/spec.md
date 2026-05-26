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
  2. **Profile** (collapsible group) — Job Preferences, CV Analysis, LinkedIn Analysis.
  3. **Candidatures** (collapsible group) — My Candidatures hub at `/candidatures`.
  4. **Closing** — Close a candidature and provide feedback.
  5. **Glossary** — Key terms and concepts.
  6. **Quizzes** — Playful practice quizzes.
- FR-05: The **Candidatures** group SHALL follow the same collapsible pattern as the Profile group:
  - Group label is itself a link to `/candidatures`.
  - Auto-expands when the current route starts with `/candidature`.
  - Sub-item: 📋 My Candidatures → `/candidatures`.
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

### Scenario 4: Candidatures group auto-expands on candidature routes
**Given** the user is on `/candidature/:id`  
**When** they look at the navigation menu  
**Then** the Candidatures group is expanded and highlighted

### Scenario 5: Clicking Candidatures navigates to hub
**Given** the user is logged in  
**When** they click the "Candidatures" group label in the sidebar  
**Then** they are taken to `/candidatures`

## Acceptance Criteria

- [x] Navigation menu is visible on all authenticated pages
- [x] Active menu item is highlighted
- [x] All top-level sections are present and clickable
- [x] Candidatures collapsible group auto-expands on `/candidature/*` routes
- [x] User name and avatar are displayed
- [x] Logout works from the menu
- [x] Menu is not shown on the Login page
- [x] Navigation does not trigger a full page reload

## Implementation

**Status:** ✅ Implemented — 2026-05-26  
**Commit:** `feat(nav): implement spec 00 — Navigation Menu`

**Notes:**
- Desktop (lg+): full sidebar w-64; Tablet (md): icon-only rail w-16; Mobile: hamburger + slide-over drawer
- **Candidatures** collapsible group (same pattern as Profile): auto-expands when route starts with `/candidature`; sub-item: 📋 My Candidatures → `/candidatures`
- `/candidature/new` redirects to `/candidatures`; `/selection-process` redirects to `/candidatures`
- User avatar, name, email, and logout button live in the sidebar footer
- Closing page is a placeholder pending spec 05

## Out of Scope

- Role-based menu visibility (all journeys are accessible to all users)
- Collapsible sub-menus for sections beyond Profile and Candidatures
