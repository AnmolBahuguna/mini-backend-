import confetti from 'canvas-confetti'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Modal } from '../components/ui/Modal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useCreateReport, useReports } from '../hooks/useReports'
import { useRealtimeReports } from '../hooks/useRealtimeFeed'
import type { CommunityReport } from '../types/api'
import type { ThreatReport } from '../types/threat'
import { useCrimeStore } from '../store/crimeStore'
import './CommunityPage.css'

type CrimeStatEntry = {
  state: string
  fraud_cases: number
  year: number
}

type HeatmapPoint = {
  lat: number
  lng: number
  intensity: number
  label: string
  count: number
  year: number
}

// State coordinates for heatmap visualization
const STATE_COORDS = {
  "Andhra Pradesh":   { lat: 15.9129, lng: 79.7400 },
  "Arunachal Pradesh":{ lat: 28.2180, lng: 94.7278 },
  "Assam":            { lat: 26.2006, lng: 92.9376 },
  "Bihar":            { lat: 25.0961, lng: 85.3131 },
  "Chhattisgarh":     { lat: 21.2787, lng: 81.8661 },
  "Goa":              { lat: 15.2993, lng: 74.1240 },
  "Gujarat":          { lat: 22.2587, lng: 71.1924 },
  "Haryana":          { lat: 29.0588, lng: 76.0856 },
  "Himachal Pradesh": { lat: 31.1048, lng: 77.1734 },
  "Jharkhand":        { lat: 23.6102, lng: 85.2799 },
  "Karnataka":        { lat: 15.3173, lng: 75.7139 },
  "Kerala":           { lat: 10.8505, lng: 76.2711 },
  "Madhya Pradesh":   { lat: 22.9734, lng: 78.6569 },
  "Maharashtra":      { lat: 19.7515, lng: 75.7139 },
  "Manipur":          { lat: 24.6637, lng: 93.9063 },
  "Meghalaya":        { lat: 25.4670, lng: 91.3662 },
  "Mizoram":          { lat: 23.1645, lng: 92.9376 },
  "Nagaland":         { lat: 26.1584, lng: 94.5624 },
  "Odisha":           { lat: 20.9517, lng: 85.0985 },
  "Punjab":           { lat: 31.1471, lng: 75.3412 },
  "Rajasthan":        { lat: 27.0238, lng: 74.2179 },
  "Sikkim":           { lat: 27.5330, lng: 88.5122 },
  "Tamil Nadu":       { lat: 11.1271, lng: 78.6569 },
  "Telangana":        { lat: 18.1124, lng: 79.0193 },
  "Tripura":          { lat: 23.9408, lng: 91.9882 },
  "Uttar Pradesh":    { lat: 26.8467, lng: 80.9462 },
  "Uttarakhand":      { lat: 30.0668, lng: 79.0193 },
  "West Bengal":      { lat: 22.9868, lng: 87.8550 },
  "Delhi":            { lat: 28.7041, lng: 77.1025 },
}

