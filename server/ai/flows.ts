import { z } from 'zod'
import { ai } from './genkit.js'

// Analyze a job description and match against a candidate profile
export const analyzeJobFlow = ai.defineFlow(
  {
    name: 'analyzeJob',
    inputSchema: z.object({
      jobDescription: z.string(),
      candidateProfile: z.object({
        cvText: z.string().optional(),
        role: z.string().optional(),
        seniority: z.string().optional(),
        industry: z.string().optional(),
        skills: z.array(z.string()).optional(),
      }),
    }),
    outputSchema: z.object({
      jobTitle: z.string(),
      company: z.string(),
      matchPercentage: z.number(),
      strengths: z.array(z.string()),
      gaps: z.array(z.string()),
      keyDifferentiators: z.array(z.string()),
      atsKeywords: z.array(z.string()),
      cvRecommendations: z.array(z.string()),
      linkedinRecommendations: z.array(z.string()),
      companySummary: z.string(),
      roleRequirements: z.object({
        skills: z.array(z.string()),
        experienceLevel: z.string(),
        salary: z.string(),
      }),
      networkingGuidance: z.array(z.string()),
    }),
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `You are an expert career coach and recruiter. Analyze this job description and candidate profile.

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE PROFILE:
${input.candidateProfile.cvText || 'No CV provided'}
Role: ${input.candidateProfile.role || 'Not specified'}
Seniority: ${input.candidateProfile.seniority || 'Not specified'}
Industry: ${input.candidateProfile.industry || 'Not specified'}

Return a JSON object with:
- jobTitle: extracted job title
- company: company name
- matchPercentage: 0-100 match score
- strengths: array of candidate strengths for this role
- gaps: array of gaps or missing requirements
- keyDifferentiators: array of things that make this candidate stand out
- atsKeywords: important keywords for ATS optimization
- cvRecommendations: specific CV improvement suggestions
- linkedinRecommendations: LinkedIn profile improvement suggestions
- companySummary: brief company overview
- roleRequirements: object with:
  - skills: array of required skills extracted from the job description
  - experienceLevel: expected experience level (e.g. "3-5 years", "Senior", "Not specified")
  - salary: salary range if mentioned, otherwise "Not specified"
- networkingGuidance: array of 3-5 actionable tips for reaching out to the recruiter, hiring manager, or company employees on LinkedIn or by email. Be specific to the role and company where possible.

Respond ONLY with valid JSON, no markdown.`,
    })

    try {
      return JSON.parse(text) as {
        jobTitle: string
        company: string
        matchPercentage: number
        strengths: string[]
        gaps: string[]
        keyDifferentiators: string[]
        atsKeywords: string[]
        cvRecommendations: string[]
        linkedinRecommendations: string[]
        companySummary: string
        roleRequirements: { skills: string[]; experienceLevel: string; salary: string }
        networkingGuidance: string[]
      }
    } catch {
      throw new Error('Failed to parse job analysis response')
    }
  }
)

// Generate a compact structured position summary from a job description text
export const summarizePositionFlow = ai.defineFlow(
  {
    name: 'summarizePosition',
    inputSchema: z.object({ jobText: z.string() }),
    outputSchema: z.object({ summary: z.string() }),
  },
  async (input) => {
    const jobText = input.jobText.slice(0, 8000)
    const { text } = await ai.generate({
      prompt: `You are a job posting analyst. Extract a concise structured summary from this job posting. Return ONLY the plain-text summary with no JSON, no markdown, no extra commentary.

JOB POSTING:
${jobText}

Return exactly these 6 labelled lines (use "Not specified" if the information is absent):
Role: <job title and company name>
Key responsibilities: <3-5 comma-separated main duties>
Must-have skills: <comma-separated required skills/qualifications>
Nice-to-have: <comma-separated preferred/bonus skills>
Seniority signals: <experience years, team size, or level indicators mentioned>
Context: <one sentence about the team, product, or company from the posting>`,
    })
    return { summary: text.trim() }
  }
)

// Generate interview preparation questions for a stage
export const interviewPrepFlow = ai.defineFlow(
  {
    name: 'interviewPrep',
    inputSchema: z.object({
      jobTitle: z.string(),
      company: z.string(),
      stage: z.string(),
      candidateProfile: z.string().optional(),
      positionSummary: z.string().optional(),
    }),
    outputSchema: z.object({
      questions: z.array(z.object({
        question: z.string(),
        tips: z.string(),
        sampleAnswer: z.string(),
      })),
      stageOverview: z.string(),
    }),
  },
  async (input) => {
    const jobPostingContext = input.positionSummary
      ? `\nJob Posting Context:\n${input.positionSummary}\n`
      : ''

    const { text } = await ai.generate({
      prompt: `You are an expert interview coach. Generate interview preparation content for:

Role: ${input.jobTitle}
Company: ${input.company}
Interview Stage: ${input.stage}
Candidate Background: ${input.candidateProfile || 'Not provided'}${jobPostingContext}

Return a JSON object with:
- questions: array of 5 likely questions, each with: question, tips (how to answer), sampleAnswer
- stageOverview: brief description of what to expect in this stage

${input.positionSummary ? 'Ground the questions, tips, and sample answers in the specific skills, responsibilities, and context from the Job Posting Context above.' : ''}
Respond ONLY with valid JSON, no markdown.`,
    })

    return JSON.parse(text) as {
      questions: { question: string; tips: string; sampleAnswer: string }[]
      stageOverview: string
    }
  }
)

// Strip markdown code fences and extract raw JSON from AI output
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1) return raw.slice(firstBrace, lastBrace + 1)
  return raw.trim()
}

// Analyse a candidate CV: extract skills, experience, education, gaps, and ATS simulation
export const cvAnalysisFlow = ai.defineFlow(
  {
    name: 'cvAnalysis',
    inputSchema: z.object({ cvText: z.string() }),
    outputSchema: z.object({
      skills: z.array(z.string()),
      experience: z.array(z.string()),
      education: z.array(z.string()),
      gaps: z.array(z.object({ issue: z.string(), suggestion: z.string() })),
      atsSimulation: z.object({
        extractedFields: z.object({
          name: z.string(),
          email: z.string(),
          phone: z.string(),
          location: z.string(),
          linkedinUrl: z.string(),
          currentTitle: z.string(),
          workHistory: z.array(z.string()),
          education: z.array(z.string()),
          skills: z.array(z.string()),
        }),
        atRiskContent: z.array(z.object({
          element: z.string(),
          reason: z.string(),
        })),
        keywords: z.object({
          present: z.array(z.string()),
          absent: z.array(z.string()),
        }),
        score: z.number(),
        scoreTier: z.string(),
        scoreExplanation: z.string(),
      }),
    }),
  },
  async (input) => {
    // Truncate CV to avoid overflowing the model context and getting cut-off JSON
    const cvText = input.cvText.slice(0, 6000)

    const { text } = await ai.generate({
      prompt: `You are a CV analyst simulating how an ATS (Applicant Tracking System) like Greenhouse parses a candidate CV. Analyse the CV and return ONLY a JSON object — no markdown, no explanation.

CV:
${cvText}

Return this exact JSON shape:
{
  "skills": ["skill1", "skill2"],
  "experience": ["Role at Company (year–year)", "..."],
  "education": ["Degree, Institution (year)", "..."],
  "gaps": [{"issue": "...", "suggestion": "..."}],
  "atsSimulation": {
    "extractedFields": {
      "name": "Full Name or Not found",
      "email": "email@example.com or Not found",
      "phone": "+1234567890 or Not found",
      "location": "City, Country or Not found",
      "linkedinUrl": "linkedin.com/in/... or Not found",
      "currentTitle": "Current Job Title or Not found",
      "workHistory": ["Company A — Title (2020–2023)", "..."],
      "education": ["Degree, Institution (Year)", "..."],
      "skills": ["skill1", "skill2"]
    },
    "atRiskContent": [
      {"element": "element type", "reason": "why ATS may discard or garble it"}
    ],
    "keywords": {
      "present": ["keyword1", "keyword2"],
      "absent": ["keyword3", "keyword4"]
    },
    "score": 75,
    "scoreTier": "Good",
    "scoreExplanation": "Brief 1-2 sentence explanation of main score factors."
  }
}

Rules:
- skills: up to 12 items
- experience: up to 5 items
- education: up to 3 items
- gaps: exactly 3 items
- atsSimulation.extractedFields: use "Not found" for any field not present in the CV; workHistory up to 5 entries; education up to 3 entries; skills up to 10 items
- atsSimulation.atRiskContent: detect formatting risks from text artifacts — repeated | or — characters suggest tables; very short lines alternating with long lines suggest two-column layout; sections with no readable content suggest image-based headers or text boxes; graphics or logos cannot be read; return up to 10 risks or an empty array if none detected
- atsSimulation.keywords.present: up to 15 ATS-critical keywords found in the CV (action verbs, role titles, tech terms, certifications)
- atsSimulation.keywords.absent: up to 10 commonly expected keywords for this candidate's apparent role type that are missing
- atsSimulation.score: 0–100 integer. Scoring: contact info completeness (20pts) + structural parseability inferred from text (30pts) + keyword density (25pts) + work history clarity with clear dates/company/title (25pts)
- atsSimulation.scoreTier: "Excellent" if score>=85, "Good" if 70-84, "Needs Work" if 50-69, "At Risk" if <50
- Return ONLY the JSON object, nothing else`,
    })
    try {
      return JSON.parse(extractJson(text))
    } catch (err) {
      console.error('CV analysis parse error. Raw response:', text.slice(0, 500))
      throw new Error('Failed to parse CV analysis response')
    }
  }
)

