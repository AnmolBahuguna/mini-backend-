import confetti from 'canvas-confetti'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Modal } from '../components/ui/Modal'
import { useCreateReport, useReports } from '../hooks/useReports'
import { useRealtimeReports } from '../hooks/useRealtimeFeed'
import type { CommunityReport } from '../types/api'
import type { ThreatReport } from '../types/threat'
import './CommunityPage.css'

export function CommunityPage() {
  useRealtimeReports()
  const reportsQuery = useReports()
  const createReport = useCreateReport()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [entity, setEntity] = useState('')
  const [scamType, setScamType] = useState('Phishing')
  const [description, setDescription] = useState('')
  const [filterType, setFilterType] = useState('All Types')
  const [filterState, setFilterState] = useState('All States')

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

  const showSkeletons = reportsQuery.isLoading && filteredReports.length === 0

  const submitReport = useCallback(async () => {
    if (!entity.trim() || !description.trim()) {
      toast.error('Entity and description are required')
      return
    }

    try {
      await createReport.mutateAsync({ entity, scamType, description })
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
              <p className="comm-map-label">Tactical Heatmap</p>
              <p className="comm-map-region">Region: Subcontinent Asia / India</p>
            </div>
            <span className="comm-live-pill">● Live feed</span>
          </div>
          <div className="comm-map-surface">
            <div className="comm-signal critical" style={{ left: '46%', top: '38%' }}>
              <span className="comm-signal-dot" />
              <span className="comm-signal-meta">High-risk: NCR · 92%</span>
            </div>
            <div className="comm-signal verified" style={{ left: '60%', top: '62%' }}>
              <span className="comm-signal-dot" />
              <span className="comm-signal-meta">Verified: Bengaluru</span>
            </div>
            <div className="comm-signal sentinel" style={{ left: '35%', top: '54%' }}>
              <span className="comm-signal-dot" />
              <span className="comm-signal-meta">Sentinel: Mumbai nodes</span>
            </div>
          </div>
          <div className="comm-legend">
            <span className="legend-item"><span className="legend-dot red" />Critical Threat</span>
            <span className="legend-item"><span className="legend-dot amber" />Initiated Action</span>
            <span className="legend-item"><span className="legend-dot cyan" />Active Sentinel</span>
          </div>
        </div>

        <div className="comm-feed-card">
          <div className="comm-feed-head">
            <div>
              <p className="comm-feed-kicker">Community Intel</p>
              <h3 className="comm-feed-title">Community Intelligence Feed</h3>
            </div>
            <div className="comm-feed-filter">Threats · Signals</div>
          </div>

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
              <option>Delhi NCR</option>
              <option>Mumbai</option>
              <option>Bengaluru</option>
              <option>Hyderabad</option>
              <option>Jaipur</option>
            </select>
          </div>

          {reportsQuery.isError ? (
            <div className="comm-warning">Failed to load feed. Showing cached entries.</div>
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
            <Link to="/community/report" className="comm-secondary">Report a Threat</Link>
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
