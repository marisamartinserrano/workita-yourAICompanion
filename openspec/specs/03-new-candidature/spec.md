# Spec: 03 — New Candidature

## Overview

New Candidature is the core AI-powered feature of Workita. The user submits a job description URL or text, and the app performs a comprehensive analysis: company context, skills match, gaps, differentiators, ATS keywords, and tailored CV and LinkedIn recommendations — all stored for ongoing tracking.

## Requirements

### Functional Requirements

**Input**
- FR-01: The user MUST be able to start a new candidature by providing:
  - A link to the job description (LinkedIn, company website, etc.) — optional
  - The full job description text — required
- FR-02: The app MUST validate that a job description is provided before triggering analysis.

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

### Scenario 1: Successful candidature creation
**Given** the user has a complete profile and pastes a job description  
**When** they click "Analyse Job"  
**Then** the AI returns: company summary, % match, strengths, gaps, differentiators, ATS keywords, CV recommendations, LinkedIn recommendations — all displayed on screen and saved to the database

### Scenario 2: User without a profile
**Given** the user has not completed onboarding  
**When** they submit a job description  
**Then** the AI still performs the analysis but shows a banner: "Complete your profile for a personalised match score"

### Scenario 3: Navigate to Selection Process
**Given** a candidature has been created  
**When** the user clicks "Track Selection Process"  
**Then** they are taken to the Selection Process page for this candidature with all 10 stages pre-loaded

### Scenario 4: Missing job description
**Given** the user submits the form without pasting a job description  
**When** they click "Analyse Job"  
**Then** a validation error is shown and no API call is made

## Acceptance Criteria

- [ ] Job description text field is required; URL is optional
- [ ] AI produces: company summary, % match, strengths, gaps, differentiators, ATS keywords, CV recs, LinkedIn recs
- [ ] All analysis results are displayed clearly on screen
- [ ] Candidature is saved to the database with full analysis JSON
- [ ] 10 selection stages are auto-created; "Application submitted" is marked as completed
- [ ] User is prompted to network with the hiring team
- [ ] Navigation to Selection Process is available after analysis
- [ ] Analysis works even without a candidate profile (with a notice)
