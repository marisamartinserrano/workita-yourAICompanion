import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const SELECTION_STAGES = [
  'Application submitted',
  'Interview with recruiter',
  'Technical interview',
  'Use case or assignment',
  'Team interview',
  'Manager interview',
  'Client/Stakeholder interview',
  'Cultural interview',
  'Leadership interview',
  'Offer received / Candidature rejected',
]

const STAGE_ICONS: Record<string, string> = {
  'Application submitted': '📋',
  'Interview with recruiter': '📞',
  'Technical interview': '💻',
  'Use case or assignment': '📝',
  'Team interview': '👥',
  'Manager interview': '🧑‍💼',
  'Client/Stakeholder interview': '🤝',
  'Cultural interview': '🌱',
  'Leadership interview': '🏅',
  'Offer received / Candidature rejected': '🏁',
}

const navItems = [
  { to: '/dashboard',          label: 'Home',               icon: '🏠' },
  { to: '/onboarding',         label: 'My Profile',         icon: '👤' },
  { to: '/candidature/new',    label: 'New Candidature',    icon: '➕' },
  { to: '/selection-process',  label: 'Selection Process',  icon: '🗂️', hasSubItems: true },
  { to: '/closing',            label: 'Closing',            icon: '✅' },
  { to: '/glossary',           label: 'Glossary',           icon: '📖' },
  { to: '/quizzes',            label: 'Quizzes',            icon: '🧠' },
]

interface SidebarProps {
  collapsed?: boolean
  onClose?: () => void
}

function Sidebar({ collapsed = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const onSelectionRoute =
    location.pathname.startsWith('/candidature/') ||
    location.pathname === '/selection-process'

  const [selectionOpen, setSelectionOpen] = useState(onSelectionRoute)

  useEffect(() => {
    if (onSelectionRoute) setSelectionOpen(true)
  }, [location.pathname, onSelectionRoute])

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path))

  const handleLogout = () => {
    logout()
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
        <span className="text-2xl shrink-0">💼</span>
        {!collapsed && (
          <span className="font-bold text-lg text-gray-900 tracking-tight">Workita</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = isActive(item.to)
          const isSelection = item.hasSubItems

          return (
            <div key={item.to}>
              <div className="flex items-center">
                <Link
                  to={item.to}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    active
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>

                {/* Toggle for Selection Process sub-stages */}
                {isSelection && !collapsed && (
                  <button
                    onClick={() => setSelectionOpen((o) => !o)}
                    aria-expanded={selectionOpen}
                    aria-label="Toggle selection process stages"
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${selectionOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sub-stages */}
              {isSelection && !collapsed && selectionOpen && (
                <ul className="mt-0.5 ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5" role="list">
                  {SELECTION_STAGES.map((stage) => (
                    <li key={stage}>
                      <span
                        className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 rounded-lg"
                        role="listitem"
                      >
                        <span className="shrink-0">{STAGE_ICONS[stage]}</span>
                        <span className="truncate">{stage}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      {/* User identity + logout (FR-06, FR-07) */}
      <div className={`border-t border-gray-100 p-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {user && (
          <>
            <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'flex-col' : ''}`}>
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              title={collapsed ? 'Log out' : undefined}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${collapsed ? 'justify-center' : ''}`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!collapsed && <span>Log out</span>}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Desktop: full sidebar (lg+) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* ── Tablet: icon-only rail (md → lg) ── */}
      <aside className="hidden md:flex lg:hidden flex-col w-16 shrink-0 overflow-y-auto">
        <Sidebar collapsed />
      </aside>

      {/* ── Mobile: overlay drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="relative z-50 flex flex-col w-72 max-w-full bg-white shadow-xl">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-gray-900">
            <span>💼</span> <span>Workita</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
