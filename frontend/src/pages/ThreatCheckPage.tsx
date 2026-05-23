import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Loader2, Radar, ShieldCheck, Siren } from 'lucide-react'
import { useMemo, useState } from 'react'
import { api } from '../lib/api'

type ScanType = 'url' | 'domain' | 'email' | 'phone' | 'ip' | 'upi' | 'message' | 'unknown'
type ScanStatus = 'Safe' | 'Suspicious' | 'Malicious'

type ScanResponse = {
  type: Exclude<ScanType, 'unknown'>
  status: ScanStatus
  risk_score: number
  risk_level: string
  scam_type: string
  reports_count: number
  confidence: number | null
  confidence_label: string
  message: string
}

type ThreatCheckApiResponse = {
  id?: string
  entity_type?: string
  type?: string
  drs_score?: number
  risk_level?: string
  scam_type?: string
  reports_count?: number
  from_cache?: boolean
  status?: string
  warning?: string | null
  ai_summary?: string | null
  message?: string
  confidence_score?: number
  api_results?: Record<string, unknown>
}

const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}([/?#].*)?$/i
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const PHONE_RE = /^(?:\+91|91)?[6-9]\d{9}$/
const UPI_RE = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/
const EDGE_TRIM_RE = /^[\s"'`([{<]+|[\s"'`)\]}>.,;:!?]+$/g

const QUICK_PRESETS = [
  { label: 'Malware URL', value: 'http://malware.testing.google.test/testing/malware/' },
  { label: 'Safe URL', value: 'https://google.com' },
  { label: 'Suspicious UPI', value: 'scammer@upi' },
  { label: 'Phishing Message', value: 'Click now to claim prize and share OTP' },
]

const STATS = [
  { label: 'Signals', value: 'VT + GSB + IPQS + AbuseIPDB' },
  { label: 'Score Model', value: 'Dynamic DRS (0-10)' },
  { label: 'Cache', value: '1h entity hash cache' },
  { label: 'Engine', value: 'Parallel threat analyzer' },
]

function isLikelyUpi(value: string): boolean {
  if (!UPI_RE.test(value)) return false
  const handle = value.split('@')[1]?.toLowerCase() ?? ''
  return handle !== '' && !handle.includes('.')
}

function detectInputType(value: string): ScanType {
  const trimmed = value.trim().replace(EDGE_TRIM_RE, '')
  const compact = trimmed.replace(/[\s-]/g, '')

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(trimmed)) return 'ip'
  if (PHONE_RE.test(compact)) return 'phone'
  if (isLikelyUpi(trimmed)) return 'upi'
  if (EMAIL_RE.test(trimmed)) return 'email'
  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(trimmed) && !trimmed.includes(' ')) return 'domain'
  if (URL_RE.test(trimmed) || trimmed.toLowerCase().startsWith('www.')) return 'url'

  if (trimmed.length >= 12 && /\s/.test(trimmed)) return 'message'
  return 'unknown'
}

function mapRiskToStatus(riskLevel: string, score: number): ScanStatus {
  const normalized = riskLevel.toUpperCase()
  if (normalized === 'CRITICAL' || normalized === 'HIGH' || score >= 8) return 'Malicious'
  if (normalized === 'MEDIUM' || normalized === 'LOW' || score >= 3) return 'Suspicious'
  return 'Safe'
}

function normalizeConfidence(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  if (value <= 1) return Math.round(value * 100)
  return Math.round(value)
}

function buildMessage(payload: {
  status: ScanStatus
  scamType: string
  reportsCount: number
  summary?: string | null
  warning?: string | null
  message?: string | null
}): string {
  const { status, scamType, reportsCount, summary, warning, message } = payload
  if (summary) return summary
  if (warning) return warning
  if (message) return message

  if (status === 'Malicious') {
    return `High-risk indicators detected${scamType && scamType !== 'Unknown' ? ` (${scamType})` : ''}. Do not interact and report immediately.`
  }
  if (status === 'Suspicious') {
    return `Suspicious indicators detected${scamType && scamType !== 'Unknown' ? ` (${scamType})` : ''}. Verify through official channels before acting.`
  }

  return reportsCount > 0
    ? `No major threat signals found. ${reportsCount} prior reports exist, stay cautious.`
    : 'No major threat signals found. Stay vigilant and report suspicious activity.'
}

export function ThreatCheckPage() {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScanResponse | null>(null)
  const [sourceResults, setSourceResults] = useState<Record<string, string>>({})
  const [scanMeta, setScanMeta] = useState<{ id?: string; status?: string; fromCache?: boolean }>({})

  const detectedType = useMemo(() => detectInputType(inputValue), [inputValue])

  const analyze = async () => {
    const value = inputValue.trim().replace(EDGE_TRIM_RE, '')
    if (!value || loading) return

    setError('')
    setResult(null)
    setSourceResults({})
    setScanMeta({})

    if (detectedType === 'unknown') {
      setError('Please enter a valid URL, domain, phone number, email, UPI ID, IP, or message.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('threat-check/', { entity: value, entity_type: detectedType })
      let payload = data as ThreatCheckApiResponse
      console.log('[ThreatCheckPage] scan response', payload)

      const normalizedType = String(payload.entity_type || payload.type || detectedType).toLowerCase() as ScanType
      if (!payload || normalizedType === 'unknown') {
        throw new Error('Threat scan response is incomplete. Please try again.')
      }

      const drs = Number(payload.drs_score ?? 0)
      const drsScore = Number.isFinite(drs) ? drs : 0
      const riskLevel = String(payload.risk_level ?? 'SAFE').toUpperCase()
      const status = mapRiskToStatus(riskLevel, drsScore)

      const phishingModel = payload.api_results?.phishing_model as { confidence?: number } | undefined
      const explicitConfidence = normalizeConfidence(payload.confidence_score ?? phishingModel?.confidence)
      const estimatedConfidence = Math.min(100, Math.max(5, Math.round(drsScore * 10)))
      const confidence = explicitConfidence ?? estimatedConfidence
      const confidenceLabel = explicitConfidence === null ? 'Accuracy (est.)' : 'Accuracy'

      const mappedSourceResults = Object.fromEntries(
        Object.entries(payload.api_results ?? {}).map(([source, detail]) => [
          source,
          typeof detail === 'string' ? detail : JSON.stringify(detail),
        ])
      )

      setResult({
        type: normalizedType as ScanResponse['type'],
        status,
        risk_score: drsScore,
        risk_level: riskLevel,
        scam_type: String(payload.scam_type ?? 'Unknown'),
        reports_count: Number(payload.reports_count ?? 0),
        confidence,
        confidence_label: confidenceLabel,
        message: buildMessage({
          status,
          scamType: String(payload.scam_type ?? 'Unknown'),
          reportsCount: Number(payload.reports_count ?? 0),
          summary: payload.ai_summary,
          warning: payload.warning,
          message: payload.message,
        }),
      })

      setSourceResults(mappedSourceResults)
      setScanMeta({
        id: payload.id,
        status: payload.status ?? 'completed',
        fromCache: Boolean(payload.from_cache),
      })

      if (payload.id) {
        for (let attempt = 0; attempt < 8; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 1200))
          const { data: enrichment } = await api.get(`threat-check/${payload.id}/enrichment/`)
          console.log('[ThreatCheckPage] enrichment response', enrichment)
          if (enrichment?.ready) {
            payload = {
              ...payload,
              ai_summary: enrichment.ai_summary ?? payload.ai_summary,
              warning: enrichment.warning ?? payload.warning,
              scam_type: enrichment.scam_type ?? payload.scam_type,
              confidence_score: enrichment.confidence_score ?? payload.confidence_score,
            }
            const updatedMessage = buildMessage({
              status,
              scamType: String(payload.scam_type ?? 'Unknown'),
              reportsCount: Number(payload.reports_count ?? 0),
              summary: payload.ai_summary,
              warning: payload.warning,
              message: payload.message,
            })
            setResult((prev) =>
              prev
                ? {
                    ...prev,
                    scam_type: String(payload.scam_type ?? prev.scam_type),
                    confidence: normalizeConfidence(payload.confidence_score) ?? prev.confidence,
                    message: updatedMessage,
                  }
                : prev
            )
            setScanMeta((prev) => ({ ...prev, status: 'completed' }))
            break
          }
        }
      }
    } catch (err: unknown) {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (err as { response: { data: { error: string } } }).response.data.error
          : null

      setError(apiMessage || (err instanceof Error ? err.message : 'Scan request failed.'))
    } finally {
      setLoading(false)
    }
  }

  const drsScoreDisplay = result ? result.risk_score.toFixed(1) : '--'
  const riskPercent = result ? Math.min(100, Math.max(0, Math.round((result.risk_score / 10) * 100))) : 0

  const statusStyle =
    result?.status === 'Malicious'
      ? 'border-pink-500/50 bg-pink-500/15 text-pink-300'
      : result?.status === 'Suspicious'
        ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
        : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'

  return (
    <div className="min-h-screen bg-[#03070f] bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.10),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.09),_transparent_32%)] px-4 py-10 text-cyan-100 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between border-b border-cyan-400/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-cyan-400/50 bg-cyan-400/10 p-2">
              <ShieldCheck className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] text-cyan-400/80">MODULE</p>
              <h1 className="text-xl font-bold tracking-wide text-white sm:text-2xl">THREAT INTELLIGENCE SCANNER</h1>
              <p className="mt-1 text-xs text-cyan-200/70">Live scanner UI with resilient output rendering.</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 sm:block">
            SYSTEM OPERATIONAL
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-400/25 bg-slate-950/75 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)] sm:p-7">
              <p className="mb-4 text-xs tracking-[0.2em] text-cyan-400/80">INPUT TARGET VECTOR</p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && analyze()}
                  placeholder="Enter URL, domain, phone, email, UPI, IP, or message"
                  className="w-full rounded-xl border border-cyan-400/25 bg-slate-900/90 px-4 py-3 text-sm text-cyan-100 placeholder:text-cyan-900 focus:border-cyan-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={analyze}
                  disabled={loading}
                  className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/90 px-5 py-3 text-sm font-bold tracking-wide text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? 'SCANNING' : 'ANALYZE'}
                </button>
              </div>

              <div className="mt-3 text-xs text-cyan-300/85">
                Detected type:{' '}
                <span className="font-semibold text-white">
                  {detectedType === 'unknown' ? 'Not detected' : detectedType.toUpperCase()}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setInputValue(preset.value)}
                    className="rounded-full border border-cyan-400/30 bg-slate-900/80 px-3 py-1 text-xs text-cyan-200 hover:border-cyan-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {error ? (
                <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
            </div>

            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-cyan-300/20 bg-slate-950/75 p-5 shadow-2xl sm:p-7"
              >
                <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">Scan Result</h2>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div className={`rounded-xl border px-4 py-3 ${statusStyle}`}>
                    <p className="text-xs uppercase tracking-wide opacity-80">Status</p>
                    <p className="mt-1 text-lg font-semibold">{result.status}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-200/80">Risk: {result.risk_level}</p>
                  </div>

                  <div className="rounded-xl border border-cyan-400/20 bg-slate-900/80 px-4 py-3 text-slate-200">
                    <p className="text-xs uppercase tracking-wide text-cyan-300/70">DRS Score</p>
                    <p className="mt-1 text-lg font-semibold">{drsScoreDisplay}</p>
                    <p className="text-[11px] text-cyan-300/60">0-10 scale</p>
                  </div>

                  <div className="rounded-xl border border-cyan-400/20 bg-slate-900/80 px-4 py-3 text-slate-200">
                    <p className="text-xs uppercase tracking-wide text-cyan-300/70">{result.confidence_label}</p>
                    <p className="mt-1 text-lg font-semibold">{result.confidence ?? 0}%</p>
                  </div>

                  <div className="rounded-xl border border-cyan-400/20 bg-slate-900/80 px-4 py-3 text-slate-200">
                    <p className="text-xs uppercase tracking-wide text-cyan-300/70">Type</p>
                    <p className="mt-1 text-lg font-semibold">{result.type.toUpperCase()}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-cyan-400/20 bg-slate-900/70 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-cyan-300/80">
                    <span>Threat Meter</span>
                    <span>{riskPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all ${
                        result.status === 'Malicious' ? 'bg-pink-400' : result.status === 'Suspicious' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${riskPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-cyan-400/20 bg-slate-900/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-cyan-300/70">Details</p>
                  <p className="mt-2 text-sm text-slate-200 sm:text-base">{result.message}</p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-cyan-400/20 bg-slate-900/70 px-4 py-3 text-slate-200">
                    <p className="text-xs uppercase tracking-wide text-cyan-300/70">Scam Type</p>
                    <p className="mt-1 text-sm font-semibold">{result.scam_type || 'Unknown'}</p>
                  </div>
                  <div className="rounded-xl border border-cyan-400/20 bg-slate-900/70 px-4 py-3 text-slate-200">
                    <p className="text-xs uppercase tracking-wide text-cyan-300/70">Reports</p>
                    <p className="mt-1 text-sm font-semibold">{result.reports_count.toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-cyan-400/20 bg-slate-900/70 px-4 py-3 text-slate-200">
                    <p className="text-xs uppercase tracking-wide text-cyan-300/70">Scan Meta</p>
                    <p className="mt-1 text-sm font-semibold">
                      {(scanMeta.status || 'completed').toUpperCase()} {scanMeta.fromCache ? '· CACHE HIT' : '· LIVE'}
                    </p>
                  </div>
                </div>

                {Object.keys(sourceResults).length > 0 ? (
                  <div className="mt-4 rounded-xl border border-cyan-400/20 bg-slate-900/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-cyan-300/70">Source Signals</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-300">
                      {Object.entries(sourceResults).map(([source, detail]) => (
                        <div key={source} className="flex items-start justify-between gap-4">
                          <span className="font-semibold uppercase text-cyan-200/90">{source}</span>
                          <span className="text-right text-slate-300/90">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-3">
                  <p className="text-sm font-bold text-cyan-300 sm:text-base">{stat.value}</p>
                  <p className="mt-1 text-[10px] tracking-wide text-cyan-400/70">{stat.label.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-4">
            <p className="mb-3 text-xs tracking-[0.2em] text-cyan-400/80">RESPONSE GUIDE</p>
            <div className="space-y-2 text-xs">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200">
                <div className="mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> SAFE / LOW
                </div>
                <p>Do not share OTP, UPI PIN, passwords, or card details.</p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
                <div className="mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> MEDIUM
                </div>
                <p>Verify via official channels. Avoid opening unknown links.</p>
              </div>
              <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 p-3 text-pink-200">
                <div className="mb-1 flex items-center gap-2">
                  <Siren className="h-4 w-4" /> HIGH / CRITICAL
                </div>
                <p>Block, report to 1930, and preserve screenshots/evidence.</p>
              </div>
              <div className="rounded-lg border border-cyan-400/20 bg-slate-900/60 p-3 text-cyan-100">
                <div className="mb-1 flex items-center gap-2">
                  <Radar className="h-4 w-4" /> Scan ID
                </div>
                <p className="break-all text-[11px] text-slate-300">{scanMeta.id || 'Will appear after scan'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreatCheckPage
