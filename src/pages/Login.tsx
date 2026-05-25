import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Login() {
  const { user, login } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
        <div className="text-6xl mb-4">💼</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Workita</h1>
        <p className="text-gray-500 mb-8">Your AI Job Companion — find, apply, and succeed.</p>

        <div className="space-y-4 text-left mb-8">
          {[
            { icon: '🔍', text: 'Personalized job search' },
            { icon: '📋', text: 'Application tracking & insights' },
            { icon: '🎯', text: 'AI-powered interview preparation' },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-xl">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-3 text-gray-700 font-medium hover:border-primary-500 hover:shadow-md transition-all"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-6 text-xs text-gray-400">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  )
}
