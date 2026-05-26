# Spec: 08 — CV Analysis

## Overview

The CV Analysis feature uses AI to parse and evaluate the candidate's pasted CV text. It extracts structured information (skills, experience, education), surfaces gaps and improvement opportunities, and simulates how an Applicant Tracking System (ATS) would parse the document. Analysis is triggered explicitly by the user from the CV & Analysis tab of the onboarding/profile page and requires a saved CV to run.

## Requirements

### Functional Requirements

**CV Skills and Experience Extraction**
- FR-01: The system SHALL analyse the candidate's pasted CV text using AI and extract:
  - A list of identified skills
  - Years and areas of experience
  - Education qualifications
- FR-02: Extracted data SHALL be displayed inline on the CV & Analysis tab after analysis completes.

**CV Gap Identification**
- FR-03: The system SHALL identify gaps or weak areas in the CV — such as missing quantified achievements, absent keywords, or thin descriptions.
- FR-04: Each identified gap SHALL be accompanied by a specific, actionable improvement suggestion.

**ATS Simulation Feedback**
- FR-05: The system SHALL simulate how an ATS (modelled on Greenhouse) would parse the CV, providing a structured simulation covering:
  - Extracted fields (name, contact details, work experience, education, skills)
  - At-risk content identified as likely to be filtered or misparsed by the ATS
  - Keyword presence report showing detected and absent high-priority keywords
  - ATS compatibility score from 0 to 100 with a tier label: Excellent (80–100), Good (60–79), Needs Work (40–59), or At Risk (0–39)

**Analysis Guard**
- FR-07: The system SHALL prevent analysis from running if the CV text field is empty.
- FR-08: When CV text is empty, the "Analyse CV" button SHALL be disabled and an inline hint SHALL read "Save your CV first to run analysis".

### Non-Functional Requirements

- NFR-01: CV analysis MUST complete within 10 seconds under normal load.
- NFR-02: Analysis results MUST be scoped to the authenticated user and never exposed to other users.

## Scenarios

### Scenario 1: CV analysis returns structured skills
**Given** the user has saved a non-empty CV  
**When** the user clicks "Analyse CV"  
**Then** the page displays a list of extracted skills, an experience summary, and education details returned by the AI

### Scenario 2: Gaps are surfaced as suggestions
**Given** CV analysis has completed  
**When** the user views the results panel  
**Then** they see a list of identified gaps, each with a specific and actionable improvement suggestion

### Scenario 3: ATS simulation panel shown after analysis
**Given** CV analysis has completed  
**When** the user views the results panel  
**Then** they see an ATS simulation panel including: extracted fields, at-risk content risks, a keyword presence report, and an ATS compatibility score with tier label

### Scenario 4: Empty CV blocks analysis
**Given** the user visits the CV & Analysis tab with no CV text saved  
**When** they view the tab  
**Then** the "Analyse CV" button is disabled and a hint reads "Save your CV first to run analysis"

## Acceptance Criteria

- [ ] AI extracts and displays: skills list, experience summary, education qualifications
- [ ] Gap identification panel shows gaps with actionable suggestions
- [ ] ATS simulation panel displayed (extracted fields, at-risk content, keyword presence report, compatibility score with tier label)
- [ ] "Analyse CV" button is disabled with inline hint when CV is empty
- [ ] Analysis results appear inline on the CV & Analysis tab without page reload
- [ ] Analysis completes within 10 seconds

## Implementation

**Status:** Pending
