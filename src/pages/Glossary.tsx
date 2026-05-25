import { useState } from 'react'
import { api } from '../lib/api'

interface Term {
  term: string
  definition: string
  context: string
}

export default function Glossary() {
  const [jobDescription, setJobDescription] = useState('')
  const [industry, setIndustry] = useState('')
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    try {
      const result = await api.post<{ terms: Term[] }>('/ai/glossary', { jobDescription, industry })
      setTerms(result.terms)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = terms.filter(t =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.definition.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">📖 Glossary</h1>
      <p className="text-gray-500 mb-6">Generate a glossary of key terms from any job description.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={6} placeholder="Paste a job description to extract key terms..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry (optional)</label>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech, SaaS, Healthcare" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <button onClick={handleGenerate} disabled={loading || !jobDescription.trim()} className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
          {loading ? '⏳ Generating...' : '✨ Generate Glossary'}
        </button>
      </div>

      {terms.length > 0 && (
        <>
          <div className="mb-4">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search terms..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="space-y-3">
            {filtered.map((t, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-gray-900">{t.term}</h3>
                <p className="text-sm text-gray-600 mt-1">{t.definition}</p>
                <p className="text-xs text-primary-600 mt-2 bg-primary-50 rounded px-2 py-1 inline-block">📌 {t.context}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
