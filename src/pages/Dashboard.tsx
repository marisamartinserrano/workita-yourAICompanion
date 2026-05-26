import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

interface Candidature {
  id: string
  jobTitle: string
  company: string
  status: string
  matchPercentage: number | null
  currentStage: string
  isInInterview: boolean
  createdAt: string
}

const STAGE_COLORS: Record<string, string> = {
  'Application submitted': 'bg-blue-50 text-blue-700 border-blue-200',
  'Interview with recruiter': 'bg-violet-50 text-violet-700 border-violet-200',
  'Technical interview': 'bg-orange-50 text-orange-700 border-orange-200',
  'Use case or assignment': 'bg-amber-50 text-amber-700 border-amber-200',
  'Team interview': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Manager interview': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Client/Stakeholder interview': 'bg-pink-50 text-pink-700 border-pink-200',
  'Cultural interview': 'bg-teal-50 text-teal-700 border-teal-200',
  'Leadership interview': 'bg-purple-50 text-purple-700 border-purple-200',
  'Offer received': 'bg-green-50 text-green-700 border-green-200',
}

function MatchBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-gray-400">—</span>
  const color = value >= 75 ? 'text-green-600' : value >= 50 ? 'text-amber-600' : 'text-red-500'
  return <span className={`text-sm font-bold ${color}`}>{value}%</span>
}

function StatCard({ icon, value, label, sub }: { icon: string; value: string | number; label: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-3xl font-bold text-gray-900 leading-none">{value}</span>
      <span className="text-sm font-medium text-gray-700 mt-1">{label}</span>
      {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [loading, setLoading] = useState(true)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  useEffect(() => {
    api.get<Candidature[]>('/candidatures')
      .then(setCandidatures)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Computed stats (FR-03)
  const totalApps = candidatures.length
  const interviewCount = candidatures.filter(c => c.isInInterview).length
  const offerCount = candidatures.filter(c => c.status === 'offer' || c.currentStage === 'Offer received').length
  const avgMatch = totalApps > 0
    ? Math.round(candidatures.reduce((sum, c) => sum + (c.matchPercentage ?? 0), 0) / totalApps)
    : null

  return (
    <div className="space-y-8">

      {/* Welcome header (FR-07) */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}! 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Here's your job search at a glance.</p>
      </div>

      {/* Stats panel (FR-03) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="📋"
          value={totalApps}
          label="Applications"
          sub="total submitted"
        />
        <StatCard
          icon="🎯"
          value={interviewCount}
          label="Interviewing"
          sub="active interview stages"
        />
        <StatCard
          icon="🏆"
          value={offerCount}
          label="Offers"
          sub="received"
        />
        <StatCard
          icon="⚡"
          value={avgMatch !== null ? `${avgMatch}%` : '—'}
          label="Avg Match"
          sub="across all roles"
        />
      </div>

      {/* Quick actions (FR-05) */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/candidature/new"
            className="group flex flex-col gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl p-5 transition-colors shadow-sm"
          >
            <span className="text-2xl">➕</span>
            <span className="font-semibold text-base">New Candidature</span>
            <span className="text-xs opacity-75 leading-snug">Paste a job description and get instant AI analysis</span>
          </Link>

          <Link
            to="/onboarding"
            className="group flex flex-col gap-2 bg-white hover:border-primary-400 border border-gray-200 rounded-2xl p-5 transition-colors shadow-sm"
          >
            <span className="text-2xl">👤</span>
            <span className="font-semibold text-base text-gray-900">Update Profile</span>
            <span className="text-xs text-gray-500 leading-snug">Keep your CV and preferences up to date</span>
          </Link>

          <Link
            to="/quizzes"
            className="group flex flex-col gap-2 bg-white hover:border-primary-400 border border-gray-200 rounded-2xl p-5 transition-colors shadow-sm"
          >
            <span className="text-2xl">🧠</span>
            <span className="font-semibold text-base text-gray-900">Practice Quizzes</span>
            <span className="text-xs text-gray-500 leading-snug">Sharpen your knowledge before interviews</span>
          </Link>
        </div>
      </div>

      {/* Active candidatures (FR-04) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">My Applications</h2>
          {candidatures.length > 0 && (
            <Link to="/candidature/new" className="text-xs text-primary-600 hover:underline font-medium">
              + Add new
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : candidatures.length === 0 ? (
          /* Empty state (FR-06) */
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-700 font-semibold mb-1">No applications yet</p>
            <p className="text-gray-400 text-sm mb-5">Start tracking your job search by adding your first candidature.</p>
            <Link
              to="/candidature/new"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              ➕ Create your first candidature
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {candidatures.map((c) => (
              <Link
                key={c.id}
                to={`/candidature/${c.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-4 hover:border-primary-400 hover:shadow-sm transition-all group"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                    {c.jobTitle}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{c.company}</div>
                </div>

                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <MatchBadge value={c.matchPercentage} />
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${
                      STAGE_COLORS[c.currentStage] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {c.currentStage}
                  </span>
                  <span className="text-gray-300 text-sm group-hover:text-primary-400 transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
