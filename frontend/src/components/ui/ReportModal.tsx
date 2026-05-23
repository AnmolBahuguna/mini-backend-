import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCreateReport } from '../../hooks/useReports'
import { Modal } from './Modal'
import type { CreateReportRequest } from '../../types/api'

export type ReportPayload = {
  entity: string
  scamType: string
  description: string
  evidenceOptIn: boolean
}

type ReportModalProps = {
  open: boolean
  onClose: () => void
  presetEntity?: string
  presetType?: string
  onSubmit?: (payload: ReportPayload) => Promise<void> | void
  title?: string
  ctaLabel?: string
}

const scamTypes = ['Phishing', 'UPI Fraud', 'Digital Arrest', 'Loan App', 'Job Scam', 'Harassment', 'Malware']

type ReportFormProps = {
  presetEntity: string
  presetType: string
  ctaLabel: string
  onSubmit?: (payload: ReportPayload) => Promise<void> | void
  onClose: () => void
}

function inferEntityType(value: string): NonNullable<CreateReportRequest['entity_type']> {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return 'message'
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return 'url'
  if (/^\+?\d{7,15}$/.test(trimmed)) return 'phone'
  if (trimmed.includes('@')) return 'email'
  if (/^\w+[.-]?\w*\.[a-z]{2,}$/i.test(trimmed)) return 'domain'
  return 'message'
}

function ReportForm({ presetEntity, presetType, onSubmit, ctaLabel, onClose }: ReportFormProps) {
  const [entity, setEntity] = useState(presetEntity)
  const [scamType, setScamType] = useState(presetType)
  const [description, setDescription] = useState('')
  const [evidenceOptIn, setEvidenceOptIn] = useState(true)
  const createReport = useCreateReport()

  const isSubmitting = useMemo(() => createReport.isPending, [createReport.isPending])

  const handleSubmit = async () => {
    if (!entity.trim() || !description.trim()) {
      toast.error('Entity and description are required')
      return
    }

    try {
      if (onSubmit) {
        await onSubmit({ entity, scamType, description, evidenceOptIn })
      } else {
        await createReport.mutateAsync({
          entity,
          entity_type: inferEntityType(entity),
          scamType,
          description,
        })
      }
      toast.success('Report captured')
      onClose()
    } catch {
      toast.error('Failed to submit report')
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs uppercase tracking-[0.14em] text-gray-400">
        Entity / Handle
        <input
          className="input-base mt-1"
          value={entity}
          onChange={(event) => setEntity(event.target.value)}
          placeholder="URL / Phone / UPI / Email"
        />
      </label>

      <label className="block text-xs uppercase tracking-[0.14em] text-gray-400">
        Scam Type
        <select
          className="input-base mt-1"
          value={scamType}
          onChange={(event) => setScamType(event.target.value)}
        >
          {scamTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>

      <label className="block text-xs uppercase tracking-[0.14em] text-gray-400">
        What happened?
        <textarea
          className="input-base mt-1 min-h-28"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Timeline, platform, monetary loss (if any), evidence pointers"
        />
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-300">
        <input
          type="checkbox"
          checked={evidenceOptIn}
          onChange={(event) => setEvidenceOptIn(event.target.checked)}
        />
        Allow encrypted evidence upload later
      </label>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting...' : ctaLabel}
      </button>
    </div>
  )
}

export function ReportModal({
  open,
  onClose,
  presetEntity = '',
  presetType = 'Phishing',
  onSubmit,
  title = 'Submit Report',
  ctaLabel = 'Submit',
}: ReportModalProps) {
  const resetKey = `${presetEntity}-${presetType}-${open ? 'open' : 'closed'}`

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {open ? (
        <ReportForm
          key={resetKey}
          presetEntity={presetEntity}
          presetType={presetType}
          onSubmit={onSubmit}
          ctaLabel={ctaLabel}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  )
}
