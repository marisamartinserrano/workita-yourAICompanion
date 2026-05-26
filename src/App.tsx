import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import NewCandidature from './pages/NewCandidature'
import SelectionProcessList from './pages/SelectionProcessList'
import SelectionProcess from './pages/SelectionProcess'
import Closing from './pages/Closing'
import Glossary from './pages/Glossary'
import Quizzes from './pages/Quizzes'

function AuthCallback() {
  const [params] = useSearchParams()
  const { setToken } = useAuth()
  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setToken(token)
      window.location.href = '/dashboard'
    }
  }, [params, setToken])
  return <div className="flex items-center justify-center h-screen text-gray-500">Signing you in...</div>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute><Layout><Onboarding /></Layout></ProtectedRoute>
          } />
          <Route path="/candidature/new" element={
            <ProtectedRoute><Layout><NewCandidature /></Layout></ProtectedRoute>
          } />
          <Route path="/selection-process" element={
            <ProtectedRoute><Layout><SelectionProcessList /></Layout></ProtectedRoute>
          } />
          <Route path="/candidature/:id" element={
            <ProtectedRoute><Layout><SelectionProcess /></Layout></ProtectedRoute>
          } />
          <Route path="/closing" element={
            <ProtectedRoute><Layout><Closing /></Layout></ProtectedRoute>
          } />
          <Route path="/glossary" element={
            <ProtectedRoute><Layout><Glossary /></Layout></ProtectedRoute>
          } />
          <Route path="/quizzes" element={
            <ProtectedRoute><Layout><Quizzes /></Layout></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
