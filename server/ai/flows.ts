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

Respond ONLY with valid JSON, no markdown.`,
    })

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
    }
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
    const { text } = await ai.generate({
      prompt: `You are an expert interview coach. Generate interview preparation content for:

Role: ${input.jobTitle}
Company: ${input.company}
Interview Stage: ${input.stage}
Candidate Background: ${input.candidateProfile || 'Not provided'}

Return a JSON object with:
- questions: array of 5 likely questions, each with: question, tips (how to answer), sampleAnswer
- stageOverview: brief description of what to expect in this stage

Respond ONLY with valid JSON, no markdown.`,
    })

    return JSON.parse(text) as {
      questions: { question: string; tips: string; sampleAnswer: string }[]
      stageOverview: string
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
