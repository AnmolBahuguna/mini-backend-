import confetti from 'canvas-confetti'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Modal } from '../components/ui/Modal'
import { ThreatCard } from '../components/threat/ThreatCard'
import { useCreateReport, useReports } from '../hooks/useReports'
import { useRealtimeReports } from '../hooks/useRealtimeFeed'

export function CommunityPage() {
  useRealtimeReports()
  const reportsQuery = useReports()
  const createReport = useCreateReport()

  const [open, setOpen] = useState(false)
  const [entity, setEntity] = useState('')
  const [scamType, setScamType] = useState('Phishing')
  const [description, setDescription] = useState('')

  const totals = useMemo(() => ({
    activeReports: reportsQuery.data?.length ?? 0,
    accuracy: 98.2,
    contributors: 150000,
    prevented: (reportsQuery.data?.length ?? 0) * 11,
  }), [reportsQuery.data?.length])

  const submitReport = async () => {
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
  }

  return (
    <div>
      <section className="border-b border-gray-700 bg-gray-800/60 py-5">
        <div className="page-wrap grid gap-4 text-center sm:grid-cols-2 xl:grid-cols-4">
          <div><p className="text-2xl font-black text-blue-300">{totals.activeReports.toLocaleString()}</p><p className="text-xs text-gray-400">Active Reports</p></div>
          <div><p className="text-2xl font-black text-emerald-300">{totals.accuracy}%</p><p className="text-xs text-gray-400">Accuracy Rate</p></div>
          <div><p className="text-2xl font-black text-violet-300">{Math.round(totals.contributors / 1000)}K</p><p className="text-xs text-gray-400">Contributors</p></div>
          <div><p className="text-2xl font-black text-cyan-300">{totals.prevented.toLocaleString()}</p><p className="text-xs text-gray-400">Threats Prevented</p></div>
        </div>
      </section>

      <section className="page-wrap py-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-black text-white">Community Intelligence Feed</h2>
              <div className="flex gap-2">
                <select className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300"><option>All Types</option></select>
                <select className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300"><option>All States</option></select>
              </div>
            </div>

            <div className="space-y-3">
              {reportsQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-28 animate-pulse rounded-2xl bg-white/5" />)
              ) : reportsQuery.isError ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">Failed to load feed.</div>
              ) : reportsQuery.data?.map((report) => (
                <Link key={report.id} to={`/reports/${report.id}`}>
                  <ThreatCard
                    report={{
                      id: report.id,
                      title: report.title,
                      region: report.region,
                      timeAgo: report.timeAgo,
                      description: report.description,
                      similarCount: report.similarCount,
                      level: report.severity,
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>

          <aside>
            <div className="mb-4 rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
              <button onClick={() => setOpen(true)} className="mb-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white">📋 Report a Threat</button>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">How It Works</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>1. Submit anonymously</li>
                <li>2. AI enriches with DRS</li>
                <li>3. Community verifies signal</li>
                <li>4. Region gets instant alerts</li>
                <li>5. One report protects thousands</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <h3 className="text-sm font-bold text-emerald-300">🛡 Privacy Guarantee</h3>
              <p className="mt-2 text-sm text-gray-300">Reports are anonymous by default. Evidence is client-side encrypted with zero-knowledge storage approach.</p>
            </div>
          </aside>
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
