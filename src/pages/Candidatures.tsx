import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candidature {
  id: string
  jobUrl?: string
  jobTitle: string
  company: string
  status: string
  matchPercentage?: number
  role?: string
  seniority?: string
  location?: string
  workMode?: string
  industry?: string
  labels?: string[]
  additionalInfo?: string
  currentStage: string
  isInInterview: boolean
  createdAt: string
  updatedAt: string
}

interface FormState {
  jobUrl: string
  company: string
  role: string
  seniority: string
  location: string
  workMode: string
  industry: string
  labels: string[]
  status: string
  additionalInfo: string
}

const EMPTY_FORM: FormState = {
  jobUrl: '',
  company: '',
  role: '',
  seniority: '',
  location: '',
  workMode: '',
  industry: '',
  labels: [],
  status: 'applied',
  additionalInfo: '',
}

const SENIORITY_OPTIONS = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director', 'C-Level']
const WORK_MODE_OPTIONS = ['On-site', 'Hybrid', 'Remote']
const STATUS_OPTIONS = [
  { value: 'applied',     label: 'Applied' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'offer',       label: 'Offer' },
  { value: 'rejected',    label: 'Rejected' },
  { value: 'withdrawn',   label: 'Withdrawn' },
  { value: 'archived',    label: 'Archived' },
]

const STATUS_COLORS: Record<string, string> = {
  applied:     'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-violet-50 text-violet-700 border-violet-200',
  offer:       'bg-green-50 text-green-700 border-green-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
  withdrawn:   'bg-gray-100 text-gray-600 border-gray-200',
  archived:    'bg-gray-100 text-gray-500 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  applied:     'Applied',
  in_progress: 'In Progress',
  offer:       'Offer',
  rejected:    'Rejected',
  withdrawn:   'Withdrawn',
  archived:    'Archived',
}

const MATCH_COLOR = (pct: number) =>
  pct >= 80 ? 'text-green-700 bg-green-50 border-green-200' :
  pct >= 60 ? 'text-teal-700 bg-teal-50 border-teal-200' :
  pct >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200' :
              'text-red-700 bg-red-50 border-red-200'

// ─── CandidatureCard ──────────────────────────────────────────────────────────

