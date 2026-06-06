const AVAILABLE_TOOLS = [
  'look_up_order',
  'check_inventory',
  'check_refund_policy',
  'process_refund',
  'send_confirmation_email',
  'escalate_to_human',
]

export default function TestCaseForm({ testCase, onChange, onRemove, index }) {
  function update(field, value) {
    onChange({ ...testCase, [field]: value })
  }

  function addExpectedTool() {
    update('expected_tools', [...testCase.expected_tools, { name: AVAILABLE_TOOLS[0], expected_args: null }])
  }

  function updateExpectedTool(i, name) {
    const next = testCase.expected_tools.map((t, idx) => (idx === i ? { ...t, name } : t))
    update('expected_tools', next)
  }

  function removeExpectedTool(i) {
    update(
      'expected_tools',
      testCase.expected_tools.filter((_, idx) => idx !== i),
    )
  }

  function moveExpectedTool(i, dir) {
    const next = [...testCase.expected_tools]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    update('expected_tools', next)
  }

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Test case name</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={testCase.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder={`Test case ${index + 1}`}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1"
        >
          Remove
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Trigger prompt</label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          rows={2}
          value={testCase.trigger_prompt}
          onChange={(e) => update('trigger_prompt', e.target.value)}
          placeholder="e.g. I want a refund for order ORD-1001, the item arrived broken."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-slate-500">
            Expected tool-call sequence (ordered)
          </label>
          <button
            type="button"
            onClick={addExpectedTool}
            className="text-xs text-violet-600 hover:text-violet-800 font-medium"
          >
            + Add step
          </button>
        </div>
        {testCase.expected_tools.length === 0 && (
          <p className="text-xs text-slate-400 italic">No expected tools defined yet.</p>
        )}
        <ol className="space-y-1.5">
          {testCase.expected_tools.map((tool, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 w-5 text-right">{i + 1}.</span>
              <select
                className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={tool.name}
                onChange={(e) => updateExpectedTool(i, e.target.value)}
              >
                {AVAILABLE_TOOLS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => moveExpectedTool(i, -1)} className="text-slate-400 hover:text-slate-700 text-xs px-1" title="Move up">
                ↑
              </button>
              <button type="button" onClick={() => moveExpectedTool(i, 1)} className="text-slate-400 hover:text-slate-700 text-xs px-1" title="Move down">
                ↓
              </button>
              <button type="button" onClick={() => removeExpectedTool(i)} className="text-rose-400 hover:text-rose-600 text-xs px-1" title="Remove">
                ✕
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Golden response (for semantic comparison)
        </label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          rows={2}
          value={testCase.golden_response}
          onChange={(e) => update('golden_response', e.target.value)}
          placeholder="Describe what an ideal final answer should communicate..."
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Pass threshold (semantic score ≥)</label>
        <input
          type="number"
          min={0}
          max={100}
          className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={testCase.pass_threshold}
          onChange={(e) => update('pass_threshold', Number(e.target.value))}
        />
      </div>
    </div>
  )
}
