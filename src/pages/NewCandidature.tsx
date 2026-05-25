import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

interface Analysis {
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

interface Candidature {
  id: string
  analysis: Analysis
}

export default function NewCandidature() {
  const navigate = useNavigate()
  const [jobDescription, setJobDescription] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Candidature | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDescription.trim()) return
    setLoading(true)
    setError('')
    try {
      const candidature = await api.post<Candidature>('/candidatures', { jobDescription, jobUrl })
      setResult(candidature)
    } catch (err) {
      setError('Failed to analyze job description. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    const a = result.analysis
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{a.jobTitle}</h1>
            <p className="text-gray-500">{a.company}</p>
          </div>
          <div className="text-center bg-primary-50 border border-primary-200 rounded-xl px-6 py-3">
            <div className="text-3xl font-bold text-primary-600">{a.matchPercentage}%</div>
            <div className="text-xs text-gray-500">Match</div>
          </div>
        </div>

        {a.companySummary && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <h2 className="font-semibold text-gray-800 mb-2">🏢 About the Company</h2>
            <p className="text-sm text-gray-600">{a.companySummary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h2 className="font-semibold text-green-800 mb-2">✅ Strengths</h2>
            <ul className="space-y-1">{a.strengths.map((s, i) => <li key={i} className="text-sm text-green-700">• {s}</li>)}</ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h2 className="font-semibold text-red-800 mb-2">⚠️ Gaps</h2>
            <ul className="space-y-1">{a.gaps.map((g, i) => <li key={i} className="text-sm text-red-700">• {g}</li>)}</ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h2 className="font-semibold text-blue-800 mb-2">⭐ Key Differentiators</h2>
            <ul className="space-y-1">{a.keyDifferentiators.map((d, i) => <li key={i} className="text-sm text-blue-700">• {d}</li>)}</ul>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h2 className="font-semibold text-purple-800 mb-2">🔑 ATS Keywords</h2>
            <div className="flex flex-wrap gap-1">{a.atsKeywords.map((k, i) => <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{k}</span>)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-800 mb-2">📄 CV Recommendations</h2>
            <ul className="space-y-1">{a.cvRecommendations.map((r, i) => <li key={i} className="text-sm text-gray-600">• {r}</li>)}</ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-800 mb-2">🔗 LinkedIn Recommendations</h2>
            <ul className="space-y-1">{a.linkedinRecommendations.map((r, i) => <li key={i} className="text-sm text-gray-600">• {r}</li>)}</ul>
          </div>
        </div>

        <button onClick={() => navigate(`/candidature/${result.id}`)} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
          Track Selection Process →
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">New Candidature</h1>
      <p className="text-gray-500 mb-8">Paste the job description and get an instant AI-powered match analysis.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job URL (optional)</label>
          <input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://linkedin.com/jobs/..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={14} placeholder="Paste the full job description here..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading || !jobDescription.trim()} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2">
          {loading ? <><span className="animate-spin">⏳</span> Analyzing...</> : '🔍 Analyze Job'}
        </button>
      </form>
    </div>
  )
}
