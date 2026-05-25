import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: '🏠 Dashboard' },
  { to: '/candidature/new', label: '➕ New Candidature' },
  { to: '/glossary', label: '📖 Glossary' },
  { to: '/quizzes', label: '🧠 Quizzes' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold tracking-tight">
            💼 Workita
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm hidden sm:block">{user.name}</span>
                <button onClick={logout} className="text-sm underline opacity-80 hover:opacity-100">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-56 bg-white border-r border-gray-200 py-6 px-3 hidden md:block">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
