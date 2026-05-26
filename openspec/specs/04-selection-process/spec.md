# Spec: 04 — Selection Process

## Overview

The Selection Process tracker guides candidates through every stage of the interview pipeline for a given candidature. For each stage, the app records progress, captures notes and feedback, and provides AI-powered interview preparation tailored to the specific role and company.

## Requirements

### Functional Requirements

**Stage Tracking**
- FR-01: Each candidature MUST have exactly 10 pre-defined stages in the following order:
  1. Application submitted
  2. Interview with recruiter
  3. Technical interview
  4. Use case or assignment
  5. Team interview
  6. Manager interview
  7. Client/Stakeholder interview
  8. Cultural interview
  9. Leadership interview
  10. Offer received / Candidature rejected
- FR-02: Each stage MUST have a status: `pending` | `scheduled` | `completed` | `skipped`.
- FR-03: "Application submitted" MUST be set to `completed` automatically when a candidature is created.
- FR-04: The user MUST be able to update the status of any stage.
- FR-05: The app MUST record the date when a stage is entered (`scheduled_at`) and completed (`completed_at`).
- FR-06: The user MUST be able to add notes to each stage (interview questions asked, feedback received, personal thoughts).

**AI Interview Preparation**
- FR-07: Selecting any stage MUST trigger AI generation of:
  - A brief overview of what to expect in that stage
  - 5 likely interview questions with:
    - Tips on how to answer
    - A sample answer tailored to the role and company
- FR-08: Interview prep content MUST be generated using the role title, company name, and stage context.

**Navigation**
- FR-09: The user MUST be able to access the Selection Process for any candidature from the candidature list or the navigation menu.
- FR-10: The current active stage MUST be visually highlighted.

### Non-Functional Requirements

- NFR-01: AI interview prep MUST load within 10 seconds.
- NFR-02: Stage status changes MUST be persisted immediately (no "save" button required).
- NFR-03: Notes MUST support plain text input of at least 2,000 characters.

## Scenarios

### Scenario 1: Viewing stages after candidature creation
**Given** a new candidature has been created  
**When** the user opens the Selection Process  
**Then** they see all 10 stages listed; "Application submitted" is marked `completed`, the rest are `pending`

### Scenario 2: Getting interview preparation
**Given** the user clicks on "Interview with recruiter"  
**Then** the AI generates: a stage overview and 5 interview questions with tips and sample answers for that specific role and company

### Scenario 3: Marking a stage as completed
**Given** the user has completed a recruiter call  
**When** they change the status of "Interview with recruiter" to `completed`  
**Then** the change is saved immediately and the stage is visually marked as done

### Scenario 4: Adding notes to a stage
**Given** the user has just finished a technical interview  
**When** they add notes about the questions asked and feedback received  
**Then** the notes are saved and visible when they return to that stage

### Scenario 5: Skipping a stage
**Given** a candidature skips the cultural interview  
**When** the user sets "Cultural interview" to `skipped`  
**Then** the stage is marked as skipped and does not block progress

## Acceptance Criteria

- [ ] All 10 stages are created for every candidature
- [ ] Stages are displayed in the correct order
- [ ] Stage status can be updated to: pending, scheduled, completed, skipped
- [ ] Status changes are persisted without a save action
- [ ] Dates are recorded when stages are scheduled and completed
- [ ] Notes field is available per stage
- [ ] Selecting a stage loads AI interview prep (overview + 5 Q&A)
- [ ] Active/current stage is visually highlighted
- [ ] Interview prep is specific to the role and company
