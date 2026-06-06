import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

function SuiteCard({ suite, onRun, onDelete, running }) {
  const [history, setHistory] = useState(null)

  useEffect(() => {
    let cancelled = false
    api
      .listRuns(suite.id)
      .then((runs) => !cancelled && setHistory(runs))
      .catch(() => !cancelled && setHistory([]))
    return () => {
      cancelled = true
    }
  }, [suite.id])

  const last = history && history.length ? history[history.length - 1] : null
  const passRate = last ? Math.round((last.pass_count / (last.pass_count + last.fail_count)) * 100) : null

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{suite.name}</h3>
          {suite.description && <p className="text-sm text-slate-500 mt-0.5">{suite.description}</p>}
          <p className="text-xs text-slate-400 mt-1">{suite.test_cases.length} test case(s)</p>
        </div>
        {last && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              passRate === 100
                ? 'bg-emerald-100 text-emerald-700'
                : passRate >= 50
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
            }`}
          >
            Last run: {passRate}% passed
          </span>
        )}
      </div>

      {last && (
        <Link to={`/runs/${last.id}`} className="text-xs text-violet-600 hover:text-violet-800">
          View latest report card →
        </Link>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => onRun(suite.id)}
          disabled={running || suite.test_cases.length === 0}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {running ? 'Running…' : 'Run suite'}
        </button>
        <Link to={`/builder/${suite.id}`} className="text-xs text-slate-500 hover:text-slate-800">
          Edit
        </Link>
        <button onClick={() => onDelete(suite.id)} className="text-xs text-rose-500 hover:text-rose-700">
          Delete
        </button>
      </div>
    </div>
  )
}

export default function SuiteList() {
  const navigate = useNavigate()
  const [suites, setSuites] = useState(null)
  const [error, setError] = useState(null)
  const [runningId, setRunningId] = useState(null)
  const [runError, setRunError] = useState(null)

  function load() {
    api
      .listSuites()
      .then(setSuites)
      .catch((e) => setError(e.message))
  }

  useEffect(load, [])

  async function handleRun(suiteId) {
    setRunError(null)
    setRunningId(suiteId)
    try {
      const report = await api.runSuite(suiteId)
      navigate(`/runs/${report.id}`)
    } catch (e) {
      setRunError(e.message)
    } finally {
      setRunningId(null)
    }
  }

  async function handleDelete(suiteId) {
    if (!confirm('Delete this suite and all of its test cases?')) return
    await api.deleteSuite(suiteId)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Test suites</h2>
          <p className="text-sm text-slate-500 mt-1">
            Run a suite against the sample customer-support agent to verify its execution trace
            and score its responses.
          </p>
        </div>
        <Link
          to="/builder"
          className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          + New suite
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          Failed to load suites: {error}
        </div>
      )}
      {runError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          Run failed: {runError}
        </div>
      )}
      {runningId && (
        <div className="rounded-md border border-violet-200 bg-violet-50 px-4 py-2 text-sm text-violet-700">
          Executing test cases against the agent — this calls a live model and may take a minute…
        </div>
      )}

      {suites === null && <p className="text-sm text-slate-500">Loading…</p>}
      {suites && suites.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center">
          <p className="text-sm text-slate-500">No test suites yet.</p>
          <Link to="/builder" className="text-sm text-violet-600 hover:text-violet-800 font-medium">
            Create your first suite →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suites?.map((suite) => (
          <SuiteCard
            key={suite.id}
            suite={suite}
            onRun={handleRun}
            onDelete={handleDelete}
            running={runningId === suite.id}
          />
        ))}
      </div>
    </div>
  )
}
