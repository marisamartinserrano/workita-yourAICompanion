import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Profile {
  role: string
  seniority: string
  industry: string
  location: string
  workMode: string
  salaryExpectations: string
  preferredCompanies: string
  cvText: string
  linkedinUrl: string
}

interface CvAnalysis {
  skills: string[]
  experience: string[]
  education: string[]
  gaps: { issue: string; suggestion: string }[]
  atsFeedback: { category: string; status: 'pass' | 'warn' | 'fail'; message: string }[]
}

interface LinkedinRecs {
  recommendations: { text: string; rationale: string }[]
  hasLinkedinUrl: boolean
}

interface AnalysisResult {
  cvAnalysis: CvAnalysis
  linkedinRecommendations: LinkedinRecs
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WORK_MODES = ['On-site', 'Remote', 'Hybrid']
const SENIORITY_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director', 'C-Level']

type TabId = 'preferences' | 'cv' | 'linkedin'
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'preferences', label: 'Job Preferences', icon: '🎯' },
  { id: 'cv',          label: 'CV & Analysis',   icon: '📄' },
  { id: 'linkedin',    label: 'LinkedIn',         icon: '🔗' },
]

const ATS_STATUS_CONFIG = {
  pass: { icon: '✅', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  warn: { icon: '⚠️', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  fail: { icon: '❌', color: 'text-red-700',   bg: 'bg-red-50 border-red-200' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
}

function Input({ name, value, onChange, placeholder }: {
  name: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string
}) {
  return (
    <input
      name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
    />
  )
}

function Select({ name, value, onChange, options }: {
  name: string; value: string; onChange: React.ChangeEventHandler<HTMLSelectElement>; options: string[]
}) {
  return (
    <select
      name={name} value={value} onChange={onChange}
      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
    >
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function SaveBar({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={saving}
        className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving…' : 'Save Profile'}
      </button>
      {saved && (
        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
          <span>✓</span> Saved!
        </span>
      )}
    </div>
  )
}

function CvAnalysisPanel({ analysis }: { analysis: CvAnalysis }) {
  return (
    <div className="space-y-6 mt-6">
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

      {/* ATS Feedback */}
      {analysis.atsFeedback.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">🤖 ATS Compatibility</h3>
          <div className="space-y-2">
            {analysis.atsFeedback.map((item, i) => {
              const cfg = ATS_STATUS_CONFIG[item.status]
              return (
                <div key={i} className={`border rounded-xl p-3 ${cfg.bg}`}>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0">{cfg.icon}</span>
                    <div>
                      <span className={`text-xs font-semibold ${cfg.color}`}>{item.category}</span>
                      <p className={`text-xs mt-0.5 ${cfg.color}`}>{item.message}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function LinkedinPanel({ recs }: { recs: LinkedinRecs }) {
  const [explainerOpen, setExplainerOpen] = useState(false)

  return (
    <div className="space-y-4 mt-6">
      {!recs.hasLinkedinUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
          💡 Results would be more specific with your LinkedIn URL — add it above and re-run analysis.
        </div>
      )}

      {/* Collapsible explainer */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setExplainerOpen(o => !o)}
          aria-expanded={explainerOpen}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>📘 How LinkedIn works for candidates</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${explainerOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {explainerOpen && (
          <div className="px-4 pb-4 text-sm text-gray-600 space-y-2 border-t border-gray-100 pt-3">
            <p>LinkedIn's algorithm surfaces profiles based on <strong>keyword relevance</strong>, <strong>profile completeness</strong>, and <strong>connection proximity</strong> to the recruiter.</p>
            <p>Recruiters search by job title, skills, and location. Your headline and skills section carry the most weight for keyword matching.</p>
            <p>A complete profile (photo, summary, all sections filled) gets up to <strong>40× more recruiter views</strong> than an incomplete one.</p>
            <p>Consistency between your CV and LinkedIn is critical — discrepancies raise red flags during background checks.</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {recs.recommendations.map((rec, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
            <p className="text-sm font-medium text-gray-900">{rec.text}</p>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              <span className="font-medium text-gray-600">Why: </span>{rec.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const [activeTab, setActiveTab] = useState<TabId>('preferences')
  const [form, setForm] = useState<Profile>({
    role: '', seniority: '', industry: '', location: '',
    workMode: '', salaryExpectations: '', preferredCompanies: '', cvText: '', linkedinUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [cvAnalysis, setCvAnalysis] = useState<CvAnalysis | null>(null)
  const [linkedinRecs, setLinkedinRecs] = useState<LinkedinRecs | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    api.get<Profile | null>('/profile')
      .then(p => { if (p) setForm(p as Profile) })
      .catch(console.error)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/profile', form)
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
    setCvAnalysis(null)
    setLinkedinRecs(null)
    try {
      // Auto-save first so analyze always runs on latest data
      await api.post('/profile', form)
      const result = await api.post<AnalysisResult>('/profile/analyze', {})
      setCvAnalysis(result.cvAnalysis)
      setLinkedinRecs(result.linkedinRecommendations)
    } catch (err) {
      setAnalyzeError('Analysis failed. Please try again.')
      console.error(err)
    } finally {
      setAnalyzing(false)
    }
  }

  // Keyboard navigation for tab bar (WCAG)
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    else return
    e.preventDefault()
    tabRefs.current[next]?.focus()
    setActiveTab(TABS[next].id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          The richer your profile, the more tailored Workita's AI recommendations will be.
        </p>
      </div>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="flex gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-fit"
      >
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[i] = el }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={e => handleTabKeyDown(e, i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>

        {/* ── Tab: Job Preferences ── */}
        <div
          id="tabpanel-preferences"
          role="tabpanel"
          aria-labelledby="tab-preferences"
          hidden={activeTab !== 'preferences'}
          className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5"
        >
          <h2 className="font-semibold text-gray-800">Job Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Target Role</FieldLabel>
              <Input name="role" value={form.role} onChange={handleChange} placeholder="e.g. Product Manager" />
            </div>
            <div>
              <FieldLabel>Seniority</FieldLabel>
              <Select name="seniority" value={form.seniority} onChange={handleChange} options={SENIORITY_LEVELS} />
            </div>
            <div>
              <FieldLabel>Industry</FieldLabel>
              <Input name="industry" value={form.industry} onChange={handleChange} placeholder="e.g. Fintech, Healthcare" />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <Input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Madrid, Spain" />
            </div>
            <div>
              <FieldLabel>Work Mode</FieldLabel>
              <Select name="workMode" value={form.workMode} onChange={handleChange} options={WORK_MODES} />
            </div>
            <div>
              <FieldLabel>Salary Expectations</FieldLabel>
              <Input name="salaryExpectations" value={form.salaryExpectations} onChange={handleChange} placeholder="e.g. 60,000–80,000 EUR" />
            </div>
          </div>
          <div>
            <FieldLabel>Preferred Companies</FieldLabel>
            <Input name="preferredCompanies" value={form.preferredCompanies} onChange={handleChange} placeholder="e.g. Google, Spotify, Stripe" />
          </div>
          <SaveBar saving={saving} saved={saved} />
        </div>

        {/* ── Tab: CV & Analysis ── */}
        <div
          id="tabpanel-cv"
          role="tabpanel"
          aria-labelledby="tab-cv"
          hidden={activeTab !== 'cv'}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Your CV</h2>
            <p className="text-sm text-gray-500">Paste your CV text below. The AI will extract skills, identify gaps, and simulate ATS parsing.</p>
            <textarea
              name="cvText"
              value={form.cvText}
              onChange={handleChange}
              rows={12}
              placeholder="Paste your CV text here…"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono resize-y"
            />
            <div className="flex flex-wrap items-center gap-3">
              <SaveBar saving={saving} saved={saved} />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !form.cvText.trim()}
                title={!form.cvText.trim() ? 'Save your CV first to run analysis' : undefined}
                className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {analyzing ? (
                  <><span className="animate-spin">⏳</span> Analysing…</>
                ) : (
                  <><span>🤖</span> Analyse CV</>
                )}
              </button>
              {!form.cvText.trim() && (
                <span className="text-xs text-gray-400">Save your CV first to run analysis</span>
              )}
            </div>
            {analyzeError && (
              <p className="text-sm text-red-600">{analyzeError}</p>
            )}
          </div>

          {/* Analysis results */}
          {analyzing && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-3xl animate-pulse mb-2">🤖</div>
              <p className="text-gray-500 text-sm">Analysing your CV — this takes a few seconds…</p>
            </div>
          )}
          {cvAnalysis && !analyzing && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-1">Analysis Results</h3>
              <p className="text-xs text-gray-400 mb-4">Based on your most recently saved CV.</p>
              <CvAnalysisPanel analysis={cvAnalysis} />
            </div>
          )}
        </div>

        {/* ── Tab: LinkedIn ── */}
        <div
          id="tabpanel-linkedin"
          role="tabpanel"
          aria-labelledby="tab-linkedin"
          hidden={activeTab !== 'linkedin'}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">LinkedIn Profile</h2>
            <p className="text-sm text-gray-500">
              Add your LinkedIn URL. Run <strong>Analyse CV</strong> from the CV tab to generate personalised recommendations.
            </p>
            <div>
              <FieldLabel>LinkedIn URL</FieldLabel>
              <Input
                name="linkedinUrl"
                value={form.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <SaveBar saving={saving} saved={saved} />
          </div>

          {/* LinkedIn recommendations */}
          {analyzing && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="text-3xl animate-pulse mb-2">🔗</div>
              <p className="text-gray-500 text-sm">Generating LinkedIn recommendations…</p>
            </div>
          )}
          {linkedinRecs && !analyzing && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-1">LinkedIn Recommendations</h3>
              <p className="text-xs text-gray-400 mb-2">Based on your CV content and LinkedIn best practices.</p>
              <LinkedinPanel recs={linkedinRecs} />
            </div>
          )}
          {!linkedinRecs && !analyzing && (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="text-4xl mb-3">🔗</div>
              <p className="text-gray-500 text-sm">
                Go to the <button type="button" onClick={() => setActiveTab('cv')} className="text-primary-600 underline">CV & Analysis</button> tab and click "Analyse CV" to generate LinkedIn recommendations.
              </p>
            </div>
          )}
        </div>

      </form>
    </div>
  )
}
