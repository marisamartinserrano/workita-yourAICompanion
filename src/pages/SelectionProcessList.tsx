import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

interface Candidature {
  id: string
  jobTitle: string
  company: string
  matchPercentage: number | null
  currentStage: string
  status: string
}

const STATUS_COLOR: Record<string, string> = {
  applied:      'bg-blue-50 text-blue-700',
  interviewing: 'bg-violet-50 text-violet-700',
  offer:        'bg-green-50 text-green-700',
  rejected:     'bg-red-50 text-red-600',
}

export default function SelectionProcessList() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Candidature[]>('/candidatures')
      .then(setCandidatures)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const open = candidatures.filter(c => c.status !== 'closed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selection Process</h1>
        <p className="text-gray-500 text-sm mt-1">Track your interview stages across all active applications.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : open.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">🗂️</div>
          <p className="text-gray-700 font-semibold mb-1">No active applications</p>
          <p className="text-gray-400 text-sm mb-5">Create a candidature to start tracking your selection process.</p>
          <Link
            to="/candidature/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            ➕ New Candidature
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {open.map((c) => (
            <Link
              key={c.id}
              to={`/candidature/${c.id}`}
              className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-4 hover:border-primary-400 hover:shadow-sm transition-all group"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                  {c.jobTitle}
                </p>
                <p className="text-sm text-gray-500">{c.company}</p>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                {c.matchPercentage != null && (
                  <span className="text-sm font-bold text-primary-600">{c.matchPercentage}%</span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[c.status] ?? 'bg-gray-50 text-gray-600'}`}>
                  {c.currentStage}
                </span>
                <span className="text-gray-300 text-sm group-hover:text-primary-400 transition-colors">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
