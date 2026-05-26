import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkedinAnalysis {
  suitabilityStrengths: string[]
  suitabilityGaps: string[]
  harmonizationTips: string[]
  profileRecommendations: { text: string; rationale: string }[]
  hasLinkedinUrl: boolean
  hasJobPreferences: boolean
}

interface ProfileData {
  linkedinUrl?: string
  linkedinAnalysisResult?: LinkedinAnalysis
  linkedinAnalysisUpdatedAt?: string
  cvText?: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Explainer() {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>📘 How LinkedIn works for candidates</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-600 space-y-2 border-t border-gray-100 pt-3">
          <p>LinkedIn's algorithm surfaces profiles based on <strong>keyword relevance</strong>, <strong>profile completeness</strong>, and <strong>connection proximity</strong> to the recruiter.</p>
          <p>Recruiters search by job title, skills, and location. Your headline and skills section carry the most weight for keyword matching.</p>
          <p>A complete profile (photo, summary, all sections filled) gets up to <strong>40× more recruiter views</strong> than an incomplete one.</p>
          <p>Consistency between your CV and LinkedIn is critical — discrepancies raise red flags during background checks.</p>
        </div>
      )}
    </div>
  )
}

function AnalysisResults({ analysis, updatedAt }: { analysis: LinkedinAnalysis; updatedAt?: string }) {
  return (
    <div className="space-y-6">
      {updatedAt && (
        <p className="text-xs text-gray-400">Last analysed: {new Date(updatedAt).toLocaleString()}</p>
      )}

      {/* Notice banners */}
      {!analysis.hasLinkedinUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
          💡 Add your LinkedIn URL above for a more targeted assessment.
        </div>
      )}
      {!analysis.hasJobPreferences && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          🎯 <Link to="/profile" className="underline font-medium">Complete your Job Preferences</Link> for a role-specific assessment.
        </div>
      )}

      {/* Suitability: Strengths & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ Suitability Strengths</h3>
          <ul className="space-y-1">
            {analysis.suitabilityStrengths.map((s, i) => (
              <li key={i} className="text-sm text-green-700 flex gap-2">
                <span className="shrink-0 text-green-400">•</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">⚠️ Suitability Gaps</h3>
          <ul className="space-y-1">
            {analysis.suitabilityGaps.map((g, i) => (
              <li key={i} className="text-sm text-red-700 flex gap-2">
                <span className="shrink-0 text-red-400">•</span>{g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Harmonization tips */}
      {analysis.harmonizationTips.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">🔄 Harmonize with your CV</h3>
          <ul className="space-y-1.5">
            {analysis.harmonizationTips.map((tip, i) => (
              <li key={i} className="text-sm text-indigo-700 flex gap-2">
                <span className="shrink-0 text-indigo-400">•</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Profile recommendations */}
      {analysis.profileRecommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">💡 Profile Recommendations</h3>
          <div className="space-y-3">
            {analysis.profileRecommendations.map((rec, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
                <p className="text-sm font-medium text-gray-900">{rec.text}</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  <span className="font-medium text-gray-600">Why: </span>{rec.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LinkedinAnalysis() {
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [hasCvText, setHasCvText] = useState(false)
  const [analysis, setAnalysis] = useState<LinkedinAnalysis | null>(null)
  const [analysisUpdatedAt, setAnalysisUpdatedAt] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  useEffect(() => {
    api.get<ProfileData>('/profile').then(p => {
      if (!p) return
      if (p.linkedinUrl) setLinkedinUrl(p.linkedinUrl)
      if (p.cvText) setHasCvText(true)
      if (p.linkedinAnalysisResult) setAnalysis(p.linkedinAnalysisResult)
      if (p.linkedinAnalysisUpdatedAt) setAnalysisUpdatedAt(p.linkedinAnalysisUpdatedAt)
    }).catch(console.error)
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/profile', { linkedinUrl })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      // Save URL first so the analysis uses the latest value
      await api.post('/profile', { linkedinUrl })
      const result = await api.post<{ linkedinAnalysis: LinkedinAnalysis }>('/profile/linkedin-analyze', {})
      setAnalysis(result.linkedinAnalysis)
      setAnalysisUpdatedAt(new Date().toISOString())
    } catch (err) {
      setAnalyzeError('Analysis failed. Please try again.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LinkedIn Analysis</h1>
        <p className="text-gray-500 text-sm mt-1">
          Assess how well your LinkedIn profile positions you for your target role, and get specific improvement recommendations.
        </p>
      </div>

      {/* LinkedIn URL card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Your LinkedIn Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={e => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Save URL'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Saved!</span>
            )}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !hasCvText}
              title={!hasCvText ? 'Upload your CV first to run analysis' : undefined}
              className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? <><span className="animate-spin">⏳</span> Analysing…</> : <><span>🔗</span> Analyse LinkedIn</>}
            </button>
            {!hasCvText && (
              <span className="text-xs text-gray-400">
                <Link to="/profile/cv-analysis" className="text-primary-600 underline">Upload your CV</Link> first to run analysis
              </span>
            )}
          </div>
          {analyzeError && <p className="text-sm text-red-600">{analyzeError}</p>}
        </form>
      </div>

      {/* Explainer */}
      <Explainer />

      {/* Analysis loading */}
      {analyzing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-3xl animate-pulse mb-2">🔗</div>
          <p className="text-gray-500 text-sm">Analysing your LinkedIn profile — this takes a few seconds…</p>
        </div>
      )}

      {/* Analysis results */}
      {analysis && !analyzing && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Analysis Results</h3>
          <AnalysisResults analysis={analysis} updatedAt={analysisUpdatedAt ?? undefined} />
        </div>
      )}

      {/* Empty state */}
      {!analysis && !analyzing && (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-4xl mb-3">🔗</div>
          <p className="text-gray-500 text-sm">
            Click <strong>Analyse LinkedIn</strong> to get a role-targeted suitability assessment.
          </p>
        </div>
      )}
    </div>
  )
}
