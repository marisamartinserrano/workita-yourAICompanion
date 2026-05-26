# Spec: 02 — Candidate Onboarding / Profile

## Overview

Onboarding collects the candidate's job preferences, CV, and LinkedIn profile. This information is the foundation for all AI-powered recommendations in Workita — the richer the profile, the more tailored the guidance.
- After the user is registered and logged in, they will be guided through an onboarding process where they can input their job preferences: Role, Seniority, Industry, Location, preferred companies, Presencial/Remote/Hybrid, salary expectations.
- The app will ask the user to upload their extended CV as a document. This CV will be used to tailor the job application guidance and AI interactions to the user's specific background and experience.
  - The app will analyze the uploaded CV to extract relevant information such as skills, experience, and education. This information will be used to provide personalized recommendations for job applications, interview preparation, and networking opportunities.
  - The app will also use the information from the CV to identify potential gaps or areas for improvement in the user's profile. This may include suggestions for additional skills to acquire, certifications to pursue, or ways to better highlight existing experience.
  - The app will simulate how the user's CV would be parsed by common Applicant Tracking Systems (ATS) and provide feedback on how to optimize the CV for better visibility in these systems. This may include recommendations for formatting, keyword usage, and overall structure to increase the chances of passing through ATS filters.
- The app will also ask the user to input their LinkedIn profile URL. This information will be used to further customize the job application guidance and AI interactions based on the user's professional background and network.
  - The app will present recommendations for improving the user's LinkedIn profile based on the information provided in the CV and LinkedIn URL. This may include suggestions for optimizing the profile summary, adding relevant skills, or improving the overall presentation to make the profile more suitable for LinkedIn algorithms (recruiter search, consistency with CV, Application Tracking Systems filtering). The app will also present the user with the summary of recommendations and the rationale behind them, as well as a quick summary of how LinkedIn works for candidates.
- The app will ask the user about 
- The information collected during onboarding (job preferences, CV, LinkedIn profile) will be stored in the database and used to personalize the user's experience throughout the app. This allows for tailored job recommendations, application guidance, and interview preparation based on the user's specific background and preferences.

## Requirements

### Functional Requirements

**Page Layout**
- FR-00: The onboarding/profile page SHALL be organised into three tabs: **Job Preferences**, **CV & Analysis**, and **LinkedIn**. Each tab groups related fields and AI output together, replacing a single-scroll form.

**Job Preferences**
- FR-01: The app MUST collect the following job preference fields:
  - Target Role (free text)
  - Seniority level (Junior / Mid-level / Senior / Lead / Manager / Director / C-Level)
  - Industry (free text)
  - Location (free text)
  - Preferred Work Mode (On-site / Remote / Hybrid)
  - Salary Expectations (free text)
  - Preferred Companies (free text, comma-separated)
- FR-02: All preference fields MUST be optional; users can save a partial profile.
- FR-03: The profile MUST be editable at any time from the navigation menu.

**CV & Analysis**
- FR-04: The app MUST allow the user to paste their CV text.
- FR-04a: The **CV & Analysis** tab SHALL display an "Analyse CV" button after profile data is saved. Clicking it sends the saved CV to the AI and displays results inline.
- FR-04b: The "Analyse CV" button SHALL be disabled (with the hint "Save your CV first to run analysis") when no CV text has been saved.
- FR-05: The AI MUST analyze the CV to extract skills, experience, and education.
- FR-06: The AI MUST identify potential gaps or areas for improvement in the CV, presenting them as actionable improvement suggestions.
- FR-07: The AI MUST simulate how the CV would be parsed by ATS systems and provide optimization feedback (formatting, keywords, structure).

**LinkedIn**
- FR-08: The app MUST accept the user's LinkedIn profile URL.
- FR-08a: The LinkedIn tab SHALL display a collapsible "How LinkedIn works for candidates" explainer section (covering profile completeness, keyword matching, and recruiter search behaviour) above the recommendations list.
- FR-08b: If no LinkedIn URL is saved, LinkedIn recommendations SHALL still be generated from CV content alone, with a note that results would be more specific with a LinkedIn URL.
- FR-09: The AI MUST generate recommendations to improve the LinkedIn profile based on:
  - CV content
  - LinkedIn algorithm best practices (profile summary, skills, consistency with CV, ATS filtering)
- FR-10: The app MUST present recommendations with a rationale and a brief explanation of how LinkedIn works for candidates.

