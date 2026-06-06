const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  listSuites: () => request('/suites'),
  getSuite: (id) => request(`/suites/${id}`),
  createSuite: (suite) =>
    request('/suites', { method: 'POST', body: JSON.stringify(suite) }),
  updateSuite: (id, suite) =>
    request(`/suites/${id}`, { method: 'PUT', body: JSON.stringify(suite) }),
  deleteSuite: (id) => request(`/suites/${id}`, { method: 'DELETE' }),
  generateTestCase: (description) =>
    request('/suites/generate-test-case', { method: 'POST', body: JSON.stringify({ description }) }),

  runSuite: (id) => request(`/suites/${id}/run`, { method: 'POST' }),
  getRun: (id) => request(`/runs/${id}`),
  listRuns: (suiteId) =>
    request(`/runs${suiteId ? `?suite_id=${encodeURIComponent(suiteId)}` : ''}`),
}

export function emptyTestCase() {
  return {
    id: '',
    name: '',
    trigger_prompt: '',
    expected_tools: [],
    golden_response: '',
    pass_threshold: 70,
  }
}
