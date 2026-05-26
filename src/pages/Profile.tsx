import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const WORK_MODES = ['On-site', 'Remote', 'Hybrid']
const SENIORITY_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Manager', 'Director', 'C-Level']

interface ProfileForm {
  role: string
  seniority: string
  industry: string
  location: string
  workMode: string
  salaryExpectations: string
  preferredCompanies: string
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
}

function Input({ name, value, onChange, placeholder }: {
  name: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>; placeholder?: string
}) {
  return (
    <input
      name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
    />
  )
}

function Select({ name, value, onChange, options }: {
  name: string; value: string; onChange: React.ChangeEventHandler<HTMLSelectElement>; options: string[]
}) {
  return (
    <select
      name={name} value={value} onChange={onChange}
      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white"
    >
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function Profile() {
  const [form, setForm] = useState<ProfileForm>({
    role: '', seniority: '', industry: '', location: '',
    workMode: '', salaryExpectations: '', preferredCompanies: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<ProfileForm | null>('/profile')
      .then(p => { if (p) setForm({ role: p.role ?? '', seniority: p.seniority ?? '', industry: p.industry ?? '', location: p.location ?? '', workMode: p.workMode ?? '', salaryExpectations: p.salaryExpectations ?? '', preferredCompanies: p.preferredCompanies ?? '' }) })
      .catch(console.error)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Preferences</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set your target role and preferences. These are used to personalise your CV and LinkedIn analysis.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Target Role</FieldLabel>
            <Input name="role" value={form.role} onChange={handleChange} placeholder="e.g. Product Manager" />
          </div>
          <div>
            <FieldLabel>Seniority</FieldLabel>
            <Select name="seniority" value={form.seniority} onChange={handleChange} options={SENIORITY_LEVELS} />
          </div>
          <div>
            <FieldLabel>Industry</FieldLabel>
            <Input name="industry" value={form.industry} onChange={handleChange} placeholder="e.g. Fintech, Healthcare" />
          </div>
          <div>
            <FieldLabel>Location</FieldLabel>
            <Input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Madrid, Spain" />
          </div>
          <div>
            <FieldLabel>Work Mode</FieldLabel>
            <Select name="workMode" value={form.workMode} onChange={handleChange} options={WORK_MODES} />
          </div>
          <div>
            <FieldLabel>Salary Expectations</FieldLabel>
            <Input name="salaryExpectations" value={form.salaryExpectations} onChange={handleChange} placeholder="e.g. 60,000–80,000 EUR" />
          </div>
        </div>
        <div>
          <FieldLabel>Preferred Companies</FieldLabel>
          <Input name="preferredCompanies" value={form.preferredCompanies} onChange={handleChange} placeholder="e.g. Google, Spotify, Stripe" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Preferences'}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <span>✓</span> Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
