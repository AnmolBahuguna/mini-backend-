import { useEffect, useRef, useState } from 'react'

type Helpline = { label: string; num: string }
type Step = { icon: string; title: string; body: string }
type ScamCard = {
  id: string
  icon: string
  title: string
  short: string
  accent: string
  accentBg: string
  tag: string
  reports: string
  trend: string
  flags: string[]
  steps: Step[]
  reality: string
  helpline: Helpline
  cta: string
}

const SCAM_CARDS: ScamCard[] = [
  {
    id: 'sextortion',
    icon: '🔒',
    title: 'Sextortion & Blackmail',
    short: 'Private support for intimate image abuse and blackmail situations',
    accent: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    tag: 'HIGH RISK',
    reports: '4,821',
    trend: '+34%',
    flags: [
      'Stranger initiates video call and becomes intimate quickly',
      'Request to switch to private messaging apps',
      "Screenshots taken during 'private' video sessions",
      'Threat to share content with family/employer unless paid',
      'Demands escalate even after initial payment',
      'Uses fake profile with stolen attractive photos',
    ],
    steps: [
      { icon: '🧘', title: 'Breathe — Do NOT Pay', body: 'Paying once guarantees more demands. Scammers target people who pay. Stop all contact immediately.' },
      { icon: '📸', title: 'Screenshot Everything', body: "Capture the scammer's profile, messages, and payment demands. This is your evidence for police." },
      { icon: '🚫', title: 'Block on All Platforms', body: 'Block their number, email, and all social media accounts simultaneously. Do not explain — just block.' },
      { icon: '🔒', title: 'Lock Down Your Privacy', body: 'Set all social profiles to private. Remove profile photos temporarily. Review friend/follower lists.' },
      { icon: '📢', title: 'Report to Cyber Crime', body: 'File at cybercrime.gov.in or call 1930. Also report the profile to the platform — Meta/Instagram act fast on these.' },
    ],
    reality: 'Scammers almost never follow through on threats when ignored — they move to easier targets. Your dignity is worth more than their demand.',
    helpline: { label: 'Cyber Crime Helpline', num: '1930' },
    cta: 'Report Anonymously',
  },
  {
    id: 'digital-arrest',
    icon: '🚔',
    title: 'Digital Arrest Scams',
    short: "Fake police/government official video calls demanding money to 'close cases'",
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    tag: 'CRITICAL',
    reports: '12,447',
    trend: '+847%',
    flags: [
      "Unexpected call/video call from 'CBI', 'ED', 'Narcotics', or 'Customs'",
      'Shows fake badge, ID card or official-looking background',
      'Claims your Aadhaar/phone is linked to drug/money laundering',
      "Orders you to 'stay on call' and not tell anyone — isolation tactic",
      "Demands immediate transfer to 'safe account' to prove innocence",
      "Uses fake arrest warrants sent as screenshots over WhatsApp",
    ],
    steps: [
      { icon: '📵', title: 'Hang Up Immediately', body: 'No Indian government agency conducts arrests, investigations or takes payments over a video call. Ever.' },
      { icon: '👨‍👩‍👧', title: 'Tell a Trusted Person', body: 'The scammer wants isolation. Immediately tell a family member or friend. Their panic thrives on your secrecy.' },
      { icon: '✅', title: 'Verify Independently', body: "Call the agency's official number from their website. Do not use any number the caller provides." },
      { icon: '🏦', title: 'Alert Your Bank', body: 'If you transferred money, call your bank immediately to freeze/reverse the transaction. Act within 30 minutes.' },
      { icon: '📢', title: 'Report to Cyber Cell', body: 'Call 1930, visit cybercrime.gov.in or go to your nearest police station with all call logs and screenshots.' },
    ],
    reality: 'The Ministry of Home Affairs has confirmed: there is NO such thing as “digital arrest” in Indian law. This is 100% fraud — always.',
    helpline: { label: 'MHA Cyber Division', num: '1930' },
    cta: 'Report This Scam',
  },
  {
    id: 'crypto',
    icon: '₿',
    title: 'Cryptocurrency Fraud',
    short: 'Fake investment platforms and trading scams showing artificial profits',
    accent: '#eab308',
    accentBg: 'rgba(234,179,8,0.08)',
    tag: 'HIGH RISK',
    reports: '6,203',
    trend: '+221%',
    flags: [
      'Telegram/WhatsApp group promising guaranteed 30-50% daily returns',
      "Romance scam that gradually introduces 'investment opportunity'",
      'Fake trading platform showing large profits you cannot withdraw',
      "Request for 'withdrawal fee', 'tax payment' or 'verification deposit'",
      'Celebrity endorsement ads on social media (almost always deepfakes)',
      "Platform URL is slightly different from the real exchange's URL",
    ],
    steps: [
      { icon: '⛔', title: 'Stop Depositing Money', body: 'The “profits” you see on screen are fake numbers. No real withdrawal is possible. Every rupee you add is lost.' },
      { icon: '📱', title: 'Capture All Evidence', body: 'Screenshot the platform, wallet addresses, transaction IDs, and all communications with the “broker”.' },
      { icon: '🏦', title: 'Contact Your Bank Now', body: 'If bank transfers were made, call your bank immediately. Some transactions can be flagged or partially recovered.' },
      { icon: '🔍', title: 'Verify Platform Legitimacy', body: 'Check if the exchange is registered with SEBI. Search “platform name + scam” on Google before investing anywhere.' },
      { icon: '📢', title: 'File a Detailed Report', body: 'Report at cybercrime.gov.in with all transaction details. Include wallet addresses — these help trace funds.' },
    ],
    reality: 'No legitimate investment guarantees returns. If someone “guarantees” profit, it is guaranteed fraud. Real crypto gains take years, not days.',
    helpline: { label: 'SEBI Investor Helpline', num: '1800-266-7575' },
    cta: 'Report Crypto Fraud',
  },
  {
    id: 'loan',
    icon: '📱',
    title: 'Loan App Fraud',
    short: 'Predatory instant loan apps with hidden fees, data theft and harassment',
    accent: '#ec4899',
    accentBg: 'rgba(236,72,153,0.08)',
    tag: 'SEVERE',
    reports: '9,104',
    trend: '+156%',
    flags: [
      'App requests access to all contacts, photos and messages during install',
      'No RBI registration number or NBFC license shown in app',
      'Loan approved within seconds with zero verification',
      'Processing fees deducted upfront before disbursement',
      'Interest rate 200-600% APR hidden in tiny fine print',
      'Harassment calls to your contacts if repayment is delayed',
    ],
    steps: [
      { icon: '🗑️', title: 'Uninstall Immediately', body: 'Remove the app right now. Go to Settings → Apps → find it → Uninstall. This stops further data collection.' },
      { icon: '🔒', title: 'Revoke App Permissions', body: 'Before uninstalling, revoke all permissions (contacts, storage, camera). Check Settings → Privacy → Permissions.' },
      { icon: '👥', title: 'Warn Your Contacts', body: 'Alert family and friends that they may receive fake messages about you. Tell them to ignore and block the number.' },
      { icon: '🏦', title: 'Check Bank Statements', body: 'Review all recent transactions. These apps sometimes make unauthorized micro-debits to “test” your account access.' },
      { icon: '📢', title: 'Report to RBI & Police', body: 'File at cybercrime.gov.in AND email sachet@rbi.org.in with the app name, store link, and all evidence.' },
    ],
    reality: 'Legitimate NBFCs never threaten to send morphed photos to your contacts. This is criminal extortion — you are the victim, not the criminal.',
    helpline: { label: 'RBI Ombudsman', num: '14448' },
    cta: 'Report Loan App',
  },
  {
    id: 'job',
    icon: '💼',
    title: 'Job & Employment Scams',
    short: 'Fake recruitment portals, work-from-home fraud and advance fee scams',
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.08)',
    tag: 'HIGH RISK',
    reports: '7,832',
    trend: '+89%',
    flags: [
      'Job offer arrives without you applying — too good to be true salary',
      'Interview done only on WhatsApp or Telegram, never video call',
      "Request for 'registration fee', 'security deposit' or 'training kit cost'",
      'Fake offer letter with real company logo (Infosys, TCS, Amazon, etc.)',
      'YouTube/Instagram task-based job — “like videos to earn per day”',
      'Asks for Aadhaar, PAN, and bank account number before joining',
    ],
    steps: [
      { icon: '🔍', title: 'Verify the Company Directly', body: "Search the company's official website and call their HR directly. Do NOT use any contact provided by the recruiter." },
      { icon: '💰', title: 'Never Pay to Get a Job', body: 'Legitimate employers NEVER ask candidates for money. Any payment request is 100% a scam, no exceptions.' },
      { icon: '🔐', title: 'Protect Your Documents', body: 'Do not share Aadhaar, PAN, bank details, or photos of documents with unverified recruiters over WhatsApp.' },
      { icon: '📸', title: 'Save All Evidence', body: 'Screenshot the job post, offer letter, recruiter profile, and all conversations before blocking.' },
      { icon: '📢', title: 'Report to Multiple Platforms', body: 'File at cybercrime.gov.in. Also report the fake job post on LinkedIn/Indeed/WhatsApp to protect others.' },
    ],
    reality: 'In India, job seekers are never charged. If you paid and realized it is a scam, report immediately — you may recover some money through bank reversal.',
    helpline: { label: 'Cyber Crime Portal', num: '1930' },
    cta: 'Report Job Fraud',
  },
  {
    id: 'upi',
    icon: '💳',
    title: 'UPI & Banking Fraud',
    short: 'Fake UPI links, OTP phishing, SIM swap attacks and QR code scams',
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,0.08)',
    tag: 'CRITICAL',
    reports: '18,293',
    trend: '+203%',
    flags: [
      "Receives a 'collect request' disguised as a payment confirmation",
      'SMS claiming KYC expiry with link to fake bank/UPI portal',
      "OTP requested by 'bank employee' for 'account verification'",
      "QR code sent by a 'buyer' on OLX/Facebook — scanning debits, not credits",
      'Call saying your SIM will be deactivated, asks to press 1 to confirm',
      'Unknown person deposits small amount then claims “wrong transfer”',
    ],
    steps: [
      { icon: '🚫', title: 'Never Share OTP', body: 'Your bank, NPCI, or UPI app will NEVER ask for your OTP, PIN, or password over a call. Hang up immediately.' },
      { icon: '✅', title: 'Scanning a QR Deducts', body: 'When you scan a QR code sent by a stranger, money leaves your account — it does NOT come in. Always verify.' },
      { icon: '🔒', title: 'Freeze Your Account', body: 'If you suspect SIM swap, call your telecom provider immediately. Call your bank to block card/UPI access.' },
      { icon: '⏱️', title: 'Act Within 30 Minutes', body: 'Fraudulent UPI transfers can sometimes be reversed if reported within 30 minutes. Call 1930 and your bank immediately.' },
      { icon: '📢', title: 'File on Cyber Crime Portal', body: 'Report at cybercrime.gov.in with transaction ID, recipient UPI ID, and exact time. This creates a legal record.' },
    ],
    reality: 'UPI transactions cannot be reversed automatically — speed is everything. The 30-minute window is critical. Save 1930 in your phone right now.',
    helpline: { label: 'Cyber Crime / NPCI', num: '1930' },
    cta: 'Report UPI Fraud',
  },
]

