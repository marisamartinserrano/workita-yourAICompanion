# Spec: 03 — New Candidature

## Overview

New Candidature is the core AI-powered feature of Workita. The user submits a job description URL or text, and the app performs a comprehensive analysis: company context, skills match, gaps, differentiators, ATS keywords, and tailored CV and LinkedIn recommendations — all stored for ongoing tracking.

## Requirements

### Functional Requirements

**Input**
- FR-01: The user MUST be able to start a new candidature by providing:
  - A link to the job description (LinkedIn, company website, etc.) — **required**
  - Company — optional (AI-filled from URL if left blank)
  - Role — optional (AI-filled from URL if left blank)
  - Seniority — optional (AI-filled from URL if left blank)
  - Location — optional (AI-filled from URL if left blank)
  - Work mode (On-site / Hybrid / Remote) — optional (AI-filled from URL if left blank)
  - Industry — optional (AI-filled from URL if left blank)
  - Labels — optional, multiple free-text tags
  - Status — optional, defaults to "Applied"
  - Additional info — optional free-text
- FR-01a: The form is embedded in the Candidatures hub page at `/candidatures`, not on a standalone page.
- FR-02: The app MUST validate that the URL field is provided before saving. The full job description text is no longer a required input — it is fetched server-side from the URL.

**AI Analysis**
- FR-03: The AI MUST extract and present a structured company overview including: company name, products/services, industry, financial health indicators, and recent news.
- FR-04: The AI MUST extract and present the role requirements: required skills, experience level, and expected salary (if mentioned).
- FR-05: Based on the candidate profile (CV + preferences), the AI MUST calculate and display a **% Match** score (0–100).
- FR-06: The AI MUST identify and display the candidate's **Strengths** relevant to this role.
- FR-07: The AI MUST identify and display **Gaps** — areas where the candidate's profile does not fully meet the requirements.
- FR-08: The AI MUST identify **Key Differentiators** that make the candidate stand out for this role.
- FR-09: The AI MUST extract **ATS Keywords** from the job description with recommendations on how to incorporate them.
- FR-10: The AI MUST generate role-specific **LinkedIn profile recommendations**.
- FR-11: The AI MUST generate role-specific **CV optimization recommendations**.
- FR-12: The app MUST encourage the user to network by providing guidance on reaching out to the recruiter, hiring manager, or company employees.

**Storage**
- FR-13: The candidature (job title, company, job URL, match %, full AI analysis) MUST be persisted in the `candidatures` table.
- FR-14: The 10 selection process stages MUST be automatically created for each new candidature in the `candidature_stages` table with "Application submitted" set to `completed` and all others set to `pending`.
- FR-15: A role-specific glossary MUST be auto-generated and saved for each candidature (see Spec 06 — Glossary).

**Post-Analysis**
- FR-16: After analysis, the user MUST be able to navigate directly to the Selection Process tracker for this candidature.

### Non-Functional Requirements

- NFR-01: AI analysis MUST complete within 15 seconds.
- NFR-02: If no candidate profile exists, the AI MUST still analyse the job description and inform the user that results would be more personalised with a complete profile.

## Scenarios

### Scenario 1: Successful candidature creation with URL only
**Given** the user has a complete profile and enters a job posting URL  
**When** they click "Save candidature"  
**Then** the server fetches the URL, AI extracts company, role, seniority, location, work mode, and industry; a full analysis (% match, strengths, gaps, differentiators, ATS keywords, CV recs, LinkedIn recs) is run and the candidature appears in the list

### Scenario 2: User without a profile
**Given** the user has not completed onboarding  
**When** they submit a job description  
**Then** the AI still performs the analysis but shows a banner: "Complete your profile for a personalised match score"

### Scenario 3: Navigate to Selection Process
**Given** a candidature has been created  
**When** the user clicks "Track Selection Process"  
**Then** they are taken to the Selection Process page for this candidature with all 10 stages pre-loaded

### Scenario 4: Missing URL
**Given** the user submits the form without entering a URL  
**When** they click "Save candidature"  
**Then** a validation error is shown and no API call is made

## Acceptance Criteria

- [x] Job posting URL is required; all other fields are optional (AI-filled from URL)
- [x] AI produces: company summary, role requirements, % match, strengths, gaps, differentiators, ATS keywords, CV recs, LinkedIn recs, networking guidance
- [x] All analysis results are displayed clearly on screen
- [x] Candidature is saved to the database with full analysis JSON
- [x] 10 selection stages are auto-created; "Application submitted" is marked as completed
- [x] User is prompted to network with the hiring team
- [x] Navigation to Selection Process is available after analysis
- [x] Analysis works even without a candidate profile (with a notice)

## Implementation

**Status:** ✅ Implemented — 2026-05-26

**Notes:**
- `analyzeJobFlow` extended with `roleRequirements` (`skills[]`, `experienceLevel`, `salary`) and `networkingGuidance` (`string[]`)
- `POST /candidatures` returns `hasProfile: boolean` alongside the candidature record
- Results view refactored into a `ResultsView` component; new panels: Role Requirements (skills as chips, experience + salary labels) and Networking Guidance (teal card, bulleted tips)
- No-profile banner (dismissible, amber) links to `/onboarding`; hidden when `hasProfile` is true
- Layout order: no-profile banner → header + match % → company summary → role requirements → strengths/gaps → differentiators/ATS → CV/LinkedIn recs → networking → CTA
