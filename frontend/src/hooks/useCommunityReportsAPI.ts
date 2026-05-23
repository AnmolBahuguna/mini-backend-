import { useState, useEffect, useCallback } from 'react'
import { reportsApi, type Report, type CreateReportRequest } from '../api'
import { useUIStore } from '../store/uiStore'

interface UseCommunityReportsReturn {
  reports: Report[]
  loading: boolean
  error: string | null
  hasNextPage: boolean
  fetchReports: (page?: number) => Promise<void>
  submitReport: (data: CreateReportRequest) => Promise<Report>
  upvoteReport: (id: string) => Promise<void>
}

export function useCommunityReportsAPI(): UseCommunityReportsReturn {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const { addToast } = useUIStore()

  const fetchReports = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await reportsApi.getReports(page, 20)
      
      if (page === 1) {
        setReports(response.results)
      } else {
        setReports(prev => [...prev, ...response.results])
      }

      setHasNextPage(!!response.next)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reports'
      setError(message)
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const submitReport = useCallback(async (data: CreateReportRequest): Promise<Report> => {
    try {
      setError(null)
      const result = await reportsApi.createReport(data)
      
      // Add to local state immediately
      setReports(prev => [result, ...prev])
      addToast('Report submitted successfully', 'success')
      
      return result
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit report'
      setError(message)
      addToast(message, 'error')
      throw err
    }
  }, [addToast])

  const upvoteReport = useCallback(async (id: string) => {
    try {
      setError(null)
      
      // Optimistic update: increment immediately
      setReports(prev => 
        prev.map(report => 
          report.id === id 
            ? { ...report, upvotes: report.upvotes + 1 }
            : report
        )
      )

      await reportsApi.upvoteReport(id)
      addToast('Report upvoted', 'success')

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upvote report'
      setError(message)
      addToast(message, 'error')
      
      // Revert optimistic update on error
      setReports(prev => 
        prev.map(report => 
          report.id === id 
            ? { ...report, upvotes: report.upvotes - 1 }
            : report
        )
      )
      throw err
    }
  }, [addToast])

  useEffect(() => {
    fetchReports(1)
  }, [fetchReports])

  return {
    reports,
    loading,
    error,
    hasNextPage,
    fetchReports,
    submitReport,
    upvoteReport
  }
}
