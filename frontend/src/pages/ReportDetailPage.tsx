import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PageHero } from '../components/layout/PageHero'
import { api } from '../lib/api'
import type { CommunityReport } from '../types/api'

export function ReportDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    enabled: Boolean(id),
    queryKey: ['report', id],
    queryFn: async () => {
      const { data } = await api.get<CommunityReport>(`/api/reports/${id}/`)
      return data
    },
  })

  return (
    <div>
      <PageHero title="Report Details" subtitle={`Viewing community report #${id || 'Unknown'}`} />
      <section className="page-wrap py-16">
        <div className="card">
          <h3 className="text-xl font-bold text-white">Report {id}</h3>
          {isLoading ? <p className="mt-3 text-gray-400">Loading report details…</p> : null}
          {isError ? <p className="mt-3 text-red-400">Unable to load this report right now.</p> : null}
          {data ? (
            <div className="mt-4 space-y-3 text-gray-300">
              <p className="text-sm text-blue-200 uppercase tracking-wide">{data.scamType} · {data.region}</p>
              <p className="text-lg font-semibold text-white">{data.title}</p>
              <p>{data.description}</p>
              <p className="text-sm text-gray-400">Similar reports: {data.similarCount ?? 0}</p>
            </div>
          ) : null}
          <div className="mt-6">
            <button
              type="button"
              className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
