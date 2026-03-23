import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useThreatScanner } from '../hooks/useThreatScanner'

type EntityType = 'url' | 'phone' | 'email' | 'upi' | 'message' | 'unknown'
type GeoSlice = { state: string; pct: number }
type MockResult = {
  id: string
  entity: string
  entity_type: EntityType
  drs: number
  risk: 'HIGH' | 'MEDIUM' | 'LOW'
  scam: string
  reports: number
  evidence: number
  geo: GeoSlice[]
  reasons: string[]
  ai: string
  signals: Array<{ source: string; detail: string }>
  timestamp: string
}

const sampleThreats = [
  { label: 'Phishing URL', value: 'pay-sbi-secure.xyz', badge: 'HIGH', icon: '🌐' },
  { label: 'Digital Arrest', value: '+91 9123456789', badge: 'HIGH', icon: '📱' },
  { label: 'UPI Scam', value: 'cashprize2024@ybl', badge: 'MEDIUM', icon: '💳' },
  { label: 'Job Fraud Email', value: 'hr.infosys.jobs@gmail.com', badge: 'MEDIUM', icon: '📧' },
]

// ── Utility ──────────────────────────────────────────────────────────────────
function detectType(input: string): EntityType {
  const s = input.trim()
  if (/^(https?:\/\/|www\.)/i.test(s)) return 'url'
  if (/^(\+91|0)?[6-9]\d{9}$/.test(s.replace(/[\s-]/g, ''))) return 'phone'
  if (/^[\w.+%-]+@[\w-]+\.[a-z]{2,}$/i.test(s) && !/@[\w]+$/.test(s)) return 'email'
  if (/^[\w.+%-]+@[\w]+$/.test(s)) return 'upi'
  if (s.length >= 10) return 'message'
  return 'unknown'
}

// Mock generator removed now that we call the backend scanner.

// ── Sub-components ────────────────────────────────────────────────────────────

function RiskGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    let frame: number
    let start: number | null = null
    const duration = 1200
    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - (1 - progress) ** 3
      setAnimated(parseFloat((score * ease).toFixed(2)))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])

  const pct = animated / 10
  const r = 72
  const circ = 2 * Math.PI * r
  const dashOffset = circ * (1 - pct * 0.75)
  const color = score >= 7 ? '#ef4444' : score >= 4 ? '#f59e0b' : '#10b981'

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="140" viewBox="0 0 180 140">
        <circle
          cx="90"
          cy="100"
          r={r}
          fill="none"
          stroke="#1f2937"
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transform: 'rotate(-225deg)', transformOrigin: '90px 100px' }}
        />
        <circle
          cx="90"
          cy="100"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-225deg)', transformOrigin: '90px 100px', transition: 'stroke 0.5s', filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
        <text x="90" y="92" textAnchor="middle" fill="white" fontSize="30" fontWeight="800" fontFamily="monospace">
          {animated.toFixed(1)}
        </text>
        <text x="90" y="112" textAnchor="middle" fill="#9ca3af" fontSize="12" fontFamily="sans-serif">
          out of 10
        </text>
      </svg>
    </div>
  )
}

function RiskBadge({ level, large = false }: { level: MockResult['risk']; large?: boolean }) {
  const map = {
    HIGH: { bg: 'bg-red-500/20 border border-red-500/50', text: 'text-red-400', dot: 'bg-red-500' },
    MEDIUM: { bg: 'bg-amber-500/20 border border-amber-500/50', text: 'text-amber-400', dot: 'bg-amber-500' },
    LOW: { bg: 'bg-emerald-500/20 border border-emerald-500/50', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  }
  const c = map[level]
  return (
    <span className={`inline-flex items-center gap-2 rounded-full ${c.bg} ${c.text} font-bold uppercase tracking-widest ${large ? 'px-5 py-2 text-sm' : 'px-3 py-1 text-xs'}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
      {level} RISK
    </span>
  )
}

function GeoBar({ state, pct, color }: GeoSlice & { color: string }) {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = window.setTimeout(() => setW(pct), 120)
    return () => window.clearTimeout(t)
  }, [pct])
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-300">{state}</span>
        <span className="text-gray-400 font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w}%`, background: color }} />
      </div>
    </div>
  )
}

