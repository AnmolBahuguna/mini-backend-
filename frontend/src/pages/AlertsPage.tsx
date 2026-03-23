import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAlertsQuery } from '../hooks/useAlertsQuery'
import type { AlertApiRecord } from '../types/api'

type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

type Alert = {
  id: string
  severity: Severity
  scamType: string
  title: string
  district: string
  state: string
  description: string
  minsAgo: number
  reports: number
  isNew?: boolean
}

const STATES = [
  'All States', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const THREAT_TYPES = [
  'All Types', 'Digital Arrest', 'UPI Fraud', 'Job Scam',
  'Phishing', 'Sextortion', 'Crypto Fraud', 'Loan App Fraud', 'SIM Swap',
]

const DISTRICTS: Record<string, string[]> = {
  Delhi: ['New Delhi', 'Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Agra', 'Varanasi', 'Kanpur'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Roorkee', 'Rishikesh', 'Haldwani'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
}

const ALL_DISTRICTS = Object.values(DISTRICTS).flat()

const SCAM_ICONS: Record<string, string> = {
  'Digital Arrest': '🚔',
  'UPI Fraud': '💸',
  'Job Scam': '💼',
  Phishing: '🎣',
  Sextortion: '🔒',
  'Crypto Fraud': '₿',
  'Loan App Fraud': '📱',
  'SIM Swap': '📡',
}

const SEVERITIES: Severity[] = ['HIGH', 'HIGH', 'HIGH', 'MEDIUM', 'MEDIUM', 'LOW']

const DESCRIPTIONS: Record<string, string[]> = {
  'Digital Arrest': [
    "Caller impersonating CBI officer demanding Rs 2.5 lakh to 'close a money laundering case'",
    "Fake ED officer on video call claiming victim's Aadhaar linked to drug trafficking",
    "Scammer posing as Customs officer regarding 'illegal package' at airport",
    'Victim kept on 9-hour video call by fake Supreme Court judge demanding bail money',
  ],
  'UPI Fraud': [
    'Fake QR codes pasted over legitimate ones at petrol pumps and kirana stores',
    "Scammer sent 'request money' link disguised as payment confirmation",
    'Fraudulent UPI collect request after OLX deal - victim lost Rs 45,000',
    'Fake electricity bill payment portal harvesting UPI PINs',
  ],
  'Job Scam': [
    'Fake Infosys HR demanding Rs 8,500 registration fee for WFH data entry job',
    'YouTube likes fraud - victims paid first, then asked for Rs 50,000 to "unlock earnings"',
    'Fake Amazon work-from-home portal collecting Aadhaar and bank details',
    'Fraudulent LinkedIn job offer requiring "security deposit" of Rs 15,000',
  ],
  Phishing: [
    'SMS phishing mimicking SBI KYC update - captures net banking credentials',
    'Fake IRCTC refund portal harvesting credit card CVV and OTP',
    'WhatsApp message impersonating PM Kisan scheme asking for bank details',
    'Fake Income Tax refund portal collecting PAN and bank account numbers',
  ],
  Sextortion: [
    'Victim recorded during WhatsApp video call - Rs 3 lakh demanded for deletion',
    'Fake female profile on Instagram leading to morphed image blackmail',
    'Dating app account used to obtain intimate photos, then extortion demand sent',
  ],
  'Crypto Fraud': [
    'Fake trading platform showing artificial profits, withdrawal blocked unless fee paid',
    'Telegram group "pump signals" - victims lost Rs 1.2 lakh in fake token',
    'Romance scam leading victim to invest Rs 5.8 lakh in fraudulent crypto exchange',
  ],
  'Loan App Fraud': [
    'Instant loan app accessing full contacts - threatening to send morphed photos',
    "Chinese-origin app charging 500% interest and harassing borrower's family",
    'Fake NBFC app collecting biometric data and demanding Rs 12,000 processing fee',
  ],
  'SIM Swap': [
    'Fraudster obtained duplicate SIM from store using forged Aadhaar - drained savings',
    'Social engineering call to telecom store resulted in SIM swap and Rs 2.3 lakh loss',
  ],
}

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const generateAlert = (id?: string, overrides: Partial<Alert> = {}): Alert => {
  const stateKeys = Object.keys(DISTRICTS)
  const state = randomFrom(stateKeys)
  const district = randomFrom(DISTRICTS[state])
  const scamType = randomFrom(THREAT_TYPES.slice(1))
  const descriptions = DESCRIPTIONS[scamType] || ['Suspicious activity reported']
  const severity = randomFrom(SEVERITIES)
  const minsAgo = Math.floor(Math.random() * 180)

  return {
    id: id || `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    severity,
    scamType,
    title: `${scamType} Surge - ${district}`,
    district,
    state,
    description: randomFrom(descriptions),
    minsAgo,
    reports: Math.floor(Math.random() * 120) + 5,
    isNew: false,
    ...overrides,
  }
}

const seedAlerts = (count = 18): Alert[] => Array.from(
  { length: count },
  (_, i) => generateAlert(undefined, { minsAgo: i * 8 + Math.floor(Math.random() * 15) }),
)

const RiskBadge = ({ level, small }: { level: Severity; small?: boolean }) => {
  const map = {
    HIGH: { ring: 'border-red-500/60', bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-500' },
    MEDIUM: { ring: 'border-amber-500/60', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-500' },
    LOW: { ring: 'border-green-500/60', bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-500' },
  }
  const c = map[level]
  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-bold uppercase tracking-wider ${c.ring} ${c.bg} ${c.text} ${small ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}`}
    >
      <span className={`rounded-full animate-pulse ${c.dot} ${small ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      {level}
    </span>
  )
}

const timeLabel = (mins: number) => {
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  return h === 1 ? '1 hr ago' : `${h} hrs ago`
}

const parseTimeAgo = (time: string | undefined) => {
  if (!time) return 0
  if (time.endsWith('m')) return parseInt(time, 10)
  if (time.endsWith('h')) return parseInt(time, 10) * 60
  const asNumber = Number(time)
  if (Number.isFinite(asNumber)) return Math.max(0, asNumber)
  return 0
}

const mapApiAlert = (record: AlertApiRecord): Alert => {
  const risk = (record.severity || 'MEDIUM').toUpperCase()
  const severity: Severity = risk === 'CRITICAL' || risk === 'VERIFIED'
    ? 'HIGH'
    : (['HIGH', 'MEDIUM', 'LOW'].includes(risk) ? (risk as Severity) : 'MEDIUM')

  return {
    id: record.id,
    severity,
    scamType: record.scamType || 'Threat',
    title: record.title,
    district: record.region || 'Unknown',
    state: record.state || record.region || 'Unknown',
    description: record.description,
    minsAgo: parseTimeAgo(record.time),
    reports: record.affectedCount ?? 0,
  }
}

const AlertCard = ({ alert, isNew, onDismiss }: { alert: Alert; isNew: boolean; onDismiss?: (id: string) => void }) => {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const borderColor = alert.severity === 'HIGH'
    ? 'border-red-500/30 hover:border-red-500/60'
    : alert.severity === 'MEDIUM'
      ? 'border-amber-500/30 hover:border-amber-500/60'
      : 'border-green-500/20 hover:border-green-500/40'

  const glowColor = alert.severity === 'HIGH'
    ? 'rgba(239,68,68,0.06)'
    : alert.severity === 'MEDIUM'
      ? 'rgba(245,158,11,0.06)'
      : 'transparent'

  if (dismissed) return null

  return (
    <div
      className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${borderColor} ${isNew ? 'animate-slideIn' : ''}`}
      style={{ background: `linear-gradient(135deg, ${glowColor} 0%, #0f172a 100%)` }}
    >
      {isNew ? (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
      ) : null}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5 ${alert.severity === 'HIGH' ? 'bg-red-500/15' : alert.severity === 'MEDIUM' ? 'bg-amber-500/15' : 'bg-green-500/15'}`}
          >
            {SCAM_ICONS[alert.scamType] || '⚠️'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <RiskBadge level={alert.severity} small />
                {isNew ? (
                  <span className="text-[10px] bg-blue-500/20 border border-blue-500/40 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">NEW</span>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-gray-600 text-xs">{timeLabel(alert.minsAgo)}</span>
                <button
                  onClick={() => {
                    setDismissed(true)
                    onDismiss?.(alert.id)
                  }}
                  className="text-gray-700 hover:text-gray-400 transition-colors text-xs w-5 h-5 flex items-center justify-center rounded hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <h3 className="text-white font-semibold text-sm leading-tight mb-1">{alert.title}</h3>

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">📍 {alert.district}, {alert.state}</span>
              <span className="flex items-center gap-1">📋 {alert.reports} reports</span>
            </div>

            <p className={`text-gray-400 text-xs leading-relaxed transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}>
              {alert.description}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
              >
                {expanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
              <div className="flex-1" />
              <button className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg transition-colors">📤 Share</button>
              <button className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg transition-colors">🚩 Report</button>
              <button
                className={`text-xs border px-2.5 py-1 rounded-lg transition-colors ${alert.severity === 'HIGH'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'}`}
              >
                🚫 Block
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RegionalRiskMeter = ({ value, district, refreshIn }: { value: number; district: string; refreshIn: number }) => {
  const [displayed, setDisplayed] = useState(0)
  const previousValue = useRef(0)

  useEffect(() => {
    let frame: number
    let start: number | null = null
    const target = value
    const prev = previousValue.current
    const duration = 1000

    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      const nextValue = Math.round(prev + (target - prev) * ease)
      setDisplayed(nextValue)
      if (p < 1) {
        frame = requestAnimationFrame(animate)
      } else {
        previousValue.current = target
      }
    }

    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [value])

  const r = 80
  const circ = 2 * Math.PI * r
  const pct = displayed / 100
  const arc = circ * 0.75

  const color = displayed >= 71 ? '#ef4444' : displayed >= 31 ? '#f59e0b' : '#10b981'
  const label = displayed >= 71 ? 'High Activity' : displayed >= 31 ? 'Moderate Activity' : 'Low Activity'
  const labelColor = displayed >= 71 ? 'text-red-400' : displayed >= 31 ? 'text-amber-400' : 'text-green-400'

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const angle = -225 + i * 27
    const rad = (angle * Math.PI) / 180
    const inner = 66
    const outer = 75
    return {
      x1: 100 + inner * Math.cos(rad),
      y1: 100 + inner * Math.sin(rad),
      x2: 100 + outer * Math.cos(rad),
      y2: 100 + outer * Math.sin(rad),
      major: i % 5 === 0,
    }
  })

  return (
    <div className="bg-gray-900/80 border border-gray-700/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm">Regional Risk Meter</h3>
          <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">📍 {district}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </div>

      <div className="flex justify-center mb-3">
        <svg width="200" height="160" viewBox="0 0 200 160">
          <circle
            cx="100"
            cy="105"
            r={r}
            fill="none"
            stroke="#1f2937"
            strokeWidth="12"
            strokeDasharray={`${arc} ${circ - arc}`}
            strokeDashoffset={circ * 0.25}
            strokeLinecap="round"
            style={{ transform: 'rotate(-225deg)', transformOrigin: '100px 105px' }}
          />
          <circle
            cx="100"
            cy="105"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${arc} ${circ - arc}`}
            strokeDashoffset={circ * 0.25 + (arc - arc * pct)}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-225deg)',
              transformOrigin: '100px 105px',
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1), stroke 0.5s',
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.major ? '#4b5563' : '#374151'}
              strokeWidth={t.major ? 2 : 1}
              strokeLinecap="round"
            />
          ))}
          <text x="100" y="96" textAnchor="middle" fill="white" fontSize="32" fontWeight="800" fontFamily="monospace">
            {displayed}
          </text>
          <text x="100" y="113" textAnchor="middle" fill="#6b7280" fontSize="11" fontFamily="sans-serif">
            percent
          </text>
          <text x="22" y="148" fill="#4b5563" fontSize="10" fontFamily="sans-serif">
            0
          </text>
          <text x="172" y="148" fill="#4b5563" fontSize="10" fontFamily="sans-serif">
            100
          </text>
        </svg>
      </div>

      <div className="text-center mb-4">
        <span className={`text-sm font-bold ${labelColor}`}>{label}</span>
      </div>

      <div className="space-y-1.5 mb-4">
        {[
          { range: '0–30%', label: 'Low Activity', color: 'bg-green-500', active: displayed < 31 },
          { range: '31–70%', label: 'Moderate Activity', color: 'bg-amber-500', active: displayed >= 31 && displayed < 71 },
          { range: '71–100%', label: 'High Activity', color: 'bg-red-500', active: displayed >= 71 },
        ].map((zone) => (
          <div
            key={zone.label}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${zone.active ? 'bg-gray-800/80' : 'opacity-40'}`}
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${zone.color} ${zone.active ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-gray-400 flex-1">{zone.label}</span>
            <span className="text-xs text-gray-600 font-mono">{zone.range}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800 pt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
          <span>Refreshing in</span>
          <span className="font-mono text-gray-400">{refreshIn}s</span>
        </div>
        <div className="h-0.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500/60 rounded-full transition-all duration-1000"
            style={{ width: `${(refreshIn / 300) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const StatWidget = ({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) => (
  <div className={`bg-gray-900/80 border rounded-xl p-4 ${color}`}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
    </div>
    <div className="text-2xl font-black text-white font-mono">{value}</div>
    {sub ? <div className="text-xs text-gray-500 mt-0.5">{sub}</div> : null}
  </div>
)

const TopScams = ({ alerts }: { alerts: Alert[] }) => {
  const counts: Record<string, number> = {}
  alerts.forEach((a) => {
    counts[a.scamType] = (counts[a.scamType] || 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const max = sorted[0]?.[1] || 1

  return (
    <div className="bg-gray-900/80 border border-gray-700/60 rounded-2xl p-5">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span className="w-5 h-5 bg-purple-500/20 rounded flex items-center justify-center text-xs">📊</span>
        Top Threat Types
      </h3>
      <div className="space-y-3">
        {sorted.map(([type, count]) => (
          <div key={type}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 flex items-center gap-1.5">
                <span>{SCAM_ICONS[type] || '⚠️'}</span>
                {type}
              </span>
              <span className="text-gray-500 font-mono">{count}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(count / max) * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FilterSelect = ({ label, value, options, onChange, icon }: { label: string; value: string; options: string[]; onChange: (value: string) => void; icon: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
      <span>{icon}</span>
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500/60 appearance-none cursor-pointer pr-8 transition-colors hover:border-gray-600"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-gray-800">
            {option}
          </option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs">▼</span>
    </div>
  </div>
)

const AlertTicker = ({ alerts }: { alerts: Alert[] }) => {
  const recent = alerts.slice(0, 8)
  if (!recent.length) return null
  const items = [...recent, ...recent]

  return (
    <div className="border-b border-gray-800/60 bg-gray-950/80 overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 bg-red-600 text-white text-xs font-black px-3 py-2 uppercase tracking-widest flex items-center gap-1.5 z-10">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          LIVE
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-0 animate-ticker whitespace-nowrap">
            {items.map((item, index) => (
              <span key={`${item.id}-${index}`} className="inline-flex items-center gap-2 px-6 py-2 text-xs border-r border-gray-800/60">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.severity === 'HIGH' ? 'bg-red-500' : item.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
                <span className="text-gray-400">{SCAM_ICONS[item.scamType] || '⚠️'} {item.scamType}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-300">{item.district}, {item.state}</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500">{timeLabel(item.minsAgo)}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-3xl mb-4">🛡️</div>
    <p className="text-green-400 font-bold mb-1">No Active Alerts</p>
    <p className="text-gray-600 text-sm">No threats detected in your selected region. Stay vigilant!</p>
  </div>
)

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-3xl mb-4">⚠️</div>
    <p className="text-red-400 font-bold mb-1">Connection Error</p>
    <p className="text-gray-500 text-sm mb-4">Unable to load real-time alerts. Check your connection.</p>
    <button onClick={onRetry} className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors">
      Try Again →
    </button>
  </div>
)

const SkeletonCard = () => (
  <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 animate-pulse">
    <div className="flex gap-3">
      <div className="w-10 h-10 bg-gray-800 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-4 w-14 bg-gray-800 rounded-full" />
          <div className="h-4 w-8 bg-gray-800 rounded-full" />
        </div>
        <div className="h-4 w-48 bg-gray-800 rounded" />
        <div className="h-3 w-32 bg-gray-800 rounded" />
        <div className="h-3 w-full bg-gray-800 rounded" />
        <div className="h-3 w-4/5 bg-gray-800 rounded" />
      </div>
    </div>
  </div>
)

const useRealtimeAlerts = (stateFilter: string, typeFilter: string) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryCount = useRef(0)

  const fetchInitial = useCallback(() => {
    const latency = 900 + Math.random() * 400
    const timer = window.setTimeout(() => {
      if (retryCount.current > 0 && Math.random() < 0.1) {
        setError(true)
        setLoading(false)
        setConnectionStatus('error')
        return
      }
      const seed = seedAlerts(24)
      setAlerts(seed)
      setError(false)
      setLoading(false)
      setConnectionStatus('connected')
    }, latency)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const clearFetch = fetchInitial()
    intervalRef.current = setInterval(() => {
      const newAlert = generateAlert(undefined, { minsAgo: 0, isNew: true })
      const id = newAlert.id
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50))
      setNewIds((prev) => new Set([...prev, id]))
      window.setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }, 5000)
    }, 6000 + Math.random() * 8000)

    return () => {
      if (clearFetch) clearFetch()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchInitial])

  const filtered = alerts.filter((alert) => {
    const stateOk = stateFilter === 'All States' || alert.state === stateFilter
    const typeOk = typeFilter === 'All Types' || alert.scamType === typeFilter
    return stateOk && typeOk
  })

  const retry = () => {
    retryCount.current += 1
    setLoading(true)
    setError(false)
    setConnectionStatus('connecting')
    fetchInitial()
  }

  return { alerts: filtered, allAlerts: alerts, loading, error, connectionStatus, newIds, retry }
}

export function AlertsPage() {
  const [stateFilter, setStateFilter] = useState('All States')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [riskValue, setRiskValue] = useState(50)
  const [riskDistrict, setRiskDistrict] = useState('Haridwar, Uttarakhand')
  const [refreshIn, setRefreshIn] = useState(300)
  const [sortBy, setSortBy] = useState<'newest' | 'severity' | 'reports'>('newest')
  const [showOnlyHigh, setShowOnlyHigh] = useState(false)

  const realtime = useRealtimeAlerts(stateFilter, typeFilter)
  const { data: apiAlerts, isLoading: apiLoading, isError: apiError, refetch } = useAlertsQuery({ state: stateFilter, scamType: typeFilter })

  const mappedApiAlerts = useMemo(() => (apiAlerts ?? []).map(mapApiAlert), [apiAlerts])
  const hasApiData = mappedApiAlerts.length > 0

  const alerts = hasApiData ? mappedApiAlerts : realtime.alerts
  const allAlerts = hasApiData ? mappedApiAlerts : realtime.allAlerts
  const loading = hasApiData ? (apiLoading && mappedApiAlerts.length === 0) : realtime.loading
  const error = hasApiData ? apiError : realtime.error
  const connectionStatus = hasApiData ? (apiLoading ? 'connecting' : 'connected') : realtime.connectionStatus
  const newIds = hasApiData ? new Set<string>() : realtime.newIds
  const retry = hasApiData ? refetch : realtime.retry

  useEffect(() => {
    const nextRisk = () => Math.floor(Math.random() * 85) + 10
    const init = window.setTimeout(() => {
      setRiskValue(nextRisk())
    }, 0)
    const tick = setInterval(() => {
      setRefreshIn((prev) => {
        if (prev <= 1) {
          setRiskValue(nextRisk())
          setRiskDistrict(randomFrom(ALL_DISTRICTS))
          return 300
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      window.clearTimeout(init)
      clearInterval(tick)
    }
  }, [])

  useEffect(() => {
    if (stateFilter !== 'All States' && DISTRICTS[stateFilter]) {
      const timeout = window.setTimeout(() => {
        setRiskDistrict(`${randomFrom(DISTRICTS[stateFilter])}, ${stateFilter}`)
        setRiskValue(Math.floor(Math.random() * 85) + 10)
      }, 0)
      return () => window.clearTimeout(timeout)
    }
  }, [stateFilter])

  const displayAlerts = [...alerts]
    .filter((alert) => !showOnlyHigh || alert.severity === 'HIGH')
    .sort((a, b) => {
      if (sortBy === 'newest') return a.minsAgo - b.minsAgo
      if (sortBy === 'severity') {
        const order: Record<Severity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        return order[a.severity] - order[b.severity]
      }
      if (sortBy === 'reports') return b.reports - a.reports
      return 0
    })

  const highCount = alerts.filter((alert) => alert.severity === 'HIGH').length
  const medCount = alerts.filter((alert) => alert.severity === 'MEDIUM').length
  const totalReports = alerts.reduce((sum, alert) => sum + alert.reports, 0)

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, #0f172a 0%, #020817 50%, #030b15 100%)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <div className="pt-16">
        <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-end gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : connectionStatus === 'connecting' ? 'bg-amber-500 animate-ping' : 'bg-red-500'}`}
            />
            <span className={connectionStatus === 'connected' ? 'text-green-400' : connectionStatus === 'connecting' ? 'text-amber-400' : 'text-red-400'}>
              {connectionStatus === 'connected' ? 'Live data' : connectionStatus === 'connecting' ? 'Connecting…' : 'Offline fallback'}
            </span>
          </div>
          {error ? (
            <button onClick={() => { void retry?.() }} className="rounded-full border border-red-500/40 px-3 py-1 text-red-300 hover:border-red-400">
              Retry
            </button>
          ) : null}
        </div>
        <AlertTicker alerts={allAlerts} />
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              Live Threat Alerts
              {!loading ? (
                <span className="text-sm font-normal bg-gray-800 border border-gray-700 text-gray-400 px-2.5 py-1 rounded-full">{alerts.length} alerts</span>
              ) : null}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Real-time cybercrime intelligence across India</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-black text-red-400">{highCount}</div>
              <div className="text-xs text-gray-600">High Risk</div>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <div className="text-lg font-black text-amber-400">{medCount}</div>
              <div className="text-xs text-gray-600">Medium</div>
            </div>
            <div className="w-px h-8 bg-gray-800" />
            <div className="text-center">
              <div className="text-lg font-black text-blue-400">{totalReports.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Reports</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pb-4">
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold uppercase tracking-wider self-center shrink-0">
              <span>⚙️</span>
              Filters
            </div>
            <div className="flex-1 min-w-[160px] max-w-[220px]">
              <FilterSelect label="State / Region" icon="🗺️" value={stateFilter} options={STATES} onChange={setStateFilter} />
            </div>
            <div className="flex-1 min-w-[160px] max-w-[220px]">
              <FilterSelect label="Threat Type" icon="⚠️" value={typeFilter} options={THREAT_TYPES} onChange={setTypeFilter} />
            </div>
            <div className="flex-1 min-w-[140px] max-w-[180px]">
              <FilterSelect label="Sort By" icon="↕️" value={sortBy} options={['newest', 'severity', 'reports']} onChange={(value) => setSortBy(value as 'newest' | 'severity' | 'reports')} />
            </div>
            <button
              onClick={() => setShowOnlyHigh(!showOnlyHigh)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${showOnlyHigh ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
            >
              <span className={`w-2 h-2 rounded-full ${showOnlyHigh ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
              HIGH only
            </button>
            {stateFilter !== 'All States' || typeFilter !== 'All Types' || showOnlyHigh ? (
              <button
                onClick={() => {
                  setStateFilter('All States')
                  setTypeFilter('All Types')
                  setShowOnlyHigh(false)
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0"
              >
                ✕ Reset filters
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </>
            ) : error ? (
              <ErrorState onRetry={retry} />
            ) : displayAlerts.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {stateFilter !== 'All States' || typeFilter !== 'All Types' ? (
                  <div className="text-xs text-gray-500 flex items-center gap-2 px-1">
                    <span>Showing</span>
                    <span className="text-gray-300 font-medium">{displayAlerts.length}</span>
                    <span>alerts for</span>
                    {stateFilter !== 'All States' ? (
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">{stateFilter}</span>
                    ) : null}
                    {typeFilter !== 'All Types' ? (
                      <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">{typeFilter}</span>
                    ) : null}
                  </div>
                ) : null}
                {displayAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} isNew={newIds.has(alert.id)} onDismiss={() => {}} />
                ))}
              </>
            )}
          </div>

          <div className="space-y-4">
            <RegionalRiskMeter value={riskValue} district={riskDistrict} refreshIn={refreshIn} />

            <div className="grid grid-cols-2 gap-3">
              <StatWidget icon="🚨" label="Active" value={alerts.length} sub="Live alerts" color="border-red-500/20" />
              <StatWidget icon="📋" label="Reports" value={`${Math.round(totalReports / 1000)}K+`} sub="Last 30 days" color="border-blue-500/20" />
              <StatWidget icon="📍" label="States" value={new Set(alerts.map((alert) => alert.state)).size} sub="Affected" color="border-amber-500/20" />
              <StatWidget icon="⏱" label="Avg Age" value={`${Math.round(alerts.reduce((sum, alert) => sum + alert.minsAgo, 0) / Math.max(alerts.length, 1))}m`} sub="Alert freshness" color="border-green-500/20" />
            </div>

            {!loading ? <TopScams alerts={allAlerts} /> : null}

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
              <p className="text-blue-300 font-bold text-sm mb-1">🆘 Cyber Helpline</p>
              <p className="text-3xl font-black text-white mb-1">1930</p>
              <p className="text-xs text-blue-400/70">National Cyber Crime Helpline</p>
              <p className="text-xs text-gray-600 mt-2">Available 24x7 - Report at cybercrime.gov.in</p>
              <p className="mt-3 text-xs text-gray-500 font-semibold uppercase tracking-[0.14em]">Emergency Numbers</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }

        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-ticker { animation: ticker 28s linear infinite; }
        .animate-ticker:hover { animation-play-state: paused; }

        select option { background: #1f2937; }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
