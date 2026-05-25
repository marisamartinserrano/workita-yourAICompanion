import { useState } from 'react'
import { api } from '../lib/api'

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export default function Quizzes() {
  const [jobTitle, setJobTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !topic.trim()) return
    setLoading(true)
    setAnswers({})
    setSubmitted(false)
    try {
      const result = await api.post<{ questions: Question[] }>('/ai/quiz', { jobTitle, topic, difficulty })
      setQuestions(result.questions)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const score = submitted ? questions.filter((q, i) => answers[i] === q.correctIndex).length : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">🧠 Quizzes</h1>
      <p className="text-gray-500 mb-6">Test your knowledge before interviews with AI-generated quizzes.</p>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Product Manager" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Agile, SQL, Leadership" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading || !jobTitle.trim() || !topic.trim()} className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
          {loading ? '⏳ Generating...' : '🎲 Generate Quiz'}
        </button>
      </div>

      {questions.length > 0 && (
        <>
          {submitted && (
            <div className={`rounded-xl p-4 mb-4 text-center font-bold text-lg ${score >= questions.length * 0.8 ? 'bg-green-100 text-green-700' : score >= questions.length * 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {score}/{questions.length} correct — {score >= questions.length * 0.8 ? '🏆 Excellent!' : score >= questions.length * 0.5 ? '👍 Good effort!' : '📚 Keep studying!'}
            </div>
          )}

          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-3">Q{i + 1}: {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, j) => {
                    const isSelected = answers[i] === j
                    const isCorrect = j === q.correctIndex
                    let cls = 'border border-gray-200 text-gray-700 hover:border-primary-400'
                    if (submitted) {
                      if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-800'
                      else if (isSelected) cls = 'border-red-400 bg-red-50 text-red-800'
                    } else if (isSelected) {
                      cls = 'border-primary-500 bg-primary-50 text-primary-800'
                    }
                    return (
                      <button key={j} disabled={submitted} onClick={() => setAnswers(a => ({ ...a, [i]: j }))} className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${cls}`}>
                        {String.fromCharCode(65 + j)}. {opt}
                      </button>
                    )
                  })}
                </div>
                {submitted && (
                  <p className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-2">💡 {q.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {!submitted && (
            <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length} className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              Submit Answers
            </button>
          )}
        </>
      )}
    </div>
  )
}