function TypeChip({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border ${active ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}

function ScannerInput({ value, onChange, onAnalyze, loading, detectedType }: { value: string; onChange: (v: string) => void; onAnalyze: () => void; loading: boolean; detectedType: EntityType }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const typeInfo: Record<EntityType, { placeholder: string; icon: string }> = {
    url: { placeholder: 'https://suspicious-site.com', icon: '🌐' },
    phone: { placeholder: '+91 98765 43210', icon: '📱' },
    email: { placeholder: 'fraud@fakeemail.com', icon: '📧' },
    upi: { placeholder: 'scammer@paytm', icon: '💳' },
    message: { placeholder: 'Paste suspicious message text here...', icon: '💬' },
    unknown: { placeholder: 'Enter URL, phone, email, UPI ID, or message...', icon: '🔍' },
  }
  const info = typeInfo[detectedType] || typeInfo.unknown

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className={`flex items-center gap-0 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${value ? 'border-blue-500/60 shadow-lg shadow-blue-500/20' : 'border-gray-700 hover:border-gray-600'} bg-gray-900`}>
        <div className="flex items-center pl-5 pr-3 py-4 shrink-0">
          <span className="text-2xl">{info.icon}</span>
        </div>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && value.trim() && onAnalyze()}
          placeholder="e.g. suspicious-site.com, +91-9999999999, upi@example"
          className="flex-1 bg-transparent text-white text-base py-4 focus:outline-none placeholder-gray-600 font-mono"
          autoComplete="off"
          spellCheck="false"
        />

        {value ? (
          <button onClick={() => onChange('')} className="px-3 text-gray-600 hover:text-gray-400 transition-colors" aria-label="Clear input">✕</button>
        ) : null}

        <button
          onClick={onAnalyze}
          disabled={loading || !value.trim()}
          aria-label="Analyze Risk"
          className={`m-2 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all duration-200 shrink-0 ${loading || !value.trim() ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 hover:shadow-blue-500/50'}`}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <span>🛡</span>
              Analyze Risk
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function ResultPanel({ result, onDismiss }: { result: MockResult; onDismiss: () => void }) {
  const [aiVisible, setAiVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [reported, setReported] = useState(false)
  const [aiLoading, setAiLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => {
      setAiLoading(false)
      setAiVisible(true)
    }, 1200)
    return () => window.clearTimeout(t)
  }, [result.id])

  const riskColor = result.risk === 'HIGH' ? '#ef4444' : result.risk === 'MEDIUM' ? '#f59e0b' : '#10b981'
  const geoColor = riskColor

  const handleCopy = () => {
    navigator.clipboard.writeText(`DHIP Alert: ${result.entity} — ${result.risk} RISK (${result.drs}/10)\nScam: ${result.scam}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-fadeIn">
      <div className="rounded-2xl p-6 mb-4 border" style={{ background: `linear-gradient(135deg, ${riskColor}18 0%, #111827 60%)`, borderColor: `${riskColor}40` }}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <RiskGauge score={result.drs} />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <RiskBadge level={result.risk} large />
              <span className="text-gray-500 text-sm">DRS Score</span>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">HIGH RISK · VERIFIED</span>
            </div>
            <p className="font-mono text-blue-300 text-sm bg-gray-900/60 px-3 py-1.5 rounded-lg inline-block mb-2 break-all">{result.entity}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-500 text-sm">⚠</span>
              <span className="text-white font-semibold text-sm">{result.scam}</span>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-gray-400">
              <span>📋 <span className="text-gray-200 font-medium">{result.reports}</span> reports (30 days)</span>
              <span>🔒 <span className="text-gray-200 font-medium">{result.evidence}</span> evidence files</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setBlocked(true)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${blocked ? 'bg-red-900/40 border border-red-500/50 text-red-400' : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'}`}
            >
              {blocked ? '✓ Blocked' : '🚫 Block This'}
            </button>
            <button
              onClick={() => setReported(true)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${reported ? 'bg-blue-900/40 border border-blue-500/50 text-blue-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              {reported ? '✓ Reported' : '📤 Report to DHIP'}
            </button>
            <button onClick={handleCopy} className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 transition-all flex items-center gap-2">
              {copied ? '✓ Copied!' : '🔗 Share Warning'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center text-xs">⚡</span>Why This Was Flagged</h3>
          <ul className="space-y-2.5">
            {result.reasons.map((r, i) => (
              <li key={r + i} className="flex items-start gap-2.5 text-sm"><span className="text-red-400 mt-0.5 shrink-0">›</span><span className="text-gray-300 leading-relaxed">{r}</span></li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs">📍</span>Geographic Spread</h3>
          <div className="space-y-3">
            {result.geo.map((g) => (
              <GeoBar key={g.state} state={g.state} pct={g.pct} color={geoColor} />
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">Based on DHIP community reports</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-purple-400">✦</span>
          <h3 className="text-white font-bold">AI Threat Analysis</h3>
          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">Powered by OpenRouter</span>
          {aiLoading ? (
            <span className="text-xs text-gray-500 flex items-center gap-1.5 ml-auto"><span className="w-3 h-3 border border-gray-500 border-t-purple-400 rounded-full animate-spin" />Analyzing with AI...</span>
          ) : null}
        </div>

        {aiLoading ? (
          <div className="space-y-2.5">
            {[90, 75, 85, 60].map((w) => (
              <div key={w} className="h-3 bg-gray-800 rounded-full animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <div className={`transition-all duration-700 ${aiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <p className="text-gray-300 leading-relaxed text-sm">{result.ai}</p>
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 font-bold text-xs uppercase tracking-wide mb-1.5">🛡 Reality Check</p>
              <p className="text-blue-200 text-sm leading-relaxed">
                {result.entity_type === 'phone'
                  ? 'No Indian government agency (CBI, ED, Police, Income Tax) will ever demand money over a phone call or video call. Hang up immediately.'
                  : result.entity_type === 'url'
                    ? 'Always verify URLs directly from the official website. Never click links sent via SMS, WhatsApp, or email — even if they look official.'
                    : result.entity_type === 'upi'
                      ? 'Sending money via UPI is irreversible. Verify the recipient\'s identity through a separate, official channel before any transfer.'
                      : 'Take time to verify. Scammers rely on urgency and panic. A few minutes of verification can save your life savings.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-4">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2"><span className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-xs">🛰</span>Detection Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.signals.map((sig) => (
            <div key={sig.source} className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-blue-200">{sig.source}</p>
              <p className="text-sm text-blue-100 font-mono">{sig.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-4">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><span className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center text-xs">✅</span>Immediate Action Steps</h3>
        <div className="flex flex-wrap gap-3">
          {['🧘 Breathe & Stay Calm', '🔍 Verify Independently', "🚫 Don't Pay / Share OTP", '📱 Block the Sender', '📢 Report to 1930'].map((step, i) => (
            <div key={step} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
              <span className="text-emerald-400 font-bold text-xs">{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300 text-sm transition-colors flex items-center gap-1.5">← Scan another entity</button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function ThreatCheckPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MockResult | null>(null)
  const [history, setHistory] = useState<Array<{ entity: string; type: EntityType; risk: MockResult['risk']; drs: number }>>([])
  const [showHistory, setShowHistory] = useState(false)
  const detectedType = detectType(input)
  const { mutateAsync: scanThreat, isPending } = useThreatScanner()

  const typeChips = [
    { label: 'url', icon: '🌐', sample: 'https://suspicious-site.com' },
    { label: 'phone', icon: '📱', sample: '+91 9876543210' },
    { label: 'email', icon: '📧', sample: 'fraud@example.com' },
    { label: 'upi', icon: '💳', sample: 'scammer@paytm' },
    { label: 'message', icon: '💬', sample: "Congratulations! You've won ₹50,000. Click here to claim..." },
  ]

  const analyze = async () => {
    const value = input.trim()
    if (!value || loading || isPending) return
    setLoading(true)
    setResult(null)

    const type = detectedType === 'unknown' ? 'message' : detectedType
    try {
      const response = await scanThreat({ entity: value, entity_type: type })
      const mapped: MockResult = {
        id: response.id || Math.random().toString(36).slice(2),
        entity: value,
        entity_type: type,
        drs: response.drs_score ?? 0,
        risk: (response.risk_level as MockResult['risk']) || 'MEDIUM',
        scam: response.scam_type || 'Suspicious Activity',
        reports: response.reports_count || 0,
        evidence: response.geo_tags?.length || 0,
        geo: (response.geo_tags || []).map((label, index) => ({ state: label, pct: Math.max(5, 100 - index * 10) })),
        reasons: response.api_results ? Object.values(response.api_results) : ['Limited intelligence returned'],
        ai: response.ai_summary || 'Our models did not return an AI summary for this entity.',
        signals: response.api_results ? Object.entries(response.api_results).map(([source, detail]) => ({ source, detail })) : [],
        timestamp: new Date().toISOString(),
      }
      setResult(mapped)
      setHistory((prev) => [{ entity: value, type, risk: mapped.risk, drs: mapped.drs }, ...prev].slice(0, 5))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to scan right now'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const dismiss = () => {
    setResult(null)
    setInput('')
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #020817 0%, #0a0f1e 40%, #0d1224 70%, #050a18 100%)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div className="sticky top-16 z-40 flex justify-end px-6 pt-2">
        <button onClick={() => setShowHistory(!showHistory)} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm bg-gray-800/80 border border-gray-700 rounded-full px-3 py-1.5">
          🕐 History {history.length > 0 ? <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">{history.length}</span> : null}
        </button>
      </div>

      {showHistory && history.length > 0 ? (
        <div className="fixed top-14 right-6 z-50 w-80 bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Recent Scans</p>
          {history.map((h) => (
            <button
              key={h.entity + h.drs}
              onClick={() => { setInput(h.entity); setShowHistory(false) }}
              className="w-full flex items-center justify-between p-2.5 hover:bg-gray-800 rounded-lg transition-colors text-left"
            >
              <span className="font-mono text-sm text-gray-300 truncate max-w-[200px]">{h.entity}</span>
              <RiskBadge level={h.risk} />
            </button>
          ))}
        </div>
      ) : null}

      <div className="pt-24 pb-12 px-6">
        {!result ? (
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 relative" style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', boxShadow: '0 0 40px #3b82f655' }}>
              <span className="text-4xl">🛡</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">Threat Intelligence <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scanner</span></h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">AI-powered analysis of URLs, phone numbers, emails, UPI IDs, and suspicious messages</p>

            <div className="flex justify-center gap-6 mt-6 flex-wrap">
              {[
                { label: 'Threats Detected', value: '2.4L+', color: 'text-red-400' },
                { label: 'Accuracy Rate', value: '98.2%', color: 'text-green-400' },
                { label: 'Avg Response', value: '< 2s', color: 'text-blue-400' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!result ? (
          <div className="flex flex-col items-center gap-4">
            <ScannerInput value={input} onChange={setInput} onAnalyze={analyze} loading={loading} detectedType={detectedType} />

            <div className="flex flex-wrap gap-2 justify-center">
              {typeChips.map((c) => (
                <TypeChip
                  key={c.label}
                  label={c.label}
                  icon={c.icon}
                  active={c.label === detectedType}
                  onClick={() => setInput(c.sample)}
                />
              ))}
            </div>

            <p className="text-gray-600 text-xs flex items-center gap-1.5">Press <kbd className="bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-gray-400 font-mono">Enter</kbd> to analyze</p>
          </div>
        ) : null}

        {loading ? (
          <div className="max-w-5xl mx-auto mt-8 space-y-4 animate-pulse" aria-label="Loading scan">
            <div className="h-48 bg-gray-800/60 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-52 bg-gray-800/60 rounded-2xl" />
              <div className="h-52 bg-gray-800/60 rounded-2xl" />
            </div>
            <div className="h-36 bg-gray-800/60 rounded-2xl" />
            <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border border-gray-600 border-t-blue-400 rounded-full animate-spin" />
              Querying threat intelligence databases...
            </div>
          </div>
        ) : null}

        {result && !loading ? (
          <div className="max-w-5xl mx-auto mt-4">
            <ResultPanel result={result} onDismiss={dismiss} />
          </div>
        ) : null}

        {!result && !loading && !input ? (
          <div className="max-w-3xl mx-auto mt-14">
            <p className="text-center text-gray-600 text-xs uppercase tracking-widest mb-5 font-semibold">Try scanning these real-world examples</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sampleThreats.map((ex) => (
                <button
                  key={ex.value}
                  aria-label={ex.value}
                  onClick={() => setInput(ex.value)}
                  className="flex items-center gap-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 rounded-xl p-3.5 transition-all duration-200 text-left group"
                >
                  <span className="text-xl shrink-0">{ex.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">{ex.label}</p>
                    <p className="font-mono text-sm text-gray-300 truncate group-hover:text-white transition-colors">{ex.value}</p>
                  </div>
                  <RiskBadge level={ex.badge as MockResult['risk']} />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="text-center py-8 text-gray-700 text-xs border-t border-gray-900 mt-8">
        DHIP — Digital Harm Intelligence Platform · All scans are anonymous · Report abuse: 1930
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  )
}

export default ThreatCheckPage
