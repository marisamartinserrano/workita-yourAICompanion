# Spec: CV ATS Simulation

## Overview

The CV ATS Simulation feature extends the CV Analysis capability with a dedicated simulation panel that models how a modern Applicant Tracking System (ATS) — modelled on Greenhouse — would parse and evaluate the candidate's CV. It provides structured, actionable feedback across four dimensions: extracted fields, at-risk content, keyword presence, and an overall compatibility score.

## Requirements

### Functional Requirements

**ATS Extracted Fields**
- FR-01: The ATS simulation panel SHALL display the fields that the ATS would extract from the CV, including:
  - Candidate name
  - Contact details (email, phone, location)
  - Work experience entries (company, title, dates, description)
  - Education entries (institution, degree, dates)
  - Skills list

**ATS Filtered Content Risks**
- FR-02: The system SHALL identify content in the CV that an ATS is likely to filter out or misparse, including:
  - Tables and multi-column layouts
  - Headers and footers
  - Graphics, icons, or images
  - Uncommon fonts or special characters
  - Text embedded in text boxes or shapes
- FR-03: Each identified at-risk content item SHALL be flagged with a description of the risk and a recommendation to remediate it.

**ATS Keyword Presence Report**
- FR-04: The system SHALL generate a keyword presence report that shows:
  - Keywords detected in the CV that are relevant to the target role or industry
  - Important keywords that are absent or low-frequency
- FR-05: The keyword presence report SHALL distinguish between high-priority and secondary keywords.

**ATS Compatibility Score**
- FR-06: The system SHALL compute an ATS compatibility score from 0 to 100.
- FR-07: The compatibility score SHALL be accompanied by a tier label:
  - **Excellent** (80–100)
  - **Good** (60–79)
  - **Needs Work** (40–59)
  - **At Risk** (0–39)

**Graceful Fallback for Old Analysis Results**
- FR-08: When an existing analysis result was produced before the ATS simulation feature was introduced, the system SHALL display a graceful fallback message in the ATS simulation panel (e.g. "ATS simulation not available for this analysis — re-run analysis to generate results") instead of an error or blank panel.

### Non-Functional Requirements

- NFR-01: The ATS simulation panel MUST render within the same 10-second analysis window defined for the overall CV analysis.
- NFR-02: ATS simulation results MUST be scoped to the authenticated user and never exposed to other users.

## Scenarios

### Scenario 1: ATS simulation panel shows extracted fields
**Given** CV analysis has completed  
**When** the user views the ATS simulation panel  
**Then** they see the fields the ATS would extract: name, contact details, work experience entries, education entries, and skills list

### Scenario 2: At-risk content is flagged
**Given** CV analysis has completed  
**When** the user views the ATS simulation panel  
**Then** any content likely to be filtered or misparsed by the ATS is highlighted with a description of the risk and a remediation recommendation

### Scenario 3: Keyword presence report is shown
**Given** CV analysis has completed  
**When** the user views the ATS simulation panel  
**Then** they see a keyword presence report listing detected keywords and flagging absent or low-frequency high-priority keywords

### Scenario 4: Compatibility score displayed with tier label
**Given** CV analysis has completed  
**When** the user views the ATS simulation panel  
**Then** a numeric score from 0–100 is displayed alongside the appropriate tier label (Excellent / Good / Needs Work / At Risk)

### Scenario 5: Graceful fallback for old analysis results
**Given** an existing analysis result was generated before the ATS simulation feature existed  
**When** the user views the ATS simulation panel  
**Then** a fallback message is shown prompting the user to re-run the analysis, with no error or blank panel

## Acceptance Criteria

- [ ] ATS simulation panel displays extracted fields (name, contact, experience, education, skills)
- [ ] At-risk content items are flagged with risk description and remediation recommendation
- [ ] Keyword presence report shows detected keywords and flags absent high-priority keywords
- [ ] Compatibility score (0–100) is displayed with the correct tier label (Excellent / Good / Needs Work / At Risk)
- [ ] Old analysis results show a graceful fallback message in the ATS simulation panel

## Implementation

**Status:** Pending
