function StepPill({ label, kind }) {
  const styles = {
    match: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    diverge: 'bg-rose-100 text-rose-700 border-rose-300',
    missing: 'border-dashed border-slate-300 text-slate-400 bg-slate-50',
  }
  return (
    <span className={`inline-block rounded-md border px-2 py-1 text-xs font-mono ${styles[kind]}`}>
      {label || '—'}
    </span>
  )
}

export default function TraceTimeline({ result }) {
  const { deterministic, trace } = result
  const diff = deterministic.step_diff

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Tool-call trace: expected vs. actual</h4>
        {deterministic.divergence_step ? (
          <span className="text-xs font-medium text-rose-600">
            Diverged at step {deterministic.divergence_step}
          </span>
        ) : (
          <span className="text-xs font-medium text-emerald-600">Sequence matched exactly</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-y-1">
          <thead>
            <tr className="text-xs text-slate-400 text-left">
              <th className="font-medium pr-3 w-10">#</th>
              <th className="font-medium pr-3">Expected tool</th>
              <th className="font-medium pr-3">Actual tool</th>
            </tr>
          </thead>
          <tbody>
            {diff.map((entry) => {
              const kind = entry.match ? 'match' : entry.actual ? 'diverge' : 'missing'
              return (
                <tr key={entry.index} className={entry.index === deterministic.divergence_step ? 'bg-rose-50/60' : ''}>
                  <td className="pr-3 text-xs font-mono text-slate-400 align-middle">{entry.index}</td>
                  <td className="pr-3">
                    <StepPill label={entry.expected} kind={entry.expected ? (entry.match ? 'match' : 'diverge') : 'missing'} />
                  </td>
                  <td className="pr-3">
                    <StepPill label={entry.actual} kind={kind} />
                  </td>
                </tr>
              )
            })}
            {diff.length === 0 && (
              <tr>
                <td colSpan={3} className="text-xs text-slate-400 italic py-2">
                  No expected tool sequence was defined for this test case.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deterministic.notes.length > 0 && (
        <ul className="text-xs text-rose-600 space-y-1 list-disc pl-4">
          {deterministic.notes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      )}

      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer select-none text-slate-600 font-medium">
          Full execution trace ({trace.steps.length} tool call{trace.steps.length === 1 ? '' : 's'})
        </summary>
        <ol className="mt-2 space-y-2 border-l border-slate-200 pl-4">
          {trace.steps.map((step) => (
            <li key={step.step}>
              <div className="font-mono text-slate-700">
                {step.step}. {step.tool_name}({JSON.stringify(step.args)})
              </div>
              <div className="text-slate-400 break-all">→ {JSON.stringify(step.result)}</div>
            </li>
          ))}
          {trace.steps.length === 0 && <li className="text-slate-400 italic">No tool calls recorded.</li>}
        </ol>
        <div className="mt-3">
          <span className="font-medium text-slate-600">Final response: </span>
          {trace.final_response || <span className="italic text-slate-400">(none)</span>}
        </div>
      </details>
    </div>
  )
}
