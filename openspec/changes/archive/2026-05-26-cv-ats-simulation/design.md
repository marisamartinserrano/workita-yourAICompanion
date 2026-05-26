## Context

The CV Analysis page currently calls `cvAnalysisFlow` which returns an `atsFeedback` array — four items with a category, a `pass|warn|fail` status, and a message. This gives surface-level feedback but does not show candidates what an ATS actually *does* with their CV.

Greenhouse (and similar ATS platforms: Lever, Workday, Taleo) parse CVs into a structured candidate record. The parsing pipeline:
1. Extracts text from the document (PDF/DOCX)
2. Attempts to identify named fields: full name, email, phone, LinkedIn URL, location, current company, current title
3. Segments work history into discrete entries (company, title, dates, bullet points)
4. Segments education into entries (institution, degree, dates)
5. Collects a flat list of skills/technologies
6. Discards anything that can't be mapped to a structured field — tables often become garbled text, text boxes are skipped, graphics are invisible, multi-column layouts confuse the segmenter

The AI already receives the extracted text from the CV. The simulation is based on that text — we do not have the original file at flow-time (only raw text), so the simulation is an inference from what the AI can and cannot see in the text.

## Goals / Non-Goals

**Goals:**
- Replace `atsFeedback` with `atsSimulation` in the `cvAnalysisFlow` output schema
- AI infers what Greenhouse would successfully extract from the CV text
- AI identifies structural patterns in the CV that are ATS risks (tables, columns, headers as images inferred from gaps in text, repetitive delimiter characters)
- AI surfaces which important keywords are present and which common ones for the role type are absent
- A 0–100 ATS compatibility score with a short explanation
- The CvAnalysis page renders a dedicated simulation panel

**Non-Goals:**
- Actually submitting the CV to Greenhouse or any external ATS
- Parsing the raw binary file to detect tables/columns (we only have extracted text)
- Job-description-specific keyword matching (no JD available in this flow; keywords are role-type generic)
- Storing the old `atsFeedback` shape — old stored results simply re-analyse on next click

## Decisions

### 1. Keep `atsSimulation` as a single nested object, not an array

Rationale: The simulation has logically distinct sections (extracted fields, risks, keywords, score) that are always present. An array forces the frontend to find items by type. A typed object is cleaner and easier to render.

### 2. AI infers filtering risks from text artifacts, not binary parsing

The server already extracts text from the CV before calling the AI. The AI receives only text. Rather than re-parsing the binary (adding complexity and a second extraction pass), we ask the AI to infer formatting risks from text artifacts:
- Multiple `|` or `─` characters → likely table
- Very short lines interleaved with long lines → possible two-column layout
- Section titles that are entirely missing typical resume content → may have been image-based

This is inference, not fact — acknowledged in the UI with "ATS may have trouble with" framing.

### 3. `atsFeedback` is removed from the schema (breaking change)

Old stored `cvAnalysisResult` rows contain `atsFeedback`. The new shape does not include it. Rather than a DB migration:
- The frontend checks for `atsSimulation` key presence; if absent (old result), it shows a "Re-analyse to see ATS simulation" prompt instead of the old cards
- No data loss — users who re-analyse get the new result; old results remain in the DB until overwritten

### 4. Keyword list is role-type generic, not JD-specific

At CV analysis time we have no job description. The AI infers likely important keywords from the candidate's apparent role type (e.g. software engineer → Python, Git, Agile; product manager → roadmap, stakeholders, OKRs). This is noted in the UI.

### 5. Score methodology

The AI assigns a 0–100 score based on:
- Contact info completeness (20 pts)
- Structural parseability (30 pts — inferred from text artifacts)
- Keyword density (25 pts)
- Work history clarity (25 pts — clear dates, company, title per entry)

The AI does not expose the breakdown by default; the score is accompanied by a 1–2 sentence explanation and a tier label (Excellent ≥85, Good 70–84, Needs Work 50–69, At Risk <50).

## Risks / Trade-offs

- **Inference is imperfect**: The AI is guessing at formatting issues from text artifacts. False positives (flagging risks that don't exist) and false negatives (missing real issues) are expected. Mitigation: use "may" / "at risk" language throughout; do not say "will be filtered."
- **Schema breaking change**: Stored `cvAnalysisResult` rows become stale. Mitigation: graceful degradation in the frontend (re-analyse prompt for old results).
- **Prompt length**: Adding atsSimulation to the already-trimmed cvAnalysis prompt. Mitigation: keep the simulation output compact; extracted fields are short strings, risks are short bullets, keywords are flat arrays.

## Migration Plan

1. Update `cvAnalysisFlow` schema and prompt (server)
2. Rebuild Docker image — new analyses produce new shape
3. Update `CvAnalysis.tsx` to render `atsSimulation`; add graceful fallback for old `atsFeedback` shape
4. No DB migration required
