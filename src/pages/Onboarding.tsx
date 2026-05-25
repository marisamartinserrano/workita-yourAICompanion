import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface Profile {
  role: string
  seniority: string
  industry: string
  location: string
  workMode: string
  salaryExpectations: string
  preferredCompanies: string
  cvText: string
  linkedinUrl: string
}

const WORK_MODES = ['On-site', 'Remote', 'Hybrid']
const SENIORITY_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director', 'C-Level']

export default function Onboarding() {
  const [form, setForm] = useState<Profile>({
    role: '', seniority: '', industry: '', location: '',
    workMode: '', salaryExpectations: '', preferredCompanies: '', cvText: '', linkedinUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<Profile | null>('/profile').then((p) => { if (p) setForm(p as Profile) }).catch(console.error)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/profile', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Profile</h1>
      <p className="text-gray-500 mb-8">This information helps Workita tailor AI recommendations to your background.</p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
        <section>
          <h2 className="font-semibold text-gray-800 mb-4">🎯 Job Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
              <input name="role" value={form.role} onChange={handleChange} placeholder="e.g. Product Manager" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seniority</label>
              <select name="seniority" value={form.seniority} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Select...</option>
                {SENIORITY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input name="industry" value={form.industry} onChange={handleChange} placeholder="e.g. Fintech, Healthcare" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Madrid, Spain" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
              <select name="workMode" value={form.workMode} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Select...</option>
                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectations</label>
              <input name="salaryExpectations" value={form.salaryExpectations} onChange={handleChange} placeholder="e.g. 60,000–80,000 EUR" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Companies</label>
            <input name="preferredCompanies" value={form.preferredCompanies} onChange={handleChange} placeholder="e.g. Google, Spotify, Stripe" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-4">📄 CV</h2>
          <textarea name="cvText" value={form.cvText} onChange={handleChange} rows={10} placeholder="Paste your CV text here..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono" />
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-4">🔗 LinkedIn</h2>
          <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </section>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && <span className="text-green-600 text-sm font-medium">✓ Profile saved!</span>}
        </div>
      </form>
    </div>
  )
}
