import { useState } from 'react'
import { Link } from 'react-router-dom'

type ThreatKey = 'sextortion' | 'arrest' | 'crypto' | 'loan' | 'job' | 'upi'

const threatCards: Array<{ key: ThreatKey; icon: string; title: string; description: string; color: string }> = [
  { key: 'sextortion', icon: '🔒', title: 'Sextortion & Blackmail', description: 'Private support for intimate image abuse and digital exploitation.', color: 'text-red-300' },
  { key: 'arrest', icon: '👮', title: 'Digital Arrest Scams', description: 'Fake official video calls demanding urgent money transfers.', color: 'text-amber-300' },
  { key: 'crypto', icon: '₿', title: 'Cryptocurrency Fraud', description: 'Investment scams and fake high-return trading platforms.', color: 'text-yellow-300' },
  { key: 'loan', icon: '📱', title: 'Loan App Fraud', description: 'Predatory apps with hidden rates and harassment tactics.', color: 'text-pink-300' },
  { key: 'job', icon: '💼', title: 'Job & Employment Scams', description: 'Advance-fee recruitment fraud and fake offer letters.', color: 'text-blue-300' },
  { key: 'upi', icon: '💳', title: 'UPI & Banking Fraud', description: 'OTP phishing, fake links, and KYC impersonation scams.', color: 'text-emerald-300' },
]

const threatDetails: Record<ThreatKey, { title: string; identificationTips: string[]; preventionSteps: string[]; warning: string }> = {
  sextortion: {
    title: 'Sextortion & Blackmail — De-escalation Protocol',
    identificationTips: ['Urgent threats using private images', 'Demands for immediate payment', 'Multiple anonymous handle switches'],
    preventionSteps: ['Stop all contact', 'Preserve all evidence', 'Report immediately', 'Block all handles', 'Seek trusted support'],
    warning: 'Paying ransom almost always escalates threats. Preserve evidence and report instead.',
  },
  arrest: {
    title: 'Digital Arrest Scams — De-escalation Protocol',
    identificationTips: ['Caller claims law enforcement pressure', 'Video call with fake badge', 'Demands money transfer to close case'],
    preventionSteps: ['Breathe, do not react', 'Assess the call', 'Verify independently', 'Report to 1930', 'Block the number'],
    warning: 'Digital Arrest is not a real legal concept. Police never demand money over video calls.',
  },
  crypto: {
    title: 'Cryptocurrency Fraud — Protection Protocol',
    identificationTips: ['Guaranteed return promise', 'Unverified exchange links', 'Pushy time-bound deal language'],
    preventionSteps: ['Stop transfers', 'Capture proof', 'Alert exchange', 'Report cybercrime', 'Warn peers'],
    warning: 'Guaranteed returns in crypto are a scam signal. Verify all platforms independently.',
  },
  loan: {
    title: 'Loan App Fraud — Recovery Protocol',
    identificationTips: ['Excessive permissions requests', 'Abusive collection threats', 'Opaque charges and terms'],
    preventionSteps: ['Uninstall app', 'Save proof', 'Report to RBI', 'File complaint', 'Block extortion calls'],
    warning: 'Illegal loan apps use intimidation. Use official channels and do not share contacts.',
  },
  job: {
    title: 'Job Scam — Alert Protocol',
    identificationTips: ['Offer without interview', 'Deposit/security fee required', 'Fake or lookalike company domain'],
    preventionSteps: ['Stop payment', 'Save offer details', 'Verify domain', 'Report portal', 'Warn others'],
    warning: 'Legitimate employers do not collect joining fees or security deposits.',
  },
  upi: {
    title: 'UPI & Banking Fraud — Recovery Protocol',
    identificationTips: ['Payment collect request pretending refund', 'OTP/PIN request over call', 'Fake KYC urgency'],
    preventionSteps: ['Call bank', 'Freeze access', 'Report at 1930', 'Document timeline', 'File FIR'],
    warning: 'Banks never ask for UPI PIN, OTP, or CVV through calls or messages.',
  },
}

export function AdultSafetyPage() {
  const [activeThreat, setActiveThreat] = useState<ThreatKey>('arrest')
  const detail = threatDetails[activeThreat]

  return (
    <div>
      <section className="bg-[linear-gradient(160deg,#0a1628_0%,#0f1f3d_40%,#0A0F1E_100%)] py-14 text-center">
        <div className="page-wrap">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Threat Education</p>
          <h1 className="mt-2 text-4xl font-black text-white md:text-6xl">Adult Digital Safety</h1>
          <p className="mt-3 text-gray-400">Select a category to learn how to identify, de-escalate, and report safely.</p>
        </div>
      </section>

      <section className="page-wrap py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {threatCards.map((card) => (
            <article
              key={card.key}
              onClick={() => setActiveThreat(card.key)}
              className={activeThreat === card.key ? 'cursor-pointer rounded-2xl border border-blue-500 bg-blue-500/10 p-5 shadow-glow' : 'cursor-pointer rounded-2xl border border-gray-700 bg-gray-800/60 p-5'}
            >
              <p className="text-3xl">{card.icon}</p>
              <h3 className={`mt-3 text-lg font-bold ${card.color}`}>{card.title}</h3>
              <p className="mt-2 text-sm text-gray-300">{card.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-blue-500/30 bg-gray-800/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-black text-white">{detail.title}</h3>
            <Link to="/community/report" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white">📋 Report This Scam</Link>
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">5-Step De-escalation</p>
          <div className="mt-3 rounded-xl border border-gray-700 bg-gray-900/70 p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-blue-300">Identification Tips</p>
            <ul className="space-y-2 text-sm text-gray-200">
              {detail.identificationTips.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-5">
            {detail.preventionSteps.map((step, index) => (
              <div key={step} className="rounded-lg border border-gray-700 bg-gray-900/70 p-3 text-sm text-gray-200">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">{index + 1}</span>
                {step}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Reality Check</p>
            <p className="mt-2 text-sm font-semibold text-white">{detail.warning}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
