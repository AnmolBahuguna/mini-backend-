import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PageHero } from '../components/layout/PageHero'
import PageWrapper from '../components/layout/PageWrapper'
import { GlassCard } from '../components/ui/GlassCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { ErrorState } from '../components/ui/ErrorState'
import { MapPin, Calendar, User, Tag, Eye, ThumbsUp } from 'lucide-react'

interface ThreatReport {
  id: string
  title: string
  description: string
  entity: string
  entity_type: string
  category: string
  scam_type?: string
  platform?: string
  suspect_info?: Record<string, unknown>
  status: string
  is_verified: boolean
  upvotes: number
  similar_count: number
  location_city?: string
  location_state?: string
  district?: string
  is_anonymous: boolean
  ai_tags?: string[]
  created_at: string
  updated_at: string
  user_id?: string
  user_profiles?: {
    full_name: string
    avatar_url?: string
  }
  evidence_vault?: Array<{
    id: string
    file_name: string
    file_type: string
    thumbnail_url?: string
  }>
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<ThreatReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upvoted, setUpvoted] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      if (!supabase || !id) {
        setError('Supabase not initialized or report ID missing')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
          .from('threat_reports')
          .select(
            `
            *,
            user_profiles:user_id (full_name, avatar_url),
            evidence_vault (id, file_name, file_type, thumbnail_url)
          `
          )
          .eq('id', id)
          .single()

        if (err) throw err
        setReport(data as ThreatReport)

        // Increment view count
        await supabase
          .from('threat_reports')
          .update({ similar_count: (data?.similar_count || 0) + 1 })
          .eq('id', id)
      } catch (err: unknown) {
        console.error('Error fetching report:', err)
        setError(err instanceof Error ? err.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [id])

  const handleUpvote = async () => {
    if (!supabase || !report) return

    try {
      const newUpvotes = report.upvotes + (upvoted ? -1 : 1)
      await supabase
        .from('threat_reports')
        .update({ upvotes: newUpvotes })
        .eq('id', report.id)

      setReport({ ...report, upvotes: newUpvotes })
      setUpvoted(!upvoted)
    } catch (err) {
      console.error('Error updating upvote:', err)
    }
  }

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <PageWrapper>
        <ErrorState
          title="Report Not Found"
          description={error}
          retry={() => navigate(-1)}
        />
      </PageWrapper>
    )
  }

  if (!report) {
    return (
      <PageWrapper>
        <ErrorState
          title="Report Not Found"
          description="The report you're looking for doesn't exist."
          retry={() => navigate('/community')}
        />
      </PageWrapper>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      online_fraud: 'bg-red-100 text-red-800',
      cyber_stalking: 'bg-purple-100 text-purple-800',
      phishing: 'bg-orange-100 text-orange-800',
      identity_theft: 'bg-pink-100 text-pink-800',
      harassment: 'bg-red-100 text-red-800',
      deepfake: 'bg-blue-100 text-blue-800',
      sextortion: 'bg-red-100 text-red-800',
      upi_fraud: 'bg-green-100 text-green-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <PageWrapper>
      <PageHero
        title={report.title}
        subtitle={`Report ID: ${report.id}`}
      />

      <div className="grid lg:grid-cols-3 gap-8 mt-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Badge */}
          <div className="flex flex-wrap gap-3">
            {report.is_verified && (
              <Badge variant="success" className="flex items-center gap-1">
                ✓ Verified
              </Badge>
            )}
              <Badge
                className={getCategoryColor(report.category)}>
                {report.category.replace(/_/g, ' ')}
              </Badge>
              {report.scam_type && (
                <Badge>
                  {report.scam_type}
                </Badge>
              )}
          </div>

          {/* Main Report Card */}
          <GlassCard className="p-8">
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-semibold text-white mb-4">Report Details</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{report.description}</p>

              {/* Entity Information */}
              {report.entity && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400">Entity Under Report</p>
                  <p className="text-lg font-mono text-white break-all mt-2">{report.entity}</p>
                  <p className="text-xs text-gray-400 mt-1">Type: {report.entity_type}</p>
                </div>
              )}

              {/* Suspect Information */}
              {report.suspect_info && Object.keys(report.suspect_info).length > 0 && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400 mb-3">Suspect Information</p>
                  <div className="space-y-2">
                    {Object.entries(report.suspect_info).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-400 capitalize">{key}: </span>
                        <span className="text-white font-mono break-all">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {report.ai_tags && report.ai_tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {report.ai_tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      <Tag size={14} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Evidence */}
          {report.evidence_vault && report.evidence_vault.length > 0 && (
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Evidence ({report.evidence_vault.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.evidence_vault.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition">
                    {evidence.thumbnail_url && (
                      <img
                        src={evidence.thumbnail_url}
                        alt={evidence.file_name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <p className="text-sm text-white font-mono truncate">{evidence.file_name}</p>
                    <p className="text-xs text-gray-400 mt-1">{evidence.file_type}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Report Information</h3>
            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Reported</p>
                  <p className="text-sm text-white">
                    {new Date(report.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Location */}
              {(report.location_city || report.location_state) && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm text-white">
                      {report.location_city}, {report.location_state}
                    </p>
                  </div>
                </div>
              )}

              {/* Reporter */}
              {!report.is_anonymous && report.user_profiles && (
                <div className="flex items-start gap-3">
                  <User size={18} className="text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Reported by</p>
                    <p className="text-sm text-white">{report.user_profiles.full_name}</p>
                  </div>
                </div>
              )}

              {report.is_anonymous && (
                <p className="text-xs text-gray-400">📋 Anonymous Report</p>
              )}
            </div>
          </GlassCard>

          {/* Engagement Card */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Community Response</h3>
            <div className="space-y-3">
              <button
                onClick={handleUpvote}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                  upvoted
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}>
                <ThumbsUp size={18} />
                {report.upvotes} Upvote{report.upvotes !== 1 ? 's' : ''}
              </button>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 text-gray-300">
                  <Eye size={16} />
                  Similar reports
                </div>
                <span className="text-white font-semibold">{report.similar_count}</span>
              </div>
            </div>
          </GlassCard>

          {/* Actions */}
          <Button
            variant="secondary"
            onClick={() => navigate('/community')}
            className="w-full">
            Back to Community
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
