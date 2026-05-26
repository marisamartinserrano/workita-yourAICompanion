# Tasks: Navigation Menu (Spec 00)

## Layout component

- [x] Rewrite `src/components/Layout.tsx` — extract `Sidebar` as internal component
- [x] All 7 nav sections in spec order (Home, My Profile, New Candidature, Selection Process, Closing, Glossary, Quizzes)
- [x] Active route highlighting with `aria-current="page"`
- [x] Prefix-match active detection (`startsWith`) for nested routes

## Responsive layout

- [x] Desktop (lg+): full sidebar w-64 with icon + label
- [x] Tablet (md–lg): icon-only rail w-16 with `title` tooltips (collapsed mode)
- [x] Mobile (< md): top bar with hamburger button
- [x] Mobile: slide-over drawer panel (z-40 overlay + w-72 panel)
- [x] Backdrop click closes the drawer
- [x] Route change closes the drawer automatically

## Selection Process sub-stages (FR-05)

- [x] Chevron toggle button beside "Selection Process" nav item
- [x] Collapsible list of 10 sub-stages with emoji icons
- [x] `aria-expanded` on toggle button
- [x] Auto-expands when user is on `/candidature/*` or `/selection-process`
- [x] Sub-stages hidden in collapsed (tablet) mode

## User identity & logout (FR-06, FR-07)

- [x] Avatar image (with initial-letter fallback) in sidebar footer
- [x] User name and email displayed (hidden when collapsed)
- [x] Logout button with icon in sidebar footer
- [x] Logout closes mobile drawer

## Accessibility (NFR-03)

- [x] `aria-label` on all links when in collapsed mode
- [x] `aria-current="page"` on active link
- [x] `aria-expanded` on hamburger and sub-stage toggle
- [x] `focus-visible` ring on all interactive elements
- [x] `aria-hidden` on mobile backdrop
- [x] `aria-label` on hamburger open/close buttons

## New pages & routes

- [x] `src/pages/SelectionProcessList.tsx` — lists open candidatures at `/selection-process`
- [x] `src/pages/Closing.tsx` — placeholder page at `/closing`
- [x] `src/App.tsx` — add `/selection-process` and `/closing` routes

## Spec

- [x] Update `openspec/specs/00-navigation-menu/spec.md` acceptance criteria
