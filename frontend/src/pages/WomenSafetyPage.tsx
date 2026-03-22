import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { PanicButton } from '../components/ui/PanicButton'
import type { PanicState } from '../types/threat'

const helplines = [['NCW Women Helpline', '7827-170-170'], ['Cyber Crime Helpline', '1930'], ['Police Emergency', '112'], ['iCall', '9152987821']]

export function WomenSafetyPage() {
  const [tab, setTab] = useState<1 | 2 | 3>(1)
  const [panicState, setPanicState] = useState<PanicState>('idle')

  const triggerPanic = () => {
    if (panicState !== 'idle') return
    setPanicState('requesting')
    setTimeout(() => {
      setPanicState('sending')
      setTimeout(() => {
        setPanicState('sent')
        toast.success('Emergency alert sent to your configured contacts')
        setTimeout(() => setPanicState('idle'), 3000)
      }, 1000)
    }, 900)
  }

  return (
    <div>
      <section className="bg-[linear-gradient(160deg,#1e1b4b_0%,#2d1d69_30%,#0A0F1E_80%)] py-14 text-center">
        <div className="page-wrap">
          <h1 className="text-4xl font-black text-white md:text-6xl">💜 Women Safety Hub</h1>
          <p className="mt-3 text-violet-200">Comprehensive protection, legal resources, and emergency tools with full privacy control.</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button onClick={() => setTab(1)} className={tab === 1 ? 'rounded-full border border-violet-300 bg-violet-500/20 px-4 py-2 text-xs font-semibold text-white' : 'rounded-full border border-violet-500/40 px-4 py-2 text-xs font-semibold text-violet-200'}>Layer 1: Private Help</button>
            <button onClick={() => setTab(2)} className={tab === 2 ? 'rounded-full border border-violet-300 bg-violet-500/20 px-4 py-2 text-xs font-semibold text-white' : 'rounded-full border border-violet-500/40 px-4 py-2 text-xs font-semibold text-violet-200'}>Layer 2: Support Network</button>
            <button onClick={() => setTab(3)} className={tab === 3 ? 'rounded-full border border-violet-300 bg-violet-500/20 px-4 py-2 text-xs font-semibold text-white' : 'rounded-full border border-violet-500/40 px-4 py-2 text-xs font-semibold text-violet-200'}>Layer 3: Legal Action</button>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-violet-200/70">Emergency SOS</p>
            <PanicButton state={panicState} onTrigger={triggerPanic} />
            <p className="mt-3 text-xs text-violet-200">{panicState === 'idle' ? 'Location ready · 3 contacts configured' : panicState === 'requesting' ? 'Requesting secure channel...' : panicState === 'sending' ? 'Sending GPS alert...' : 'Help is on the way'}</p>
          </div>
        </div>
      </section>

      <section className="page-wrap py-10">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-violet-500/30 bg-gray-800/60 p-5">
            <h3 className="text-lg font-bold text-white">Verified NGOs</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li>• Sakhi One Stop Centre</li>
              <li>• Jagori Safe City Network</li>
              <li>• Red Dot Foundation</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-violet-500/30 bg-gray-800/60 p-5">
            <h3 className="text-lg font-bold text-white">Legal Resources</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li>• FIR filing guide for cyber abuse</li>
              <li>• IT Act and IPC legal quick notes</li>
              <li>• Court admissibility checklist</li>
            </ul>
          </article>
        </div>

        {tab === 1 ? (
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-violet-500/30 bg-gray-800/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Layer 1 — Zero Disclosure</p>
              <h3 className="mt-2 text-lg font-bold text-white">Private Help</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li>• Encrypted Evidence Vault (AES-256)</li>
                <li>• AI Safety Planner</li>
                <li>• Anonymous chatbot assistance</li>
                <li>• Panic button + GPS alert</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-pink-500/30 bg-gray-800/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">Layer 2 — Controlled Sharing</p>
              <h3 className="mt-2 text-lg font-bold text-white">Support Network</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li>• Verified NGO directory</li>
                <li>• Anonymous peer support</li>
                <li>• NCW quick-dial</li>
                <li>• Legal awareness resources</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-teal-500/30 bg-gray-800/60 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Layer 3 — User-Controlled Escalation</p>
              <h3 className="mt-2 text-lg font-bold text-white">Legal Action</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                <li>• Cyber cell integration</li>
                <li>• Women commission links</li>
                <li>• Verified lawyer network</li>
                <li>• Case progress tracker</li>
              </ul>
            </article>
          </div>
        ) : null}

        {tab === 2 ? (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6">
            <h3 className="text-lg font-bold text-white">Support Network</h3>
            <p className="mt-2 text-sm text-gray-300">Connect to trusted NGOs, helplines, and community groups at your own pace.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/community" className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white">Open Community Feed</Link>
              <Link to="/community/report" className="rounded-lg border border-violet-400/40 px-4 py-2 text-xs font-semibold text-violet-300">Submit Anonymous Report</Link>
            </div>
          </div>
        ) : null}

        {tab === 3 ? (
          <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-6">
            <h3 className="text-lg font-bold text-white">Legal Action</h3>
            <p className="mt-2 text-sm text-gray-300">Prepare your evidence and escalate safely through verified channels when ready.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/evidence" className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white">Open Evidence Vault</Link>
              <button onClick={() => toast.success('Downloaded legal checklist')} className="rounded-lg border border-teal-400/40 px-4 py-2 text-xs font-semibold text-teal-300">Download Checklist</button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {helplines.map(([name, number]) => (
            <div key={name} className="rounded-xl border border-violet-500/40 bg-violet-950/20 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-violet-200">{name}</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">{number}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-violet-500/30 bg-gray-900/60 p-5">
          <h3 className="text-lg font-bold text-white">Safety Chatbot (Preview)</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="max-w-md rounded-xl bg-gray-800 px-3 py-2 text-gray-200">I am being blackmailed online. What should I do first?</div>
            <div className="max-w-md rounded-xl bg-violet-600/30 px-3 py-2 text-violet-100">You are not at fault. Preserve evidence, block the sender, and report at 1930 immediately.</div>
          </div>
        </div>
      </section>
    </div>
  )
}
