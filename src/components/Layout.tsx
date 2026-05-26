import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/candidature/new', label: 'New Candidature', icon: '➕' },
  { to: '/onboarding', label: 'My Profile', icon: '👤' },
  { to: '/glossary', label: 'Glossary', icon: '📖' },
  { to: '/quizzes', label: 'Quizzes', icon: '🧠' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-primary-700 text-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            💼 <span>Workita</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <>
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border-2 border-white/30" />
                )}
                <span className="text-sm hidden sm:block font-medium">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <nav className="w-56 bg-white border-r border-gray-200 py-6 px-3 hidden md:flex flex-col gap-1 shrink-0">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.to)
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-20">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive(item.to) ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden xs:block truncate">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
