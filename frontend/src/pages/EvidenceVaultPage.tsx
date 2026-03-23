import toast from 'react-hot-toast'
import { useState } from 'react'
import { UploadZone } from '../components/ui/UploadZone'
import { api } from '../lib/api'

type EvidenceFile = {
  id: string
  name: string
  uploadedAt: string
  size: string
}

const initialFiles: EvidenceFile[] = [
  { id: '1', name: 'Signal_Intercept_99.enc', uploadedAt: '2026-03-20', size: '42.5 MB' },
  { id: '2', name: 'Auth_Log_Fragment.txt', uploadedAt: '2026-03-19', size: '1.2 MB' },
]

export function EvidenceVaultPage() {
  const [files, setFiles] = useState<EvidenceFile[]>(initialFiles)

  const handleFilesSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return
    const mapped = selectedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    }))
    setFiles((prev) => [...mapped, ...prev])
    toast.success(`${mapped.length} file(s) added to vault queue`)

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append('files', file))
      await api.post('/api/evidence/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Files uploaded to vault')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div className="bg-[#0e0e0f]">
      <section className="page-wrap hud-grid py-14">
        <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl text-left">
            <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-[#5cbfff]">Encrypted Repository</p>
            <h1 className="font-headline mt-2 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">Evidence Vault</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#adaaab]">Secure management of forensic data and threat indicators. Multi-layer encryption is active for all identified intelligence assets.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-md border border-[#484849]/30 bg-[#1a191b] px-5 py-3 font-headline text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#201f21]">
              Export for Legal
            </button>
            <div className="rounded-md bg-gradient-to-br from-[#5cbfff] to-[#00a7f0] px-6 py-3 font-headline text-xs font-bold uppercase tracking-[0.14em] text-[#003854] shadow-[0_0_20px_rgba(92,191,255,0.3)]">Protected Vault Access</div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="glass rounded-md border border-[#484849]/25 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#adaaab]">Vault Status</p>
            <p className="font-headline mt-2 text-xl font-bold text-[#00edb4]">SECURE</p>
          </div>
          <div className="glass rounded-md border border-[#484849]/25 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#adaaab]">Encryption Level</p>
            <p className="font-headline mt-2 text-xl font-bold text-white">AES-4096 Tactical</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#262627]">
              <div className="h-full w-[94%] bg-[#5cbfff]" />
            </div>
          </div>
          <div className="glass rounded-md border border-[#484849]/25 p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#adaaab]">Last Backup</p>
            <p className="font-headline mt-2 text-xl font-bold text-white">04m 12s AGO</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#adaaab]">NODE: SYNC-SENTINEL-09</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <UploadZone onFilesSelected={handleFilesSelected} />

          <div className="glass rounded-2xl border border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">File List</h2>
              <span className="text-xs text-gray-400">{files.length} items</span>
            </div>
            <div className="space-y-3">
              {files.map((file) => (
                <article key={file.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="font-mono text-sm text-blue-300">{file.name}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{file.uploadedAt}</span>
                    <span>{file.size}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 rounded-md border border-[#484849]/25 bg-[#1a191b]/70 p-4">
          <h3 className="font-headline text-sm font-bold uppercase tracking-[0.16em] text-[#5cbfff]">Zero-Knowledge Guarantee</h3>
          <p className="mt-2 text-sm text-[#adaaab]">All files are encrypted before transit. This screen is UI-only encryption notice and ready for backend storage wiring.</p>
        </div>
      </section>
    </div>
  )
}
