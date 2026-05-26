# Proposal: Navigation Menu (Spec 00)

## Summary

Implement the persistent left-side navigation menu as defined in `openspec/specs/00-navigation-menu/spec.md`. The nav anchors every authenticated page in Workita and provides immediate access to all 7 journeys.

## Problem Statement

The existing Layout had a partial sidebar with only 5 items in the wrong order, no Selection Process sub-stages, no user identity in the sidebar, no logout in the sidebar, and no responsive behaviour beyond a mobile bottom bar. It did not match the spec.

## Proposed Solution

Full rewrite of `src/components/Layout.tsx` to implement:

1. **All 7 nav sections** in spec order: Home, My Profile, New Candidature, Selection Process, Closing, Glossary, Quizzes
2. **Selection Process sub-stages** — collapsible list of all 10 interview stages with icons, auto-expands when user is on a candidature page
3. **User identity in sidebar** — avatar (or initial fallback), name, email, and logout button
4. **Three responsive breakpoints**:
   - Mobile (`< md`): hamburger top bar → slide-over drawer
   - Tablet (`md → lg`): icon-only rail (w-16) with title tooltips
   - Desktop (`lg+`): full sidebar (w-64)
5. **Accessibility** — `aria-label`, `aria-current="page"`, `aria-expanded`, `focus-visible` rings on all interactive elements

## Scope

**In scope:**
- `src/components/Layout.tsx` — full rewrite
- `src/pages/SelectionProcessList.tsx` — new list page at `/selection-process`
- `src/pages/Closing.tsx` — placeholder page at `/closing` (full impl in spec 05)
- `src/App.tsx` — add `/selection-process` and `/closing` routes

**Out of scope:**
- Role-based menu visibility
- Collapsible sub-menus for sections beyond Selection Process
- Notification badges
