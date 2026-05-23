import { useState, useEffect, useCallback } from 'react'
import { evidenceApi, type EvidenceFile, type UploadEvidenceRequest } from '../api'
import { useUIStore } from '../store/uiStore'

interface UseEvidenceVaultReturn {
  evidence: EvidenceFile[]
  loading: boolean
  error: string | null
  uploadProgress: number
  fetchEvidence: () => Promise<void>
  uploadFile: (file: File, description?: string) => Promise<EvidenceFile>
  deleteEvidence: (id: string) => Promise<void>
}

export function useEvidenceVaultAPI(): UseEvidenceVaultReturn {
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { addToast } = useUIStore()

  const fetchEvidence = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await evidenceApi.getEvidence()
      setEvidence(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch evidence'
      setError(message)
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const uploadFile = useCallback(async (file: File, description?: string): Promise<EvidenceFile> => {
    try {
      setError(null)
      setUploadProgress(0)

      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, PDF, MP4, and TXT files are allowed.')
      }

      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB')
      }

      setUploadProgress(25)

      const uploadData: UploadEvidenceRequest = { file, description }
      
      // Simulate upload progress (in real implementation, this would come from axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await evidenceApi.uploadEvidence(uploadData)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Add to local state immediately
      setEvidence(prev => [result, ...prev])
      addToast('File uploaded successfully', 'success')
      
      setTimeout(() => setUploadProgress(0), 1000)
      
      return result
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'File upload failed'
      setError(message)
      setUploadProgress(0)
      addToast(message, 'error')
      throw err
    }
  }, [addToast])

  const deleteEvidence = useCallback(async (id: string) => {
    try {
      setError(null)
      
      // Optimistic UI: remove immediately
      setEvidence(prev => prev.filter(item => item.id !== id))
      
      await evidenceApi.deleteEvidence(id)
      addToast('Evidence deleted successfully', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete evidence'
      setError(message)
      addToast(message, 'error')
      // Restore on error
      setEvidence(evidence)
      throw err
    }
  }, [evidence, addToast])

  useEffect(() => {
    fetchEvidence()
  }, [fetchEvidence])

  return {
    evidence,
    loading,
    error,
    uploadProgress,
    fetchEvidence,
    uploadFile,
    deleteEvidence
  }
}