type DetailPanelProps = { card: ScamCard; onClose: () => void; onReport: () => void }

function DetailPanel({ card, onClose, onReport }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [card.id])

  return (
    <div
      ref={panelRef}
      className="rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${card.accentBg}, rgba(8,6,20,0.95))`,
        border: `1px solid ${card.accent}40`,
        boxShadow: `0 0 40px ${card.accent}15`,
        animation: 'expandIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: `${card.accent}25` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{card.icon}</span>
          <div>
            <h2 className="text-white font-black text-lg leading-tight m-0">{card.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: `${card.accent}25`, color: card.accent, border: `1px solid ${card.accent}40` }}
              >
                {card.tag}
              </span>
              <span className="text-gray-500 text-xs">
                {card.reports} reports · <span style={{ color: '#ef4444' }}>{card.trend} this month</span>
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-white/10 shrink-0"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
          aria-label="Close detail"
        >
          ✕
        </button>
      </div>

      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <p
              className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: card.accent }}
            >
              <span
                className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px]"
                style={{ background: `${card.accent}20` }}
              >
                🚩
              </span>
              Warning Signs — Recognize the Scam
            </p>
            <div className="space-y-2">
              {card.flags.map((f, i) => (
                <div key={f} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5"
                    style={{ background: `${card.accent}20`, color: card.accent }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-gray-300 leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <p className="text-green-400 font-black text-xs uppercase tracking-wider mb-2">✅ Reality Check</p>
            <p className="text-green-100 text-sm leading-relaxed m-0">{card.reality}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3 text-cyan-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] bg-cyan-500/20">⚡</span>
              Immediate Action Steps
            </p>
            <div className="space-y-2.5">
              {card.steps.map((s, i) => (
                <div
                  key={s.title}
                  className="flex gap-3 rounded-xl p-3 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    animationDelay: `${i * 0.07}s`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ background: `${card.accent}15` }}
                  >
                    <span className="text-base">{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm m-0">{s.title}</p>
                    <p className="text-gray-400 text-xs leading-relaxed mt-0.5 m-0">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${card.helpline.num.replace(/[-\s]/g, '')}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 no-underline transition-all active:scale-95 text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
            >
              📞 {card.helpline.label}: {card.helpline.num}
            </a>
            <button
              onClick={onReport}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${card.accent}, ${card.accent}cc)`,
                border: 'none', cursor: 'pointer', color: '#fff', fontFamily: 'inherit',
                boxShadow: `0 4px 15px ${card.accent}40`,
              }}
            >
              📢 {card.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

type ScamCardProps = { card: ScamCard; active: boolean; onClick: () => void }

function ScamCard({ card, active, onClick }: ScamCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 sm:p-5 transition-all duration-200 active:scale-[0.98] group"
      style={{
        background: active ? card.accentBg : 'rgba(10,7,22,0.7)',
        border: `1.5px solid ${active ? `${card.accent}70` : 'rgba(255,255,255,0.07)'}`,
        boxShadow: active ? `0 0 30px ${card.accent}20, 0 8px 32px rgba(0,0,0,0.4)` : 'none',
        cursor: 'pointer', fontFamily: 'inherit',
        WebkitTapHighlightColor: 'transparent',
        transform: active ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = `${card.accent}45`
          e.currentTarget.style.background = card.accentBg
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.background = 'rgba(10,7,22,0.7)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}
        >
          {card.icon}
        </div>
        <span
          className="text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider shrink-0"
          style={{ background: `${card.accent}20`, color: card.accent, border: `1px solid ${card.accent}35` }}
        >
          {card.tag}
        </span>
      </div>

      <h3 className="text-white font-black text-base leading-tight mb-1.5">{card.title}</h3>
      <p className="text-gray-400 text-xs leading-relaxed mb-3">{card.short}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>
            📋 <span className="text-gray-400 font-medium">{card.reports}</span> reports
          </span>
          <span className="text-red-400 font-bold">{card.trend}</span>
        </div>
        <div
          className="flex items-center gap-1 text-xs font-bold transition-colors"
          style={{ color: active ? card.accent : '#6b7280' }}
        >
          {active ? 'Close ↑' : 'Expand ↓'}
        </div>
      </div>
    </button>
  )
}

type CardGridProps = { cards: ScamCard[]; active: string | null; onToggle: (id: string) => void; onReport: (id: string) => void }

function CardGrid({ cards, active, onToggle, onReport }: CardGridProps) {
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setCols(w >= 1024 ? 3 : w >= 640 ? 2 : 1)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const rows: ScamCard[][] = []
  for (let i = 0; i < cards.length; i += cols) {
    rows.push(cards.slice(i, i + cols))
  }

  const activeCard = cards.find((c) => c.id === active)

  return (
    <div className="space-y-3">
      {rows.map((row, ri) => {
        const rowHasActive = row.some((c) => c.id === active)
        return (
          <div key={ri}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 12,
              }}
            >
              {row.map((card) => (
                <ScamCard
                  key={card.id}
                  card={card}
                  active={active === card.id}
                  onClick={() => onToggle(card.id)}
                />
              ))}
              {row.length < cols &&
                Array.from({ length: cols - row.length }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
            </div>
            {rowHasActive && activeCard && (
              <div className="mt-3">
                <DetailPanel
                  card={activeCard}
                  onClose={() => onToggle(activeCard.id)}
                  onReport={() => onReport(activeCard.id)}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function AdultSafetyPage() {
  const [active, setActive] = useState<string | null>(null)
  const [reportModal, setReportModal] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = SCAM_CARDS.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.short.toLowerCase().includes(search.toLowerCase()),
  )

  const totalReports = SCAM_CARDS.reduce((sum, card) => sum + parseInt(card.reports.replace(/,/g, ''), 10), 0)

  const toggle = (id: string) => setActive((prev) => (prev === id ? null : id))

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(160deg, #04091a 0%, #080614 40%, #0a0618 100%)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <nav
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          height: 56,
          background: 'rgba(4,6,22,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(59,130,246,0.15)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)' }}
            >
              D
            </div>
            <span className="font-black text-white text-base tracking-wide">DHIP</span>
            <span className="text-gray-600 hidden sm:block mx-1">·</span>
            <span className="text-blue-300 text-sm hidden sm:block">Adult Digital Safety</span>
          </div>
          <a
            href="tel:1930"
            className="text-xs font-bold px-3 py-2 rounded-xl no-underline transition-all active:scale-95"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd', WebkitTapHighlightColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.28)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.15)'
            }}
          >
            💻 Cyber Help: 1930
          </a>
        </div>
      </nav>

      <div style={{ paddingTop: 56 }}>
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 65%)' }}
          />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-4 text-2xl sm:text-3xl"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 0 40px rgba(59,130,246,0.4)' }}
            >
              🛡️
            </div>
            <h1
              className="font-black text-white mb-2 leading-tight"
              style={{ fontSize: 'clamp(24px,5vw,40px)', margin: '0 0 8px' }}
            >
              Adult{' '}
              <span style={{ background: 'linear-gradient(90deg,#60a5fa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Digital Safety
              </span>
            </h1>
            <p className="text-blue-200/60 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-6">
              Stigma-free support for all digital threats — knowledge is your best defence
            </p>

            <div className="flex justify-center gap-6 sm:gap-10 mb-8 flex-wrap">
              {[
                { v: `${(totalReports / 1000).toFixed(0)}K+`, l: 'Total Reports', c: '#60a5fa' },
                { v: '6', l: 'Threat Categories', c: '#34d399' },
                { v: '98.2%', l: 'Detection Accuracy', c: '#a78bfa' },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="text-xl sm:text-2xl font-black" style={{ color: s.c }}>
                    {s.v}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="relative max-w-md mx-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search threat type…"
                className="w-full py-3 pl-10 pr-4 rounded-2xl text-white text-sm focus:outline-none transition-all"
                style={{ background: 'rgba(10,7,22,0.8)', border: '1px solid rgba(59,130,246,0.25)', fontSize: 16 }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(59,130,246,0.6)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(59,130,246,0.25)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-5 pb-20">
          <div
            className="rounded-2xl p-4 mb-6 flex items-start gap-3"
            style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <span className="text-xl shrink-0">💙</span>
            <p className="text-blue-200/80 text-sm leading-relaxed m-0">
              <strong className="text-blue-300">You are not alone and you are not at fault.</strong> These scams affect lakhs of Indians every year — engineers, doctors, executives, students. Tap any card to learn how to protect yourself.
            </p>
          </div>

          <CardGrid cards={filtered} active={active} onToggle={toggle} onReport={(id) => setReportModal(id)} />

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg mb-2">No results for "{search}"</p>
              <button
                onClick={() => setSearch('')}
                className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear search
              </button>
            </div>
          )}

          <div
            className="mt-10 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between"
            style={{ background: 'rgba(10,7,22,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <div className="text-center sm:text-left">
              <p className="text-white font-bold text-base m-0">Need immediate help?</p>
              <p className="text-gray-500 text-xs mt-0.5 m-0">National Cyber Crime Helpline — available 24×7</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <a
                href="tel:1930"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm no-underline transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}
              >
                📞 Call 1930
              </a>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm no-underline transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb' }}
              >
                🌐 cybercrime.gov.in
              </a>
            </div>
          </div>
        </div>
      </div>

      {reportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}
          onClick={(e) => e.target === e.currentTarget && setReportModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{ background: 'rgba(8,6,20,0.98)', border: '1px solid rgba(59,130,246,0.3)', animation: 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-white font-black text-xl mb-2">Report Anonymously</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Your report helps protect thousands of others. No personal details required — completely anonymous.
            </p>
            <div className="space-y-3">
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 rounded-xl font-bold text-sm no-underline text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}
              >
                🌐 File on cybercrime.gov.in
              </a>
              <button
                onClick={() => setReportModal(null)}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; }
        a { text-decoration: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 2px; }
        @keyframes expandIn { from { opacity:0; transform:translateY(-10px) scaleY(0.95); } to { opacity:1; transform:translateY(0) scaleY(1); } }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}
