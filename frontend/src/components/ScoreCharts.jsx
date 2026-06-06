import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const PASS_COLOR = '#10b981'
const FAIL_COLOR = '#f43f5e'
const SCORE_COLOR = '#7c3aed'
const TOKEN_COLOR = '#0ea5e9'

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      {subtitle && <p className="text-xs text-slate-400 mb-2">{subtitle}</p>}
      <div className="h-56 mt-2">{children}</div>
    </div>
  )
}

export function PassRateDonut({ passCount, failCount }) {
  const data = [
    { name: 'Passed', value: passCount, color: PASS_COLOR },
    { name: 'Failed', value: failCount, color: FAIL_COLOR },
  ].filter((d) => d.value > 0)

  const total = passCount + failCount
  const pct = total ? Math.round((passCount / total) * 100) : 0

  return (
    <ChartCard title="Pass rate" subtitle={`${passCount} of ${total} test cases passed`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={24} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-2xl font-semibold text-slate-800 -mt-36 pointer-events-none">{pct}%</p>
    </ChartCard>
  )
}

export function SemanticScoreBars({ results }) {
  const data = results.map((r) => ({
    name: r.test_case_name || r.test_case_id,
    score: r.semantic.score,
    threshold: r.deterministic.passed ? null : 0,
    fill: r.passed ? PASS_COLOR : FAIL_COLOR,
  }))

  return (
    <ChartCard title="Semantic-drift score by test case" subtitle="LLM-as-judge intent-match score (0–100)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function TokenUsageChart({ results }) {
  const data = results.map((r) => ({
    name: r.test_case_name || r.test_case_id,
    prompt: r.trace.token_usage.prompt_tokens,
    candidates: r.trace.token_usage.candidate_tokens,
    total: r.trace.token_usage.total_tokens,
  }))

  return (
    <ChartCard title="Token consumption per test case" subtitle="Prompt vs. candidate token usage">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="prompt" stackId="t" fill={TOKEN_COLOR} name="Prompt tokens" radius={[0, 0, 0, 0]} />
          <Bar dataKey="candidates" stackId="t" fill="#a78bfa" name="Candidate tokens" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function RunHistoryTrend({ history }) {
  const data = history.map((r, i) => ({
    name: `Run ${i + 1}`,
    avgScore: r.avg_semantic_score,
    totalTokens: r.total_tokens,
    passRate: Math.round((r.pass_count / Math.max(1, r.pass_count + r.fail_count)) * 100),
  }))

  if (data.length < 2) {
    return (
      <ChartCard title="Run-over-run trend" subtitle="Run this suite again to compare results over time">
        <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
          Need at least two runs to show a trend.
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title="Run-over-run trend" subtitle="Average semantic score and pass rate across runs of this suite">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="avgScore" stroke={SCORE_COLOR} name="Avg semantic score" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="passRate" stroke={PASS_COLOR} name="Pass rate %" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
