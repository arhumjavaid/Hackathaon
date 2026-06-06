import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import TraceTimeline from '../components/TraceTimeline.jsx'
import {
  PassRateDonut,
  RunHistoryTrend,
  SemanticScoreBars,
  TokenUsageChart,
} from '../components/ScoreCharts.jsx'

function StatusBadge({ passed }) {
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
      }`}
    >
      {passed ? 'PASS' : 'FAIL'}
    </span>
  )
}

function TestCaseCard({ result }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{result.test_case_name}</h3>
            <StatusBadge passed={result.passed} />
          </div>
          <p className="text-sm text-slate-500 mt-1">"{result.trigger_prompt}"</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-semibold text-slate-800">{result.semantic.score}</p>
          <p className="text-xs text-slate-400">semantic score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-md p-3 text-xs text-slate-500 space-y-1">
          <p>
            <span className="font-medium text-slate-600">Latency:</span>{' '}
            {Math.round(result.trace.latency_ms).toLocaleString()} ms
          </p>
          <p>
            <span className="font-medium text-slate-600">Tokens:</span>{' '}
            {result.trace.token_usage.total_tokens.toLocaleString()} total (
            {result.trace.token_usage.prompt_tokens.toLocaleString()} prompt /{' '}
            {result.trace.token_usage.candidate_tokens.toLocaleString()} candidate)
          </p>
          <p>
            <span className="font-medium text-slate-600">Hallucination flag:</span>{' '}
            {result.semantic.hallucination_flag ? (
              <span className="text-rose-600 font-medium">yes</span>
            ) : (
              <span className="text-emerald-600">no</span>
            )}
          </p>
        </div>
        <div className="bg-slate-50 rounded-md p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-600 mb-1">Judge rationale</p>
          <p className="text-slate-500">{result.semantic.rationale || '—'}</p>
        </div>
      </div>

      <TraceTimeline result={result} />
    </div>
  )
}

export default function ReportCard() {
  const { runId } = useParams()
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setReport(null)
    api
      .getRun(runId)
      .then((r) => {
        if (cancelled) return
        setReport(r)
        return api.listRuns(r.suite_id)
      })
      .then((runs) => !cancelled && runs && setHistory(runs))
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [runId])

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
        Failed to load report: {error}
      </div>
    )
  }
  if (!report) {
    return <p className="text-sm text-slate-500">Loading report…</p>
  }

  const totalTokens = report.results.reduce((sum, r) => sum + r.trace.token_usage.total_tokens, 0)
  const avgLatency = report.results.length
    ? Math.round(report.results.reduce((sum, r) => sum + r.trace.latency_ms, 0) / report.results.length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link to="/" className="text-xs text-violet-600 hover:text-violet-800">
            ← Back to suites
          </Link>
          <h2 className="text-xl font-semibold text-slate-900 mt-1">{report.suite_name} — Report Card</h2>
          <p className="text-sm text-slate-500 mt-1">
            Run {report.id} · {new Date(report.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-2xl font-semibold text-emerald-600">{report.pass_count}</p>
            <p className="text-xs text-slate-400">passed</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-rose-600">{report.fail_count}</p>
            <p className="text-xs text-slate-400">failed</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-800">{totalTokens.toLocaleString()}</p>
            <p className="text-xs text-slate-400">total tokens</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-800">{avgLatency.toLocaleString()}</p>
            <p className="text-xs text-slate-400">avg latency (ms)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PassRateDonut passCount={report.pass_count} failCount={report.fail_count} />
        <SemanticScoreBars results={report.results} />
        <TokenUsageChart results={report.results} />
        <RunHistoryTrend history={history} />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Per-test-case results</h3>
        {report.results.map((result) => (
          <TestCaseCard key={result.test_case_id} result={result} />
        ))}
      </div>
    </div>
  )
}
