import { UploadCloud } from 'lucide-react'
import { useMemo, useState } from 'react'

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
}

export function UploadZone({ onFilesSelected }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)

  const className = useMemo(
    () => dragging
      ? 'rounded-2xl border-2 border-dashed border-blue-400 bg-blue-500/10 p-10 text-center transition'
      : 'rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-10 text-center transition',
    [dragging],
  )

  return (
    <label
      role="button"
      aria-label="Upload New Evidence"
      className={className}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const files = Array.from(event.dataTransfer.files)
        onFilesSelected(files)
      }}
    >
      <input
        className="hidden"
        type="file"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          onFilesSelected(files)
        }}
      />
      <UploadCloud className="mx-auto mb-3 h-10 w-10 text-blue-300" />
      <p className="text-base font-semibold text-white">Upload New Evidence</p>
      <p className="mt-1 text-sm text-gray-400">Drag & drop evidence files</p>
      <p className="mt-1 text-sm text-gray-400">or click to browse from your device</p>
    </label>
  )
}
