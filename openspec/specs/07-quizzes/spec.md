# Spec: 07 — Quizzes

## Overview

Quizzes offer a playful, interactive way for candidates to test and reinforce their knowledge before interviews. Questions are AI-generated and tailored to the user's active candidature, covering job requirements, ATS best practices, LinkedIn optimisation, interview preparation, and glossary terms.

## Requirements

### Functional Requirements

**Quiz Generation**
- FR-01: The user MUST be able to generate a quiz by specifying:
  - Job Title (required)
  - Topic (required) — e.g., "Agile methodology", "SQL", "Leadership", "ATS optimisation"
  - Difficulty: Easy / Medium / Hard (required, default: Medium)
- FR-02: The AI MUST generate exactly 5 multiple-choice questions per quiz.
- FR-03: Each question MUST have:
  - Question text
  - 4 answer options (A–D)
  - One correct answer
  - An explanation shown after submission
- FR-04: Quizzes SHOULD be focused on the user's latest candidature by default, using its job title and role context.

**Topics Covered**
- FR-05: The quiz engine MUST support the following topic areas:
  - Understanding job descriptions and role requirements
  - Optimising CVs for ATS
  - LinkedIn profile best practices
  - Interview preparation (by stage: recruiter, technical, case study, cultural, etc.)
  - Professional networking strategies
  - Glossary terms (role, industry, company-specific)

**Interaction**
- FR-06: The user MUST be able to select one answer per question before submitting.
- FR-07: The user MUST be able to submit all answers at once with a "Submit" button.
- FR-08: The Submit button MUST be disabled until all 5 questions have been answered.
- FR-09: After submission, the app MUST display:
  - Score (X out of 5)
  - A result message based on score (e.g., "Excellent!" ≥ 4, "Good effort" ≥ 3, "Keep studying" < 3)
  - Each question marked as correct or incorrect
  - The explanation for every question
- FR-10: The user MUST be able to generate a new quiz after completing one.

### Non-Functional Requirements

- NFR-01: Quiz generation MUST complete within 10 seconds.
- NFR-02: The quiz UI MUST prevent answer changes after submission.
- NFR-03: Quizzes do NOT need to be persisted in the database (session-only is acceptable for v1).

## Scenarios

### Scenario 1: Generating a quiz on a specific topic
**Given** the user is applying for a Product Manager role  
**When** they generate a Medium quiz on "Agile methodology"  
**Then** the AI returns 5 multiple-choice questions about Agile tailored to a Product Manager context

### Scenario 2: Submitting answers and seeing results
**Given** the user has answered all 5 questions  
**When** they click "Submit Answers"  
**Then** they see their score, each question is highlighted as correct/incorrect, and explanations are shown

### Scenario 3: Blocked submission
**Given** the user has only answered 3 out of 5 questions  
**When** they try to click "Submit"  
**Then** the button remains disabled and a hint indicates unanswered questions

### Scenario 4: Generating another quiz
**Given** the user just completed a quiz and scored 3/5  
**When** they click "Generate New Quiz" or change the topic  
**Then** a fresh set of 5 questions is generated

### Scenario 5: Interview stage quiz
**Given** the user is preparing for a Technical interview  
**When** they select "Interview preparation" as the topic with "Technical interview" context  
**Then** the quiz covers likely technical interview questions for their specific role

## Acceptance Criteria

- [ ] Job title, topic, and difficulty inputs are present
- [ ] Exactly 5 multiple-choice questions are generated per quiz
- [ ] Each question has 4 options, one correct answer, and an explanation
- [ ] Answers can be selected before submission
- [ ] Submit button is disabled until all 5 questions are answered
- [ ] Score and result message are shown after submission
- [ ] Correct/incorrect state is shown per question after submission
- [ ] Explanations are revealed after submission
- [ ] User can generate a new quiz after completing one
- [ ] All topic areas listed in FR-05 are supported
