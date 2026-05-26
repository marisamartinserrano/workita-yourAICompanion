import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

interface Stage {
  id: string
  stage: string
  status: string
  notes: string
}

interface Candidature {
  id: string
  jobTitle: string
  company: string
  matchPercentage: number
  status: string
  positionSummary?: string | null
  stages: Stage[]
  analysis: {
    strengths: string[]
    gaps: string[]
    atsKeywords: string[]
  }
}

interface InterviewPrep {
  stageOverview: string
  questions: { question: string; tips: string; sampleAnswer: string }[]
}

const STATUS_OPTIONS = ['pending', 'scheduled', 'completed', 'skipped']

export default function SelectionProcess() {
  const { id } = useParams<{ id: string }>()
  const [candidature, setCandidature] = useState<Candidature | null>(null)
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [prep, setPrep] = useState<InterviewPrep | null>(null)
  const [loadingPrep, setLoadingPrep] = useState(false)

  useEffect(() => {
    api.get<Candidature>(`/candidatures/${id}`).then(setCandidature).catch(console.error)
  }, [id])

  const updateStage = async (stageId: string, updates: Partial<Stage>) => {
    await api.patch(`/candidatures/${id}/stages/${stageId}`, updates)
    setCandidature((c) => c ? { ...c, stages: c.stages.map(s => s.id === stageId ? { ...s, ...updates } : s) } : c)
  }

  const loadPrep = async (stage: Stage) => {
    setSelectedStage(stage)
    setPrep(null)
    setLoadingPrep(true)
    try {
      const result = await api.post<InterviewPrep>('/ai/interview-prep', {
        jobTitle: candidature!.jobTitle,
        company: candidature!.company,
        stage: stage.stage,
        positionSummary: candidature!.positionSummary ?? undefined,
      })
      setPrep(result)
    } catch (e) { console.error(e) }
    finally { setLoadingPrep(false) }
  }

  if (!candidature) return <div className="text-gray-400">Loading...</div>

  const statusIcon: Record<string, string> = { pending: '⬜', scheduled: '🗓️', completed: '✅', skipped: '⏭️' }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{candidature.jobTitle}</h1>
          <p className="text-gray-500">{candidature.company} · {candidature.matchPercentage}% match</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stages */}
        <div className="md:col-span-1">
          <h2 className="font-semibold text-gray-800 mb-3">📋 Selection Stages</h2>
          <div className="space-y-2">
            {candidature.stages.map((stage) => (
              <div
                key={stage.id}
                className={`rounded-lg border p-3 cursor-pointer transition-colors ${selectedStage?.id === stage.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                onClick={() => loadPrep(stage)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{stage.stage}</span>
                  <span>{statusIcon[stage.status] ?? '⬜'}</span>
                </div>
                <select
                  value={stage.status}
                  onChange={(e) => { e.stopPropagation(); updateStage(stage.id, { status: e.target.value }) }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Prep */}
        <div className="md:col-span-2">
          {!selectedStage ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">👈</div>
              <p>Select a stage to get AI interview preparation</p>
            </div>
          ) : loadingPrep ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
              <div className="text-3xl animate-pulse mb-2">🤖</div>
              <p>Preparing interview guidance...</p>
            </div>
          ) : prep ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 mb-1">{selectedStage.stage}</h2>
              <p className="text-sm text-gray-600 mb-4">{prep.stageOverview}</p>
              <div className="space-y-4">
                {prep.questions.map((q, i) => (
                  <details key={i} className="border border-gray-100 rounded-lg">
                    <summary className="px-4 py-3 font-medium text-gray-800 cursor-pointer hover:bg-gray-50 rounded-lg">
                      Q{i + 1}: {q.question}
                    </summary>
                    <div className="px-4 pb-4 pt-2 space-y-2">
                      <div className="text-sm bg-blue-50 border border-blue-100 rounded p-2">
                        <span className="font-medium text-blue-700">💡 Tip: </span>
                        <span className="text-blue-600">{q.tips}</span>
                      </div>
                      <div className="text-sm bg-gray-50 border border-gray-100 rounded p-2">
                        <span className="font-medium text-gray-700">💬 Sample: </span>
                        <span className="text-gray-600">{q.sampleAnswer}</span>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
