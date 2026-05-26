## Context

Interview prep today is generated from just `jobTitle`, `company`, and `stage`. The full job description text (`jobDescription`) is already fetched and stored at candidature creation time (for `analyzeJobFlow`), but it is never made available to the interview coach. As a result, questions and sample answers are role-generic — they would be identical for two different "Senior Product Manager" postings at the same company, even if the actual requirements differ significantly.

The fix is a two-step enrichment:
1. **At creation time** — derive a compact, structured position summary from the job description text and store it on the candidature.
2. **At interview-prep time** — pass the stored summary into `interviewPrepFlow` so the AI can anchor questions to the actual skills, stack, and context of that specific posting.

Current data flow:
```
POST /candidatures
  → fetchJobText(url) → jobDescriptionText
  → extractJobMetadataFlow  (company, role, etc.)
  → analyzeJobFlow           (match%, analysis)
  → DB: candidatures (jobDescription stored, positionSummary NOT stored)

POST /ai/interview-prep
  ← { jobTitle, company, stage }   ← SelectionProcess.tsx
  → interviewPrepFlow(jobTitle, company, stage)
```

Target data flow:
```
POST /candidatures
  → fetchJobText(url) → jobDescriptionText
  → extractJobMetadataFlow
  → analyzeJobFlow
  → summarizePositionFlow   (NEW — position summary)
  → DB: candidatures (positionSummary stored)

POST /ai/interview-prep
  ← { jobTitle, company, stage, positionSummary? }  ← SelectionProcess.tsx
  → interviewPrepFlow(jobTitle, company, stage, positionSummary?)
```

## Goals / Non-Goals

**Goals:**
- Generate and persist a structured position summary at candidature creation time when job description text is available
- Thread `positionSummary` from the candidature record through to `interviewPrepFlow`
- Make interview questions, tips, and sample answers specific to the actual posting requirements
- Maintain full backward compatibility: candidatures without a `positionSummary` work exactly as today

**Non-Goals:**
- Re-generating the summary for existing candidatures (no backfill migration)
- Surfacing the position summary as a visible UI element (it is an internal prompt-enrichment artefact)
- Replacing or merging with the existing `analyzeJobFlow` full analysis

## Decisions

### D1: Separate `summarizePositionFlow`, not reusing `analyzeJobFlow`

`analyzeJobFlow` produces a large multi-section analysis (match %, strengths, gaps, ATS keywords, CV recs, LinkedIn recs). Its output is not structured for prompt injection into a conversational interview coach.

A dedicated `summarizePositionFlow` is cheaper (shorter prompt + output), produces a compact block shaped for interview prep context, and can be iterated independently.

**Alternative considered:** Extract the position summary from the existing `analysis` JSON stored on the candidature. Rejected — `analysis` is generated only when a profile exists, and its structure is not stable enough for reliable prompt injection.

### D2: Plain-text summary, not structured JSON

The summary is injected verbatim into the `interviewPrepFlow` prompt. Plain text (4–8 bullet lines) is more robust than JSON inside a prompt — it reads naturally for the model and degrades gracefully if incomplete.

Format:
```
Role: <title> at <company>
Key responsibilities: <comma-separated list>
Must-have skills: <comma-separated list>
Nice-to-have: <comma-separated list>
Seniority signals: <e.g. "5+ years, leads a team of 3">
Context: <one-sentence company/team context from the posting>
```

**Alternative considered:** Storing a JSON object with typed fields. Rejected — adds parsing complexity in the prompt builder and provides no measurable quality benefit over inline text.

### D3: Non-fatal generation — candidature saves regardless

`summarizePositionFlow` failures must not block the candidature save. Wrap in try/catch exactly like `analyzeJobFlow`. If it fails, `positionSummary` is `null` and interview prep falls back silently to the current title+company-only behaviour.

### D4: Summary generated only when `jobDescriptionText` is available

If the URL fetch failed (e.g. LinkedIn, auth-gated page), `jobDescriptionText` is `null` and no summary is attempted. The position summary is therefore only available when the server successfully fetched and stripped the posting — the same condition that enables `analyzeJobFlow`.

### D5: `positionSummary` passed from frontend, not re-fetched from DB server-side

`SelectionProcess.tsx` already loads the full candidature on mount. Adding `positionSummary` to the interview-prep request is a single-field addition to an existing API call. Re-fetching it server-side in the `/ai/interview-prep` route would require a DB lookup per request and coupling the AI route to the candidatures table — unnecessary complexity.

## Risks / Trade-offs

- **Token cost increase** — `summarizePositionFlow` adds one AI call per candidature creation when a job description is available. Mitigated by short prompt + capped input (8000 chars, same as `extractJobMetadataFlow`).
- **Summary quality varies with posting quality** — poorly written or minimal job descriptions produce thin summaries. Mitigated by graceful degradation (null summary = existing behaviour).
- **Interview prep prompt length grows** — injecting the summary adds ~150–250 tokens to each interview-prep call. Acceptable within Gemini 2.5 Flash context limits.
- **No backfill for existing candidatures** — users with candidatures created before this change won't get enriched interview prep. Accepted trade-off; backfill can be a follow-on change if needed.

## Migration Plan

1. Add `positionSummary` column (nullable text) to `candidatures` via Drizzle migration
2. Apply migration with `drizzle-kit push`
3. Deploy server changes (new flow, updated routes)
4. Deploy client changes (pass `positionSummary` in interview-prep calls)
5. **Rollback**: column is nullable — removing the frontend field reverts to prior behaviour without a schema rollback

## Open Questions

- Should the position summary be regenerated if the user manually edits the `jobDescription` text? (Out of scope for now — no edit UI exists for `jobDescription`.)
- Should we expose a "regenerate summary" button for candidatures where the initial fetch failed and the user later pastes the job description? (Deferred to a follow-on change.)