function CandidatureCard({ c, onDeleteRequest }: { c: Candidature; onDeleteRequest: () => void }) {
  const navigate = useNavigate()
  const statusCls = STATUS_COLORS[c.status] ?? STATUS_COLORS.applied
  const statusLabel = STATUS_LABELS[c.status] ?? c.status

  return (
    <div
      onClick={() => navigate(`/candidature/${c.id}`)}
      className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-primary-300 hover:shadow-sm cursor-pointer transition-all space-y-2"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{c.company}</p>
          <p className="text-sm text-gray-600 truncate">{c.jobTitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {c.matchPercentage != null && (
            <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${MATCH_COLOR(c.matchPercentage)}`}>
              {c.matchPercentage}% match
            </span>
          )}
          <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${statusCls}`}>
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDeleteRequest() }}
            title="Delete candidature"
            className="text-gray-300 hover:text-red-500 transition-colors p-0.5 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
        {c.currentStage && (
          <span className="flex items-center gap-1">
            <span>📍</span> {c.currentStage}
          </span>
        )}
        {c.seniority && <span>{c.seniority}</span>}
        {c.workMode && <span>{c.workMode}</span>}
        {c.location && <span>{c.location}</span>}
        {c.industry && <span>{c.industry}</span>}
      </div>

      {/* Labels */}
      {c.labels && c.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {c.labels.map(l => (
            <span key={l} className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5 font-medium">{l}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400">
        Added {new Date(c.createdAt).toLocaleDateString()}
        {c.updatedAt !== c.createdAt && ` · Updated ${new Date(c.updatedAt).toLocaleDateString()}`}
      </p>
    </div>
  )
}

// ─── Label chip input ─────────────────────────────────────────────────────────

function LabelInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[]
  onChange: (labels: string[]) => void
  suggestions: string[]
}) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  )

  const addLabel = (label: string) => {
    const trimmed = label.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
    setShowSuggestions(false)
  }

  const removeLabel = (label: string) => onChange(value.filter(l => l !== label))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addLabel(input)
    } else if (e.key === 'Backspace' && !input && value.length) {
      removeLabel(value[value.length - 1])
    }
  }

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1 min-h-[2.25rem] w-full border border-gray-300 rounded-xl px-2 py-1.5 bg-white focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-300 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map(l => (
          <span key={l} className="flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 text-xs rounded-full px-2 py-0.5 font-medium">
            {l}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeLabel(l) }} className="text-primary-400 hover:text-primary-700 leading-none">×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length ? '' : 'Add labels…'}
          className="flex-1 min-w-[80px] text-sm outline-none bg-transparent placeholder-gray-400"
        />
      </div>
      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-36 overflow-y-auto">
          {filtered.map(s => (
            <li
              key={s}
              onMouseDown={() => addLabel(s)}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 cursor-pointer"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add a label</p>
    </div>
  )
}

// ─── ActiveFilterChips ────────────────────────────────────────────────────────

function ActiveFilterChips({
  filters,
  onRemove,
}: {
  filters: Record<string, string[]>
  onRemove: (key: string, value: string) => void
}) {
  const entries = Object.entries(filters).flatMap(([key, vals]) => vals.map(v => ({ key, value: v })))
  if (entries.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(({ key, value }) => (
        <span key={`${key}:${value}`} className="flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 text-xs rounded-full px-2 py-0.5 font-medium">
          <span className="capitalize text-primary-500">{key}:</span> {value}
          <button type="button" onClick={() => onRemove(key, value)} className="text-primary-400 hover:text-primary-700 leading-none ml-0.5">×</button>
        </span>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Candidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [labelSuggestions, setLabelSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Candidature | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [autoFillBanner, setAutoFillBanner] = useState<'success' | 'failed' | 'linkedin' | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractStatus, setExtractStatus] = useState<'success' | 'failed' | 'linkedin' | null>(null)
  const [pastedJobText, setPastedJobText] = useState('')
  const extractDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Search & filter state
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    company: [], role: [], seniority: [], industry: [], labels: [], workMode: [],
  })

  useEffect(() => {
    Promise.all([
      api.get<Candidature[]>('/candidatures'),
      api.get<string[]>('/candidatures/labels'),
    ]).then(([cands, labels]) => {
      setCandidatures(cands ?? [])
      setLabelSuggestions(labels ?? [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  // ── URL auto-fill ─────────────────────────────────────────────────────────

  const triggerExtract = (url: string) => {
    if (extractDebounceRef.current) clearTimeout(extractDebounceRef.current)
    if (!url.trim() || url.length < 10) return
    extractDebounceRef.current = setTimeout(async () => {
      setExtracting(true)
      setExtractStatus(null)
      try {
        const result = await api.post<{
          autoFillStatus: string
          fields: { jobTitle: string; company: string; role: string; seniority: string; location: string; workMode: string; industry: string } | null
        }>('/candidatures/extract', { jobUrl: url.trim() })

        if (result.autoFillStatus === 'success' && result.fields) {
          applyExtractedFields(result.fields)
          setExtractStatus('success')
        } else if (result.autoFillStatus === 'linkedin') {
          setExtractStatus('linkedin')
        } else {
          setExtractStatus('failed')
        }
      } catch {
        setExtractStatus('failed')
      } finally {
        setExtracting(false)
      }
    }, 800)
  }

  const applyExtractedFields = (fields: { jobTitle: string; company: string; role: string; seniority: string; location: string; workMode: string; industry: string }) => {
    const notFound = (v: string) => v === 'Not found' ? '' : v
    setForm(prev => ({
      ...prev,
      company:   prev.company   || notFound(fields.company),
      role:      prev.role      || notFound(fields.role),
      seniority: prev.seniority || notFound(fields.seniority),
      location:  prev.location  || notFound(fields.location),
      workMode:  prev.workMode  || notFound(fields.workMode),
      industry:  prev.industry  || notFound(fields.industry),
    }))
  }

  const triggerExtractFromText = async (text: string) => {
    if (!text.trim() || text.trim().length < 30) return
    setExtracting(true)
    setExtractStatus(null)
    try {
      const result = await api.post<{
        autoFillStatus: string
        fields: { jobTitle: string; company: string; role: string; seniority: string; location: string; workMode: string; industry: string } | null
      }>('/candidatures/extract', { jobText: text.trim() })
      if (result.autoFillStatus === 'success' && result.fields) {
        applyExtractedFields(result.fields)
        setExtractStatus('success')
      } else {
        setExtractStatus('failed')
      }
    } catch {
      setExtractStatus('failed')
    } finally {
      setExtracting(false)
    }
  }

  // ── Filter helpers ────────────────────────────────────────────────────────

  const addFilter = (key: string, value: string) => {
    if (!value || activeFilters[key]?.includes(value)) return
    setActiveFilters(prev => ({ ...prev, [key]: [...(prev[key] ?? []), value] }))
  }

  const removeFilter = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: (prev[key] ?? []).filter(v => v !== value) }))
  }

  // ── Filtered + searched list ──────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...candidatures].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.jobTitle.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        (c.role ?? '').toLowerCase().includes(q) ||
        (c.industry ?? '').toLowerCase().includes(q)
      )
    }

    for (const [key, vals] of Object.entries(activeFilters)) {
      if (!vals.length) continue
      list = list.filter(c => {
        if (key === 'labels') return vals.some(v => (c.labels ?? []).includes(v))
        if (key === 'company')  return vals.some(v => c.company.toLowerCase() === v.toLowerCase())
        if (key === 'role')     return vals.some(v => (c.role ?? '').toLowerCase() === v.toLowerCase())
        if (key === 'seniority') return vals.some(v => c.seniority === v)
        if (key === 'industry') return vals.some(v => (c.industry ?? '').toLowerCase() === v.toLowerCase())
        if (key === 'workMode') return vals.some(v => c.workMode === v)
        return true
      })
    }

    return list
  }, [candidatures, search, activeFilters])

  // ── Derived filter options from loaded data ───────────────────────────────

  const filterOptions = useMemo(() => ({
    company:   [...new Set(candidatures.map(c => c.company).filter(Boolean))].sort(),
    role:      [...new Set(candidatures.map(c => c.role).filter(Boolean) as string[])].sort(),
    seniority: SENIORITY_OPTIONS.filter(s => candidatures.some(c => c.seniority === s)),
    industry:  [...new Set(candidatures.map(c => c.industry).filter(Boolean) as string[])].sort(),
    labels:    labelSuggestions,
    workMode:  WORK_MODE_OPTIONS.filter(w => candidatures.some(c => c.workMode === w)),
  }), [candidatures, labelSuggestions])

  // ── Form handlers ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUrlError(null)
    if (!form.jobUrl.trim()) {
      setUrlError('Job posting URL is required')
      return
    }
    setSaving(true)
    setSaveError(null)
    setAutoFillBanner(null)
    try {
      const result = await api.post<Candidature & { autoFillStatus?: string; hasProfile?: boolean }>('/candidatures', {
        jobUrl: form.jobUrl.trim(),
        company: form.company || undefined,
        role: form.role || undefined,
        seniority: form.seniority || undefined,
        location: form.location || undefined,
        workMode: form.workMode || undefined,
        industry: form.industry || undefined,
        labels: form.labels,
        status: form.status,
        additionalInfo: form.additionalInfo || undefined,
      })

      const { autoFillStatus, hasProfile: _hp, ...candidature } = result as Candidature & { autoFillStatus?: string; hasProfile?: boolean }
      setCandidatures(prev => [candidature as Candidature, ...prev])

      if (autoFillStatus === 'success')   setAutoFillBanner('success')
      else if (autoFillStatus === 'linkedin') setAutoFillBanner('linkedin')
      else if (autoFillStatus === 'failed')   setAutoFillBanner('failed')

      // Refresh label suggestions
      api.get<string[]>('/candidatures/labels').then(l => setLabelSuggestions(l ?? [])).catch(() => {})

      setForm(EMPTY_FORM)
      setFormOpen(false)
      setExtractStatus(null)
      setPastedJobText('')
    } catch (err) {
      setSaveError('Failed to save candidature. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/candidatures/${deleteTarget.id}`)
      setCandidatures(prev => prev.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleting(false)
    }
  }

  const hasActiveFilters = Object.values(activeFilters).some(v => v.length > 0)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
        <p className="text-gray-500 text-sm mt-1">Track all your job applications in one place.</p>
      </div>

      {/* Auto-fill banner */}
      {autoFillBanner === 'success' && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <span>✅ Job details auto-filled from the posting URL.</span>
          <button onClick={() => setAutoFillBanner(null)} className="text-green-500 hover:text-green-700 text-lg leading-none ml-3">×</button>
        </div>
      )}
      {autoFillBanner === 'linkedin' && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span>⚠️ LinkedIn job pages require login — details were not auto-filled. You can add them manually.</span>
          <button onClick={() => setAutoFillBanner(null)} className="text-amber-500 hover:text-amber-700 text-lg leading-none ml-3">×</button>
        </div>
      )}
      {autoFillBanner === 'failed' && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span>⚠️ We couldn't extract job details from the URL — you can fill them in manually.</span>
          <button onClick={() => setAutoFillBanner(null)} className="text-amber-500 hover:text-amber-700 text-lg leading-none ml-3">×</button>
        </div>
      )}

      {/* Add candidature card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setFormOpen(o => !o)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">➕</span>
            <span className="font-semibold text-gray-800">Add New Candidature</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${formOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {formOpen && (
          <form onSubmit={handleSubmit} className="border-t border-gray-100 px-6 pb-6 pt-4 space-y-4">
            {/* URL — required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job posting URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={form.jobUrl}
                  onChange={e => {
                    const url = e.target.value
                    setForm(f => ({ ...f, jobUrl: url }))
                    setUrlError(null)
                    setExtractStatus(null)
                    triggerExtract(url)
                  }}
                  placeholder="https://company.com/jobs/..."
                  className={`w-full border rounded-xl px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400 ${urlError ? 'border-red-400' : 'border-gray-300'}`}
                />
                {/* Inline status indicator */}
                {extracting && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm animate-spin">⏳</span>
                )}
                {!extracting && extractStatus === 'success' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm" title="Fields auto-filled">✅</span>
                )}
                {!extracting && extractStatus === 'linkedin' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 text-sm" title="LinkedIn — fill manually">⚠️</span>
                )}
                {!extracting && extractStatus === 'failed' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" title="Could not extract — fill manually">ℹ️</span>
                )}
              </div>
              {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
              {extracting && <p className="text-xs text-primary-500 mt-1">✨ Extracting job details from URL…</p>}
              {!extracting && extractStatus === 'success' && <p className="text-xs text-green-600 mt-1">✅ Fields auto-filled from the job posting — review and edit below.</p>}
              {!extracting && extractStatus === 'linkedin' && <p className="text-xs text-amber-600 mt-1">⚠️ LinkedIn pages require login — please fill in the fields manually.</p>}
              {!extracting && extractStatus === 'failed' && <p className="text-xs text-gray-400 mt-1">Could not extract from this URL — fill in the fields manually.</p>}
              {!extractStatus && !extracting && <p className="text-xs text-gray-400 mt-1">Paste the URL and we'll auto-fill the fields below using AI.</p>}

              {/* LinkedIn fallback: paste job description text */}
              {extractStatus === 'linkedin' && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-medium text-amber-800">
                    📋 Paste the job description from LinkedIn below — AI will fill in the fields for you:
                  </p>
                  <textarea
                    value={pastedJobText}
                    onChange={e => setPastedJobText(e.target.value)}
                    placeholder="Copy the full job description from the LinkedIn page and paste it here…"
                    rows={5}
                    className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white resize-none placeholder-amber-400"
                  />
                  <button
                    type="button"
                    disabled={extracting || pastedJobText.trim().length < 30}
                    onClick={() => triggerExtractFromText(pastedJobText)}
                    className="flex items-center gap-2 bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {extracting ? <><span className="animate-spin">⏳</span> Extracting…</> : <><span>✨</span> Fill fields from description</>}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Product Manager"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>

              {/* Seniority */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Seniority</label>
                <select
                  value={form.seniority}
                  onChange={e => setForm(f => ({ ...f, seniority: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white"
                >
                  <option value="">— auto-fill —</option>
                  {SENIORITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. London, UK"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>

              {/* Work mode */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Work mode</label>
                <select
                  value={form.workMode}
                  onChange={e => setForm(f => ({ ...f, workMode: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white"
                >
                  <option value="">— auto-fill —</option>
                  {WORK_MODE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                  placeholder="e.g. Fintech"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400 bg-white"
                >
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Labels</label>
              <LabelInput value={form.labels} onChange={labels => setForm(f => ({ ...f, labels }))} suggestions={labelSuggestions} />
            </div>

            {/* Additional info */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Additional info</label>
              <textarea
                value={form.additionalInfo}
                onChange={e => setForm(f => ({ ...f, additionalInfo: e.target.value }))}
                placeholder="Notes, context, referral info…"
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
              />
            </div>

            {saveError && <p className="text-sm text-red-600">{saveError}</p>}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setForm(EMPTY_FORM); setFormOpen(false); setSaveError(null); setExtractStatus(null); setPastedJobText('') }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !form.jobUrl.trim()}
                className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? <><span className="animate-spin">⏳</span> Saving…</> : 'Save candidature'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Search + filter bar */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, company, role, industry…"
              className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(o => !o)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              hasActiveFilters
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>🎛️</span> Filters
            {hasActiveFilters && (
              <span className="bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {Object.values(activeFilters).reduce((n, v) => n + v.length, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
            {(Object.keys(filterOptions) as Array<keyof typeof filterOptions>).map(key => {
              const opts = filterOptions[key]
              if (!opts.length) return null
              return (
                <div key={key}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 capitalize">{key}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opts.map(opt => {
                      const active = (activeFilters[key] ?? []).includes(opt)
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => active ? removeFilter(key, opt) : addFilter(key, opt)}
                          className={`text-xs rounded-full px-3 py-1 border font-medium transition-colors ${
                            active
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-700'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setActiveFilters({ company: [], role: [], seniority: [], industry: [], labels: [], workMode: [] })}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        <ActiveFilterChips filters={activeFilters} onRemove={removeFilter} />
      </div>

      {/* Candidatures list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl animate-pulse mb-2">📋</div>
          <p className="text-sm">Loading candidatures…</p>
        </div>
      ) : candidatures.length === 0 ? (
        // Empty state
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="font-semibold text-gray-800 mb-1">No candidatures yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first job application above to start tracking your pipeline.</p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Add your first candidature
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">No candidatures match your search or filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">{filtered.length} candidature{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map(c => <CandidatureCard key={c.id} c={c} onDeleteRequest={() => setDeleteTarget(c)} />)}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗑️</span>
              <div>
                <h2 className="font-semibold text-gray-900">Delete candidature?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  This will permanently delete{' '}
                  <span className="font-medium text-gray-800">
                    {deleteTarget.jobTitle}
                  </span>
                  {deleteTarget.company ? (
                    <> at <span className="font-medium text-gray-800">{deleteTarget.company}</span></>
                  ) : null}
                  {' '}and all its stage history. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? <><span className="animate-spin">⏳</span> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
