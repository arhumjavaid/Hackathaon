import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import SuiteList from './pages/SuiteList.jsx'
import SuiteBuilder from './pages/SuiteBuilder.jsx'
import ReportCard from './pages/ReportCard.jsx'

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-200'
  }`

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Universal Agent Testing &amp; Scoring Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Deterministic trace verification + LLM-as-judge scoring for AI agents
              </p>
            </div>
            <nav className="flex gap-2">
              <NavLink to="/" end className={navLinkClass}>
                Suites
              </NavLink>
              <NavLink to="/builder" className={navLinkClass}>
                Suite Builder
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<SuiteList />} />
              <Route path="/builder" element={<SuiteBuilder />} />
              <Route path="/builder/:suiteId" element={<SuiteBuilder />} />
              <Route path="/runs/:runId" element={<ReportCard />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
