import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useThreatScanner } from '../hooks/useThreatScanner'
import type { RiskLevel } from '../types/threat'
import { RiskBadge } from '../components/ui/RiskBadge'
import { RiskGauge } from '../components/ui/RiskGauge'

type EntityType = 'url' | 'phone' | 'email' | 'upi' | 'ip' | 'message'

const examples = ['pay-sbi-secure.xyz', '+91-9834512099', 'refund@incometax.cc', 'sharma123@ybl', '104.27.140.82']

function detectEntityType(value: string): EntityType {
  const trimmed = value.trim()
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) return 'ip'
  if (/^[+]?\d{10,13}$/.test(trimmed.replace(/[\s-]/g, ''))) return 'phone'
  if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(trimmed)) return 'email'
  if (/^[\w.-]+@[a-zA-Z]+$/.test(trimmed)) return 'upi'
  if (/^https?:\/\//.test(trimmed) || /\.[a-z]{2,}$/i.test(trimmed)) return 'url'
  return 'message'
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 8) return 'HIGH'
  if (score >= 4.5) return 'MEDIUM'
  return 'LOW'
}

export function ThreatCheckPage() {
  const [value, setValue] = useState('')
  const mutation = useThreatScanner()

  const entityType = useMemo(() => detectEntityType(value), [value])
  const result = mutation.data
  const riskScore = result?.drs_score ?? null
  const riskLevel = scoreToLevel(riskScore ?? 0)

  const runAnalysis = async () => {
    if (!value.trim()) return
    try {
      await mutation.mutateAsync({
        entity: value,
        entity_type: entityType,
      })
    } catch {
      toast.error('Threat check request failed. Please try again.')
    }
  }

  return (
    <div>
      <section className="bg-[linear-gradient(160deg,#0A0F1E_0%,#0c1a3a_40%,#130f2a_100%)] py-16 text-center">
        <div className="page-wrap">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-4xl shadow-[0_12px_40px_rgba(37,99,235,0.3)]">🛡</div>
          <h1 className="text-4xl font-black text-white md:text-5xl">Threat Intelligence Scanner</h1>
          <p className="mt-3 text-gray-400">Enter a URL, phone number, email, or UPI ID to scan across threat databases</p>

          <div className="mx-auto mt-8 max-w-4xl">
            <div className="flex overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/90">
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="e.g. suspicious-site.com, +91-9999999999, upi@example"
                className="w-full bg-transparent px-5 py-4 text-white outline-none placeholder:text-gray-500"
              />
              <button
                onClick={runAnalysis}
                disabled={mutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-sm font-bold text-white disabled:opacity-70"
              >
                {mutation.isPending ? 'Analyzing...' : 'Analyze Risk'}
              </button>
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-blue-300">Detected Type: {entityType}</p>
          </div>
        </div>
      </section>

      <section className="page-wrap py-8">
        {!result ? (
          <div className="rounded-2xl border border-gray-700 bg-gray-800/60 p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Try These Examples</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button key={example} onClick={() => setValue(example)} className="rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-xs text-gray-300">
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="rounded-2xl border border-gray-700 bg-gray-800/60">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 bg-gradient-to-r from-blue-600/10 to-violet-600/10 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Scanned Entity</p>
                <p className="mt-1 font-mono text-blue-300">{value}</p>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level={riskLevel} />
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">{result.scam_type || 'Suspicious Pattern'}</span>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Digital Risk Score</p>
                <div className="mt-3 flex justify-center"><RiskGauge score={riskScore ?? 0} /></div>
                <p className="mt-2 text-center text-sm text-gray-400">{result.scam_type || 'Unknown Pattern'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-blue-300">Reports: {result.reports_count ?? 0}</span>
                  {(result.geo_tags ?? []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-violet-300">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Entity Metadata</p>
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <p>Type: <span className="font-mono text-blue-300">{result.entity_type || entityType}</span></p>
                  <p>Entity: <span className="font-mono text-blue-300">{result.entity || value}</span></p>
                  <p>Reports: <span className="font-mono text-violet-300">{result.reports_count ?? 0}</span></p>
                </div>
              </div>
            </div>

            <div className="mx-6 mb-6 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 text-sm text-gray-200">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">AI Analysis</p>
              {result.ai_summary ? result.ai_summary : (
                <span className="inline-flex items-center gap-2 text-gray-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />Generating AI summary...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 px-6 pb-6">
              <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300">🚫 Block This</button>
              <Link to="/community/report" className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300">📋 Report to DHIP</Link>
              <button className="rounded-lg border border-gray-700 bg-gray-900/70 px-4 py-2 text-xs font-semibold text-gray-300">📤 Share Warning</button>
              <Link to="/evidence" className="rounded-lg border border-gray-700 bg-gray-900/70 px-4 py-2 text-xs font-semibold text-gray-300">🔐 Save Evidence</Link>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