// Generate LinkedIn profile improvement recommendations
export const linkedinRecommendationsFlow = ai.defineFlow(
  {
    name: 'linkedinRecommendations',
    inputSchema: z.object({
      cvText: z.string(),
      linkedinUrl: z.string().optional(),
    }),
    outputSchema: z.object({
      recommendations: z.array(z.object({
        text: z.string(),
        rationale: z.string(),
      })),
      hasLinkedinUrl: z.boolean(),
    }),
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `You are a LinkedIn profile expert and career coach. Based on this candidate's CV, generate specific LinkedIn profile improvement recommendations.

CV TEXT:
${input.cvText}
LinkedIn URL: ${input.linkedinUrl || 'Not provided'}

Generate 5-8 specific, actionable recommendations to improve their LinkedIn profile. Focus on:
- Profile headline and summary optimisation
- Skills section (what to add, reorder, or remove)
- Experience descriptions (keywords, achievements, ATS-friendliness)
- Profile completeness (photo, banner, about section)
- Consistency between CV and LinkedIn
- Recruiter discoverability

Return a JSON object with:
- recommendations: array of objects with "text" (the recommendation) and "rationale" (why it matters for candidates)

Respond ONLY with valid JSON, no markdown.`,
    })
    try {
      const result = JSON.parse(text) as { recommendations: { text: string; rationale: string }[] }
      return { ...result, hasLinkedinUrl: !!input.linkedinUrl }
    } catch {
      throw new Error('Failed to parse LinkedIn recommendations response')
    }
  }
)

// Assess LinkedIn profile suitability for a target role (role-targeted, persisted)
export const linkedinAnalysisFlow = ai.defineFlow(
  {
    name: 'linkedinAnalysis',
    inputSchema: z.object({
      cvText: z.string(),
      linkedinUrl: z.string().optional(),
      targetRole: z.string().optional(),
      industry: z.string().optional(),
      seniority: z.string().optional(),
    }),
    outputSchema: z.object({
      suitabilityStrengths: z.array(z.string()),
      suitabilityGaps: z.array(z.string()),
      harmonizationTips: z.array(z.string()),
      profileRecommendations: z.array(z.object({
        text: z.string(),
        rationale: z.string(),
      })),
      hasLinkedinUrl: z.boolean(),
      hasJobPreferences: z.boolean(),
    }),
  },
  async (input) => {
    const hasJobPreferences = !!(input.targetRole || input.industry || input.seniority)
    const roleContext = [
      input.targetRole && `Target Role: ${input.targetRole}`,
      input.seniority && `Seniority: ${input.seniority}`,
      input.industry && `Industry: ${input.industry}`,
    ].filter(Boolean).join('\n') || 'Not specified'

    const { text } = await ai.generate({
      prompt: `You are a LinkedIn profile expert and career strategist. Assess how well this candidate's LinkedIn profile positions them for their target role, and provide specific recommendations.

CV TEXT:
${input.cvText}

LinkedIn URL: ${input.linkedinUrl || 'Not provided'}

TARGET ROLE CONTEXT:
${roleContext}

Provide a thorough LinkedIn profile suitability assessment. Return a JSON object with:
- suitabilityStrengths: array of 3-5 things the candidate's LinkedIn profile does well for the target role (e.g. headline matches target role, relevant skills listed, strong experience section)
- suitabilityGaps: array of 3-5 gaps or misalignments between the LinkedIn profile and the target role requirements (e.g. missing key skills for the role, headline doesn't reflect target level, no recommendations from relevant peers)
- harmonizationTips: array of 3-5 specific actions to align the LinkedIn profile with the CV content (e.g. "Your CV mentions leading a team of 8 engineers — add this to your LinkedIn experience description", "CV lists Python but LinkedIn skills section doesn't include it")
- profileRecommendations: array of 5-7 objects with "text" (specific recommendation) and "rationale" (why it matters for recruiters searching for ${input.targetRole || 'this role'} in ${input.industry || 'this industry'})

Be specific and role-targeted. Reference the target role, seniority, and industry in your recommendations where relevant.
Respond ONLY with valid JSON, no markdown.`,
    })
    try {
      const result = JSON.parse(text) as {
        suitabilityStrengths: string[]
        suitabilityGaps: string[]
        harmonizationTips: string[]
        profileRecommendations: { text: string; rationale: string }[]
      }
      return { ...result, hasLinkedinUrl: !!input.linkedinUrl, hasJobPreferences }
    } catch {
      throw new Error('Failed to parse LinkedIn analysis response')
    }
  }
)

