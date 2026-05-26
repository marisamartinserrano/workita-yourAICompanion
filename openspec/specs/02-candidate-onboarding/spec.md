# Spec: 02 — Candidate Onboarding / Profile

## Overview

Onboarding collects the candidate's job preferences, CV, and LinkedIn profile. This information is the foundation for all AI-powered recommendations in Workita — the richer the profile, the more tailored the guidance.

## Requirements

### Functional Requirements

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

**CV**
- FR-04: The app MUST allow the user to paste their CV text.
- FR-05: The AI MUST analyze the CV to extract skills, experience, and education.
- FR-06: The AI MUST identify potential gaps or areas for improvement in the CV.
- FR-07: The AI MUST simulate how the CV would be parsed by ATS systems and provide optimization feedback (formatting, keywords, structure).

**LinkedIn**
- FR-08: The app MUST accept the user's LinkedIn profile URL.
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

### Scenario 2: CV analysis
**Given** the user has pasted their CV and saved their profile  
**When** they view the onboarding page  
**Then** the AI provides: extracted skills, identified gaps, and ATS optimization recommendations

### Scenario 3: LinkedIn recommendations
**Given** the user has provided their LinkedIn URL and CV  
**When** the analysis completes  
**Then** the app shows specific LinkedIn improvement recommendations with rationale

### Scenario 4: Updating the profile
**Given** the user already has a saved profile  
**When** they edit their role preference and save again  
**Then** the record is updated (not duplicated) and the updated data is used for future AI interactions

## Acceptance Criteria

- [ ] All 7 job preference fields are present and saveable
- [ ] CV text field accepts and saves the pasted content
- [ ] AI extracts skills, experience, and education from CV
- [ ] AI identifies profile gaps and suggests improvements
- [ ] ATS simulation feedback is shown
- [ ] LinkedIn URL field is present and saved
- [ ] LinkedIn improvement recommendations are generated with rationale
- [ ] Profile is persisted in the database (upsert behaviour)
- [ ] Profile page is accessible and editable at any time