**Storage**
- FR-11: All onboarding data (preferences, CV text, LinkedIn URL) MUST be persisted in the `profiles` database table linked to the authenticated user.
- FR-12: Re-saving the profile MUST update the existing record (upsert), not create a duplicate.

### Non-Functional Requirements

- NFR-01: CV analysis MUST complete within 10 seconds.
- NFR-02: Profile data MUST be scoped to the authenticated user and never exposed to other users.

## Scenarios

### Scenario 1: First-time onboarding
**Given** the user has just registered  
**When** they navigate to Onboarding/Profile and fill in their preferences, paste their CV, and provide their LinkedIn URL  
**Then** the data is saved and a confirmation is shown

### Scenario 2: Tab navigation
**Given** the user is on the onboarding/profile page  
**When** the user clicks the "CV & Analysis" tab  
**Then** the CV textarea and analysis results panel are shown; the Job Preferences fields are hidden

### Scenario 3: Analyse button triggers AI and shows results
**Given** the user has saved a non-empty CV  
**When** the user clicks "Analyse CV"  
**Then** a loading indicator is shown, then the results panel displays: extracted skills, experience, education, gaps, and ATS feedback

### Scenario 4: Analyse button disabled without CV
**Given** the user visits the CV & Analysis tab with no CV text saved  
**When** they view the tab  
**Then** the "Analyse CV" button is disabled and a hint reads "Save your CV first to run analysis"

### Scenario 5: CV analysis
**Given** the user has pasted their CV and saved their profile  
**When** they click "Analyse CV"  
**Then** the AI provides: extracted skills, identified gaps, and ATS optimization recommendations

### Scenario 6: LinkedIn recommendations
**Given** the user has provided their LinkedIn URL and CV  
**When** the analysis completes  
**Then** the app shows specific LinkedIn improvement recommendations with rationale

### Scenario 7: Updating the profile
**Given** the user already has a saved profile  
**When** they edit their role preference and save again  
**Then** the record is updated (not duplicated) and the updated data is used for future AI interactions

## Acceptance Criteria

- [x] Onboarding page is organised into 3 tabs: Job Preferences / CV & Analysis / LinkedIn
- [x] Tab navigation hides/shows the relevant section on click (keyboard: ArrowLeft/ArrowRight)
- [x] All 7 job preference fields are present and saveable
- [x] CV text field accepts and saves the pasted content
- [x] "Analyse CV" button is present on the CV & Analysis tab
- [x] "Analyse CV" button is disabled with hint when CV text is empty
- [x] AI extracts skills, experience, and education from CV
- [x] AI identifies profile gaps and suggests improvements
- [x] ATS simulation feedback is shown
- [x] LinkedIn URL field is present and saved
- [x] Collapsible "How LinkedIn works for candidates" explainer shown above recommendations
- [x] LinkedIn improvement recommendations are generated with rationale
- [x] LinkedIn recommendations are generated even without a LinkedIn URL (with a note)
- [x] Profile is persisted in the database (upsert behaviour)
- [x] Profile page is accessible and editable at any time

## Implementation

**Status:** ✅ Implemented — 2026-05-26 | ♻️ Superseded by `profile-sections` change — 2026-05-26

**Original implementation notes:**
- Page redesigned into 3 tabs: Job Preferences / CV & Analysis / LinkedIn
- "Analyse CV" auto-saves profile then calls `POST /profile/analyze`
- CV analysis: skills chips, experience list, gaps panel, ATS pass/warn/fail checklist
- LinkedIn panel: collapsible "How LinkedIn works" explainer + recommendations with rationale

**Breaking changes applied by `profile-sections`:**
- Three-tab layout **removed**; replaced by three dedicated routes under a collapsible Profile nav group:
  - Job Preferences → `/profile` (`Profile.tsx`)
  - CV Analysis → `/profile/cv-analysis` (`CvAnalysis.tsx`)
  - LinkedIn Analysis → `/profile/linkedin-analysis` (`LinkedinAnalysis.tsx`)
- CV text-paste **replaced** by file upload (PDF, .doc, .docx); server extracts text via `pdf-parse`/`mammoth`
- CV analysis and LinkedIn analysis results **persisted** to `profiles` table (new `cvAnalysisResult`, `linkedinAnalysisResult` JSONB columns)
- LinkedIn flow replaced: `linkedinRecommendationsFlow` → `linkedinAnalysisFlow` (role + industry + seniority targeted)
- `/onboarding` route redirects to `/profile` for backwards compatibility