export function CommunityPage() {
  useRealtimeReports()
  const reportsQuery = useReports()
  const createReport = useCreateReport()
  const navigate = useNavigate()
  
  // Crime data store
  const { crimeStats, fetchCrimeStats, loading: crimeLoading, crimeError } = useCrimeStore() as {
    crimeStats: CrimeStatEntry[]
    fetchCrimeStats: () => Promise<void>
    loading: boolean
    crimeError: string | null
  }

  const [open, setOpen] = useState(false)
  const [entity, setEntity] = useState('')
  const [scamType, setScamType] = useState('Phishing')
  const [description, setDescription] = useState('')
  const [filterType, setFilterType] = useState('All Types')
  const [filterState, setFilterState] = useState('All States')
  const [selectedState, setSelectedState] = useState<HeatmapPoint | null>(null)
  
  // Fetch crime stats on mount
  useEffect(() => {
    fetchCrimeStats()
  }, [fetchCrimeStats])

  const isReportsLoading = reportsQuery.isLoading
  const isReportsError = reportsQuery.isError

  const totals = useMemo(() => ({
    activeReports: reportsQuery.data?.length ?? 0,
    accuracy: 98.2,
    contributors: 150000,
    prevented: (reportsQuery.data?.length ?? 0) * 11,
  }), [reportsQuery.data?.length])

  const reports = useMemo(() => {
    const fallbackReports: ThreatReport[] = [
      {
        id: 'r-fallback-1',
        title: 'UPI Fraud — Fake KYC Update',
        region: 'Mumbai',
        timeAgo: '5m ago',
        description: 'Scammers sending fake RBI KYC update links requesting OTP.',
        similarCount: 18,
        level: 'HIGH',
      },
    ]

    return reportsQuery.data ?? fallbackReports
  }, [reportsQuery.data])

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const typeOk =
        filterType === 'All Types'
        || ('scamType' in report && report.scamType === filterType)
        || ('level' in report && report.level === filterType)
      const stateOk = filterState === 'All States' || report.region === filterState
      return typeOk && stateOk
    })
  }, [filterState, filterType, reports])

  const showSkeletons = isReportsLoading && filteredReports.length === 0

  const normalizeState = (name: string) =>
    (name || '')
      .replace(/&/g, 'and')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  
  // Transform crime stats into heatmap points
  const heatmapPoints = useMemo(() => {
    const coordsByNormalized = Object.entries(STATE_COORDS).reduce((acc, [stateName, coords]) => {
      acc[normalizeState(stateName)] = coords
      return acc
    }, {} as Record<string, { lat: number; lng: number }>)

    return crimeStats
      .filter((s: CrimeStatEntry) => coordsByNormalized[normalizeState(s.state)])
      .map((s: CrimeStatEntry) => ({
        lat: coordsByNormalized[normalizeState(s.state)].lat,
        lng: coordsByNormalized[normalizeState(s.state)].lng,
        intensity: s.fraud_cases,
        label: s.state,
        count: s.fraud_cases,
        year: s.year,
      }))
  }, [crimeStats])
  
  // Get intensity color based on fraud cases
  const getIntensityColor = (count: number) => {
    if (count > 50000) return 'critical'   // Dark red
    if (count > 10000) return 'high'       // Orange
    if (count > 1000) return 'medium'      // Yellow
    return 'low'                           // Green
  }
  
  // Calculate position percentage for map overlay
  const getMapPosition = (lat: number, lng: number) => {
    // India bounds: lat 8-37, lng 68-97
    const latPercent = ((37 - lat) / (37 - 8)) * 100
    const lngPercent = ((lng - 68) / (97 - 68)) * 100
    return { top: `${latPercent}%`, left: `${lngPercent}%` }
  }

  const submitReport = useCallback(async () => {
    if (!entity.trim() || !description.trim()) {
      toast.error('Entity and description are required')
      return
    }

    try {
      await createReport.mutateAsync({ entity, entity_type: 'message', scamType, description })
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.65 } })
      toast.success('Report submitted successfully')
      setEntity('')
      setScamType('Phishing')
      setDescription('')
      setOpen(false)
    } catch {
      toast.error('Failed to submit report')
    }
  }, [createReport, description, entity, scamType])

  return (
    <div className="community-shell">
      <section className="comm-hero">
        <div className="page-wrap">
          <div className="comm-proto">Protocol 09: Community Intel</div>
          <div className="comm-hero-grid">
            <div className="comm-hero-text">
              <p className="comm-kicker">Signal Hub</p>
              <h1 className="comm-title">Decentralized reporting network for cyber-resilience.</h1>
              <p className="comm-sub">Real-time data streams from the frontlines of digital defense. Collective intelligence to neutralize threats before they spread.</p>
              <div className="comm-tags">
                <span>Realtime</span>
                <span>Anon by default</span>
                <span>DRS enrichment</span>
              </div>
              <button
                type="button"
                className="comm-secondary"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                ← Back
              </button>
            </div>

            <div className="comm-metric-grid">
              <div className="comm-metric-card">
                <p className="comm-metric-label">Active Reports</p>
                <p className="comm-metric-value">{totals.activeReports.toLocaleString()}+</p>
              </div>
              <div className="comm-metric-card">
                <p className="comm-metric-label">Threats Blocked</p>
                <p className="comm-metric-value text-green">{totals.prevented.toLocaleString()}</p>
              </div>
              <div className="comm-metric-card">
                <p className="comm-metric-label">Active Nodes</p>
                <p className="comm-metric-value text-cyan">{Math.round(totals.contributors / 1000)}K</p>
              </div>
              <div className="comm-metric-card">
                <p className="comm-metric-label">Accuracy</p>
                <p className="comm-metric-value text-amber">{totals.accuracy}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap comm-main">
        <div className="comm-map-card">
          <div className="comm-map-head">
            <div>
              <p className="comm-map-label">India Crime Data Heatmap</p>
              <p className="comm-map-region">Region: India · Source: data.gov.in (NCRP)</p>
            </div>
            <span className="comm-live-pill">● Live data</span>
          </div>
          <div className="comm-map-surface">
            {crimeLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-slate-400">Loading crime data...</div>
              </div>
            ) : crimeError ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-amber-400 text-sm">⚠️ Could not load crime data</p>
                <button 
                  onClick={() => fetchCrimeStats()} 
                  className="px-3 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30"
                >
                  Retry
                </button>
              </div>
            ) : heatmapPoints.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 text-sm">No crime data available</p>
              </div>
            ) : (
              <>
                {heatmapPoints.map((point: HeatmapPoint, idx: number) => {
                  const position = getMapPosition(point.lat, point.lng)
                  const intensityClass = getIntensityColor(point.count)
                  return (
                    <div
                      key={idx}
                      className={`comm-signal ${intensityClass}`}
                      style={position}
                      onClick={() => setSelectedState(point)}
                      title={`${point.label}: ${point.count.toLocaleString('en-IN')} cases`}
                    >
                      <span className="comm-signal-dot" />
                      <span className="comm-signal-meta">
                        {point.label.length > 15 ? point.label.slice(0, 12) + '...' : point.label}
                      </span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
          <div className="comm-legend">
            <span className="legend-item"><span className="legend-dot red" />&gt;50,000 cases</span>
            <span className="legend-item"><span className="legend-dot orange" />10,000–50,000</span>
            <span className="legend-item"><span className="legend-dot yellow" />1,000–10,000</span>
            <span className="legend-item"><span className="legend-dot green" />&lt;1,000</span>
          </div>
          {selectedState && (
            <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-white">{selectedState.label}</h4>
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {selectedState.count.toLocaleString('en-IN')} <span className="text-sm text-slate-400">fraud cases</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Year: {selectedState.year}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded">
                    Source: NCRP (data.gov.in)
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedState(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="comm-feed-card">
            <div className="comm-feed-head">
              <div>
                <p className="comm-feed-kicker">Community Intel</p>
                <h3 className="comm-feed-title">Community Intelligence Feed</h3>
              </div>
              <div className="comm-feed-filter">Threats · Signals</div>
            </div>

            {isReportsLoading ? (
              <div className="mb-3">
                <LoadingSpinner size="sm" text="Loading reports..." />
              </div>
            ) : null}

            <div className="comm-feed-filters">
            <select aria-label="Filter by type" value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              <option>All Types</option>
              <option>Phishing</option>
              <option>UPI Fraud</option>
              <option>Digital Arrest</option>
              <option>Loan App</option>
              <option>Job Scam</option>
              <option>HIGH</option>
              <option>MEDIUM</option>
              <option>LOW</option>
            </select>
            <select aria-label="Filter by state" value={filterState} onChange={(event) => setFilterState(event.target.value)}>
              <option>All States</option>
              <option>Delhi</option>
              <option>Mumbai</option>
              <option>Bengaluru</option>
              <option>Hyderabad</option>
              <option>Jaipur</option>
            </select>
          </div>

          {isReportsError ? (
            <div className="comm-warning">
              Failed to load feed. Showing cached entries.
              <button
                onClick={() => reportsQuery.refetch()}
                className="ml-3 rounded bg-blue-600 px-2 py-1 text-xs text-white"
              >
                Retry
              </button>
            </div>
          ) : null}

          <div className="comm-feed-list">
            {showSkeletons ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="comm-feed-item comm-feed-skeleton" aria-hidden="true">
                  <div className="comm-feed-meta">
                    <span className="comm-dot" />
                    <span className="comm-feed-type" />
                    <span className="comm-feed-region" />
                    <span className="comm-feed-time" />
                  </div>
                  <p className="comm-feed-body" />
                  <p className="comm-feed-desc" />
                </div>
              ))
            ) : (
              filteredReports.map((report) => {
                const threatLevel = (report as ThreatReport).level ?? (report as CommunityReport).severity ?? 'MEDIUM'
                const tone = threatLevel === 'HIGH' ? 'red' : threatLevel === 'LOW' ? 'cyan' : 'amber'

                return (
                  <Link key={report.id} to={`/reports/${report.id}`} className="comm-feed-item">
                    <div className="comm-feed-meta">
                      <span className={`comm-dot ${tone}`} />
                      <span className="comm-feed-type">{threatLevel}</span>
                      <span className="comm-feed-region">{report.region}</span>
                      <span className="comm-feed-time">{report.timeAgo ?? 'Just now'}</span>
                    </div>
                    <p className="comm-feed-body">{report.title}</p>
                    <p className="comm-feed-desc">{report.description}</p>
                  </Link>
                )
              })
            )}
          </div>

          <div className="comm-cta-row">
            <button className="comm-primary" onClick={() => setOpen(true)}>Report Anonymously</button>
            <button className="comm-secondary" onClick={() => setOpen(true)}>Report a Threat</button>
          </div>
        </div>
      </section>

      <section className="page-wrap comm-archive">
        <button className="comm-archive-btn">View Archive Database</button>
      </section>

      <section className="comm-narratives">
        <div className="page-wrap">
          <div className="comm-narr-header">
            <h3>Survivor Narratives</h3>
            <div className="comm-nav-dots" aria-hidden="true">
              <span />
              <span />
            </div>
          </div>
          <div className="comm-narr-grid">
            <div className="comm-narr-card">
              <div className="comm-narr-id">ID: W08-2921</div>
              <p className="comm-narr-quote">“The phishing attempt was so sophisticated it used my bank’s actual IVR voice. DHIP flagged the outgoing connection before any data was lost.”</p>
              <div className="comm-narr-meta"><span>Anonymous user</span><span className="verified">Verified</span></div>
            </div>
            <div className="comm-narr-card">
              <div className="comm-narr-id">ID: RMR-0182</div>
              <p className="comm-narr-quote">“After the data breach, I felt helpless. The community here helped me secure my credentials and provided the reporting tools I needed.”</p>
              <div className="comm-narr-meta"><span>Network admin</span><span className="verified">Verified</span></div>
            </div>
          </div>
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Submit Community Report">
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-[0.14em] text-gray-400">Entity</label>
          <input className="input-base" value={entity} onChange={(event) => setEntity(event.target.value)} placeholder="URL / Phone / UPI / Email" />

          <label className="block text-xs uppercase tracking-[0.14em] text-gray-400">Scam Type</label>
          <select className="input-base" value={scamType} onChange={(event) => setScamType(event.target.value)}>
            <option>Phishing</option>
            <option>UPI Fraud</option>
            <option>Digital Arrest</option>
            <option>Loan App</option>
            <option>Job Scam</option>
          </select>

          <label className="block text-xs uppercase tracking-[0.14em] text-gray-400">Description</label>
          <textarea className="input-base min-h-28" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What happened and how was it detected?" />

          <button onClick={submitReport} disabled={createReport.isPending} className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-60">
            {createReport.isPending ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
