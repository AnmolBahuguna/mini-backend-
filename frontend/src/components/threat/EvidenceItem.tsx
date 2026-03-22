import { FileText, ImageIcon, Music, Share2, Video } from 'lucide-react'

type Props = {
  fileName: string
  hash: string
  uploadedAt: string
  shared?: boolean
}

function iconFor(name: string) {
  const lowered = name.toLowerCase()
  if (lowered.endsWith('.mp3') || lowered.endsWith('.wav')) return <Music className="h-5 w-5 text-amber-400" />
  if (lowered.endsWith('.mp4') || lowered.endsWith('.mov')) return <Video className="h-5 w-5 text-purple-400" />
  if (lowered.endsWith('.pdf') || lowered.endsWith('.doc') || lowered.endsWith('.docx')) return <FileText className="h-5 w-5 text-blue-400" />
  return <ImageIcon className="h-5 w-5 text-emerald-400" />
}

export function EvidenceItem({ fileName, hash, uploadedAt, shared }: Props) {
  return (
    <article className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {iconFor(fileName)}
          <div>
            <h3 className="max-w-xs truncate text-sm font-medium text-white">{fileName}</h3>
            <p className="mt-1 font-mono text-xs text-gray-400">{hash.slice(0, 12)}...</p>
            <p className="mt-1 text-xs text-gray-500">Uploaded {uploadedAt}</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${shared ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
          {shared ? <span className="inline-flex items-center gap-1"><Share2 className="h-3 w-3" /> Shared</span> : 'Private'}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Download</button>
        <button className="rounded-lg border border-gray-600 px-3 py-2 text-xs font-semibold text-gray-200">Share</button>
        <button className="rounded-lg border border-red-600 px-3 py-2 text-xs font-semibold text-red-300">Delete</button>
      </div>
    </article>
  )
}
