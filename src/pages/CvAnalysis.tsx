import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AtsSimulation {
  extractedFields: {
    name: string
    email: string
    phone: string
    location: string
    linkedinUrl: string
    currentTitle: string
    workHistory: string[]
    education: string[]
    skills: string[]
  }
  atRiskContent: { element: string; reason: string }[]
  keywords: { present: string[]; absent: string[] }
  score: number
  scoreTier: string
  scoreExplanation: string
}

interface CvAnalysis {
  skills: string[]
  experience: string[]
  education: string[]
  gaps: { issue: string; suggestion: string }[]
  // New shape (cv-ats-simulation change)
  atsSimulation?: AtsSimulation
  // Legacy shape (pre cv-ats-simulation) — kept for graceful fallback
  atsFeedback?: { category: string; status: 'pass' | 'warn' | 'fail'; message: string }[]
}

interface ProfileData {
  cvFileName?: string
  cvFileType?: string
  cvText?: string
  cvAnalysisResult?: CvAnalysis
  cvAnalysisUpdatedAt?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score, tier }: { score: number; tier: string }) {
  const colour =
    score >= 85 ? 'text-green-700 bg-green-50 border-green-200' :
    score >= 70 ? 'text-teal-700 bg-teal-50 border-teal-200' :
    score >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                  'text-red-700 bg-red-50 border-red-200'
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-xl px-3 py-1 font-semibold text-sm ${colour}`}>
      <span className="text-lg font-bold">{score}</span>
      <span>— {tier}</span>
    </span>
  )
}

function ExtractedFieldRow({ label, value }: { label: string; value: string }) {
  const missing = value === 'Not found'
  return (
    <div className="flex gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <span className={`text-xs ${missing ? 'text-gray-400 italic' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}

function AtsSimulationPanel({ sim }: { sim: AtsSimulation }) {
  const { extractedFields: ef, atRiskContent, keywords, score, scoreTier, scoreExplanation } = sim
  return (
    <div className="space-y-5">
      {/* Score */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <ScoreBadge score={score} tier={scoreTier} />
        </div>
        <p className="text-xs text-gray-500 mt-1">{scoreExplanation}</p>
      </div>

      {/* Extracted fields */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">What the ATS extracts</h4>
        <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-2">
          <ExtractedFieldRow label="Name" value={ef.name} />
          <ExtractedFieldRow label="Email" value={ef.email} />
          <ExtractedFieldRow label="Phone" value={ef.phone} />
          <ExtractedFieldRow label="Location" value={ef.location} />
          <ExtractedFieldRow label="LinkedIn" value={ef.linkedinUrl} />
          <ExtractedFieldRow label="Current title" value={ef.currentTitle} />
          <ExtractedFieldRow label="Work history" value={ef.workHistory.length > 0 ? `${ef.workHistory.length} entr${ef.workHistory.length === 1 ? 'y' : 'ies'} detected` : 'Not found'} />
          <ExtractedFieldRow label="Education" value={ef.education.length > 0 ? `${ef.education.length} entr${ef.education.length === 1 ? 'y' : 'ies'} detected` : 'Not found'} />
          <ExtractedFieldRow label="Skills" value={ef.skills.length > 0 ? `${ef.skills.length} skills detected` : 'Not found'} />
        </div>
      </div>

      {/* At-risk content */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">At-risk content</h4>
        {atRiskContent.length === 0 ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm">
            <span>✅</span> No formatting risks detected
          </div>
        ) : (
          <div className="space-y-2">
            {atRiskContent.map((item, i) => (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <span className="shrink-0 text-amber-500">⚠️</span>
                <div>
                  <p className="text-xs font-semibold text-amber-800">{item.element}</p>
                  <p className="text-xs text-amber-700 mt-0.5">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keywords */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Keyword presence</h4>
        {keywords.present.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1.5">Present in CV</p>
            <div className="flex flex-wrap gap-1.5">
              {keywords.present.map(kw => (
                <span key={kw} className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium">{kw}</span>
              ))}
            </div>
          </div>
        )}
        {keywords.absent.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-1.5">Consider adding</p>
            <div className="flex flex-wrap gap-1.5">
              {keywords.absent.map(kw => (
                <span key={kw} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-medium">{kw}</span>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1">Keywords are role-type generic — not matched to a specific job description.</p>
      </div>
    </div>
  )
}

function CvAnalysisPanel({ analysis, updatedAt }: { analysis: CvAnalysis; updatedAt?: string }) {
  return (
    <div className="space-y-6">
      {updatedAt && (
        <p className="text-xs text-gray-400">
          Last analysed: {new Date(updatedAt).toLocaleString()}
        </p>
      )}

      {/* Skills */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">🏷️ Identified Skills</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.skills.map(skill => (
            <span key={skill} className="bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2.5 py-1 rounded-full font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      {analysis.experience.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">💼 Experience Highlights</h3>
          <ul className="space-y-1">
            {analysis.experience.map((item, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-300 shrink-0">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Education */}
      {analysis.education.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">🎓 Education</h3>
          <ul className="space-y-1">
            {analysis.education.map((item, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-300 shrink-0">•</span>{item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {analysis.gaps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">🔍 Gaps & Improvements</h3>
          <div className="space-y-2">
            {analysis.gaps.map((gap, i) => (
              <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm font-medium text-amber-800">{gap.issue}</p>
                <p className="text-xs text-amber-700 mt-1">💡 {gap.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Simulation */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🤖 ATS Simulation <span className="font-normal text-gray-400">(Greenhouse)</span></h3>
        {analysis.atsSimulation ? (
          <AtsSimulationPanel sim={analysis.atsSimulation} />
        ) : (
          /* Graceful fallback for results stored before this change */
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
            <span>🔄</span>
            <span>Re-analyse your CV to see the ATS simulation.</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CvAnalysis() {
  const [cvFileName, setCvFileName] = useState<string | null>(null)
  const [cvFileType, setCvFileType] = useState<string | null>(null)
  const [hasCvText, setHasCvText] = useState(false)
  const [cvAnalysis, setCvAnalysis] = useState<CvAnalysis | null>(null)
  const [cvAnalysisUpdatedAt, setCvAnalysisUpdatedAt] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [lowExtractionWarning, setLowExtractionWarning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<ProfileData>('/profile').then(p => {
      if (!p) return
      if (p.cvFileName) setCvFileName(p.cvFileName)
      if (p.cvFileType) setCvFileType(p.cvFileType)
      if (p.cvText) setHasCvText(true)
      if (p.cvAnalysisResult) setCvAnalysis(p.cvAnalysisResult)
      if (p.cvAnalysisUpdatedAt) setCvAnalysisUpdatedAt(p.cvAnalysisUpdatedAt)
    }).catch(console.error)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setLowExtractionWarning(false)

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File must be under 5MB')
      return
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Please upload a PDF or Word document (.doc, .docx)')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('cv', file)
      const token = localStorage.getItem('workita_token')
      const res = await fetch('/api/profile/cv', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json() as { cvFileName: string; cvFileType: string; warning?: string }
      setCvFileName(data.cvFileName)
      setCvFileType(data.cvFileType)
      setHasCvText(true)
      if (data.warning === 'low_extraction') setLowExtractionWarning(true)
    } catch (err) {
      setUploadError('Upload failed. Please try again.')
      console.error(err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const result = await api.post<{ cvAnalysis: CvAnalysis }>('/profile/analyze', {})
      setCvAnalysis(result.cvAnalysis)
      setCvAnalysisUpdatedAt(new Date().toISOString())
    } catch (err) {
      setAnalyzeError('Analysis failed. Please try again.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  const fileIcon = cvFileType === 'application/pdf' ? '📄' : '📝'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CV Analysis</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload your CV to extract skills, identify gaps, and get ATS compatibility feedback.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Your CV</h2>

        {/* Current file status */}
        {cvFileName ? (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-2xl">{fileIcon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">{cvFileName}</p>
              <p className="text-xs text-gray-400">Uploaded CV</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No CV uploaded yet.</p>
        )}

        {/* Low extraction warning */}
        {lowExtractionWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            ⚠️ We couldn't extract much text from this PDF — it may be scanned. Your analysis may be limited.
          </div>
        )}

        {/* Upload button */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              uploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              {uploading ? <><span className="animate-spin">⏳</span> Uploading…</> : <><span>📎</span> {cvFileName ? 'Replace CV' : 'Upload CV'}</>}
            </span>
          </label>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !hasCvText}
            title={!hasCvText ? 'Upload a CV first to run analysis' : undefined}
            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing ? <><span className="animate-spin">⏳</span> Analysing…</> : <><span>🤖</span> Analyse CV</>}
          </button>

          {!hasCvText && (
            <span className="text-xs text-gray-400">Upload a CV first to run analysis</span>
          )}
        </div>

        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        {analyzeError && <p className="text-sm text-red-600">{analyzeError}</p>}
        <p className="text-xs text-gray-400">Accepted formats: PDF, .doc, .docx — max 5MB</p>
      </div>

      {/* Analysis loading */}
      {analyzing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-3xl animate-pulse mb-2">🤖</div>
          <p className="text-gray-500 text-sm">Analysing your CV — this takes a few seconds…</p>
        </div>
      )}

      {/* Analysis results */}
      {cvAnalysis && !analyzing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-1">Analysis Results</h3>
          <CvAnalysisPanel analysis={cvAnalysis} updatedAt={cvAnalysisUpdatedAt ?? undefined} />
        </div>
      )}
    </div>
  )
}
