import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

interface Candidature {
  id: string
  jobTitle: string
  company: string
  status: string
  matchPercentage: number
  createdAt: string
}

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  interviewing: 'bg-yellow-100 text-yellow-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Candidature[]>('/candidatures')
      .then(setCandidatures)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's an overview of your job search journey.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Applications', value: candidatures.length, icon: '📋' },
          { label: 'Interviewing', value: candidatures.filter(c => c.status === 'interviewing').length, icon: '🎯' },
          { label: 'Offers', value: candidatures.filter(c => c.status === 'offer').length, icon: '🏆' },
          { label: 'Avg Match', value: candidatures.length ? `${Math.round(candidatures.reduce((a, c) => a + c.matchPercentage, 0) / candidatures.length)}%` : '—', icon: '⚡' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/candidature/new" className="bg-primary-600 text-white rounded-xl p-5 hover:bg-primary-700 transition-colors">
          <div className="text-2xl mb-2">➕</div>
          <div className="font-semibold">New Candidature</div>
          <div className="text-sm opacity-80 mt-1">Paste a job description and get instant AI analysis</div>
        </Link>
        <Link to="/onboarding" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-400 transition-colors">
          <div className="text-2xl mb-2">👤</div>
          <div className="font-semibold text-gray-900">Update Profile</div>
          <div className="text-sm text-gray-500 mt-1">Keep your CV and preferences up to date</div>
        </Link>
        <Link to="/quizzes" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-400 transition-colors">
          <div className="text-2xl mb-2">🧠</div>
          <div className="font-semibold text-gray-900">Practice Quizzes</div>
          <div className="text-sm text-gray-500 mt-1">Sharpen your knowledge before interviews</div>
        </Link>
      </div>

      {/* Candidatures list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Applications</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : candidatures.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">No applications yet. <Link to="/candidature/new" className="text-primary-600 underline">Add your first one!</Link></p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidatures.map((c) => (
              <Link key={c.id} to={`/candidature/${c.id}`} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-400 transition-colors">
                <div>
                  <div className="font-semibold text-gray-900">{c.jobTitle}</div>
                  <div className="text-sm text-gray-500">{c.company}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary-600">{c.matchPercentage}% match</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[c.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {c.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