// Generate a glossary for a job description
export const glossaryFlow = ai.defineFlow(
  {
    name: 'generateGlossary',
    inputSchema: z.object({
      jobDescription: z.string(),
      industry: z.string().optional(),
    }),
    outputSchema: z.object({
      terms: z.array(z.object({
        term: z.string(),
        definition: z.string(),
        context: z.string(),
      })),
    }),
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `Extract and define key industry and technical terms from this job description.

JOB DESCRIPTION:
${input.jobDescription}
Industry: ${input.industry || 'Not specified'}

Return a JSON object with:
- terms: array of objects, each with: term, definition (clear explanation), context (why it matters for this role)

Focus on acronyms, technical terms, and industry jargon. Return 8-15 terms.
Respond ONLY with valid JSON, no markdown.`,
    })

    return JSON.parse(text) as {
      terms: { term: string; definition: string; context: string }[]
    }
  }
)

// Extract lightweight job metadata from a job posting text (for quick-add auto-fill)
export const extractJobMetadataFlow = ai.defineFlow(
  {
    name: 'extractJobMetadata',
    inputSchema: z.object({ jobText: z.string() }),
    outputSchema: z.object({
      jobTitle: z.string(),
      company: z.string(),
      role: z.string(),
      seniority: z.string(),
      location: z.string(),
      workMode: z.string(),
      industry: z.string(),
    }),
  },
  async (input) => {
    const jobText = input.jobText.slice(0, 8000)
    const { text } = await ai.generate({
      prompt: `You are a job posting parser. Extract the following fields from this job posting text. Return ONLY a JSON object, no markdown.

JOB POSTING:
${jobText}

Return this exact JSON shape:
{
  "jobTitle": "exact job title or Not found",
  "company": "company name or Not found",
  "role": "role/function (e.g. Software Engineer, Product Manager) or Not found",
  "seniority": "one of: Junior, Mid-level, Senior, Lead, Manager, Director, C-Level, or Not found",
  "location": "city and country or Not found",
  "workMode": "one of: On-site, Hybrid, Remote, or Not found",
  "industry": "industry sector or Not found"
}

Rules:
- Use "Not found" for any field not determinable from the text
- Return ONLY the JSON object, nothing else`,
    })
    try {
      return JSON.parse(extractJson(text)) as {
        jobTitle: string; company: string; role: string; seniority: string
        location: string; workMode: string; industry: string
      }
    } catch (err) {
      console.error('extractJobMetadata parse error. Raw response:', text.slice(0, 300))
      throw new Error('Failed to parse job metadata response')
    }
  }
)

// Generate a quiz for interview preparation
export const quizFlow = ai.defineFlow(
  {
    name: 'generateQuiz',
    inputSchema: z.object({
      jobTitle: z.string(),
      topic: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    }),
    outputSchema: z.object({
      questions: z.array(z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctIndex: z.number(),
        explanation: z.string(),
      })),
    }),
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `Create a ${input.difficulty} quiz for a ${input.jobTitle} candidate on the topic: ${input.topic}.

Return a JSON object with:
- questions: array of 5 multiple-choice questions, each with:
  - question: the question text
  - options: array of 4 answer options
  - correctIndex: index (0-3) of the correct answer
  - explanation: why the answer is correct

Respond ONLY with valid JSON, no markdown.`,
    })

    return JSON.parse(text) as {
      questions: {
        question: string
        options: string[]
        correctIndex: number
        explanation: string
      }[]
    }
  }
)
