import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, emptyTestCase } from '../api/client.js'
import TestCaseForm from '../components/TestCaseForm.jsx'

export default function SuiteBuilder() {
  const { suiteId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(suiteId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [testCases, setTestCases] = useState([emptyTestCase()])
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [genDescription, setGenDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)

  useEffect(() => {
    if (!isEditing) return
    let cancelled = false
    setLoading(true)
    api
      .getSuite(suiteId)
      .then((suite) => {
        if (cancelled) return
        setName(suite.name)
        setDescription(suite.description || '')
        setTestCases(suite.test_cases.length ? suite.test_cases : [emptyTestCase()])
      })
      .catch((e) => setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [suiteId, isEditing])

  function updateCase(index, updated) {
    setTestCases((prev) => prev.map((tc, i) => (i === index ? updated : tc)))
  }

  function removeCase(index) {
    setTestCases((prev) => prev.filter((_, i) => i !== index))
  }

  function addCase() {
    setTestCases((prev) => [...prev, emptyTestCase()])
  }

  async function handleGenerate() {
    if (!genDescription.trim()) {
      setGenError('Describe the scenario you want to test first.')
      return
    }
    setGenError(null)
    setGenerating(true)
    try {
      const draft = await api.generateTestCase(genDescription.trim())
      setTestCases((prev) => {
        // Replace a single still-empty case rather than piling up blanks
        if (prev.length === 1 && !prev[0].trigger_prompt.trim() && !prev[0].name.trim()) {
          return [draft]
        }
        return [...prev, draft]
      })
      setGenDescription('')
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Suite name is required.')
      return
    }
    if (testCases.some((tc) => !tc.trigger_prompt.trim())) {
      setError('Every test case needs a trigger prompt.')
      return
    }
    setSaving(true)
    const payload = { name, description, test_cases: testCases }
    try {
      if (isEditing) {
        await api.updateSuite(suiteId, payload)
      } else {
        await api.createSuite(payload)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading suite…</p>
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {isEditing ? 'Edit test suite' : 'New test suite'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Define trigger prompts, the expected tool-call sequence, and a golden response for
          each test case. The suite will be run against the sample customer-support agent.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Suite name</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Refund Flow Suite"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this suite testing?"
          />
        </div>
      </div>

      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-violet-900">✨ Draft a test case from a description</h3>
        <p className="text-xs text-violet-700/80">
          Describe the scenario in plain language — an LLM will draft the trigger prompt, the
          expected tool-call sequence, and a golden response for you to review and tweak below.
        </p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-violet-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={genDescription}
            onChange={(e) => setGenDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleGenerate()
              }
            }}
            placeholder='e.g. "Make sure ineligible refund requests get escalated to a human instead of refunded"'
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-md bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? 'Generating…' : 'Generate draft'}
          </button>
        </div>
        {genError && <p className="text-xs text-rose-600">{genError}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Test cases</h3>
          <button
            type="button"
            onClick={addCase}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium"
          >
            + Add test case
          </button>
        </div>
        {testCases.map((tc, i) => (
          <TestCaseForm
            key={i}
            index={i}
            testCase={tc}
            onChange={(updated) => updateCase(i, updated)}
            onRemove={() => removeCase(i)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create suite'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
