import type { JSX } from 'react'
import { useEffect, useState } from 'react'

const features = [
  {
    id: 'scanner', icon: '⚡', code: 'SYS_01', title: 'Threat Scanner',
    tagline: 'Multi-source intelligence engine',
    description: 'Parallel API checks across 10 threat databases simultaneously. DRS score computed in under 2 seconds.',
    bullets: ['Parallel API checks · 10 sources', 'DRS score in <2s', 'Actionable recommendations', 'One-click reporting'],
    neon: '#39FF14', demo: 'scanner',
  },
  {
    id: 'alerts', icon: '◈', code: 'SYS_02', title: 'Live Alerts',
    tagline: 'Regional threat intelligence feed',
    description: 'State-level threat pushes with severity ranking. Real-time warnings before the attack vector reaches your zone.',
    bullets: ['State-level geographic updates', 'Severity prioritization engine', 'Rapid warning feed', 'Emergency contact actions'],
    neon: '#FF2D55', demo: 'alerts',
  },
  {
    id: 'women', icon: '◉', code: 'SYS_03', title: 'Women Safety Hub',
    tagline: 'Trauma-informed protection layer',
    description: 'Panic alert flows with controlled escalation. Anonymous mode strips all metadata. Direct helpline integration.',
    bullets: ['Anonymous mode + metadata wipe', 'Helpline integration 112 / 1091', 'Safe reporting pathways', 'Evidence support chain'],
    neon: '#BF5FFF', demo: 'women',
  },
  {
    id: 'vault', icon: '▣', code: 'SYS_04', title: 'Evidence Vault',
    tagline: 'AES-256 + blockchain anchoring',
    description: 'Client-side encryption with optional Polygon blockchain timestamping for court-admissible evidence preservation.',
    bullets: ['AES-256 client-side encryption', 'Tamper-resistant audit trail', 'SHA-256 file hash proofs', 'Secure access controls'],
    neon: '#00F5FF', demo: 'vault',
  },
  {
    id: 'community', icon: '◎', code: 'SYS_05', title: 'Community Intel',
    tagline: 'Crowd-sourced collective defence',
    description: 'Individual reports cluster into verified threat patterns. Mass warnings dispatched before attackers adapt.',
    bullets: ['Crowd-sourced threat signals', 'Verification workflow engine', 'AI pattern clustering', 'Mass warning distribution'],
    neon: '#FFB800', demo: 'community',
  },
]

const partners = ['VirusTotal', 'Google Safe Browsing', 'Secure Cloud APIs', 'Polygon', 'Twilio', 'OpenRouter']

const comparison = [
  { label: 'AI Risk Scoring', dhip: true, trad: false, others: 'partial' },
  { label: 'Regional Alerts', dhip: true, trad: false, others: 'partial' },
  { label: 'Encrypted Evidence Vault', dhip: true, trad: false, others: 'partial' },
  { label: 'Women Safety Workflows', dhip: true, trad: false, others: 'partial' },
  { label: 'Multi-Source Intelligence', dhip: true, trad: false, others: false },
  { label: 'Blockchain Timestamping', dhip: true, trad: false, others: false },
]

const GLITCH_CHARS = '▓░▒█▄▀◆◇▸▹'

function useGlitch(text: string, active: boolean) {
  const [display, setDisplay] = useState(text)
  useEffect(() => {
    if (!active) { setDisplay(text); return }
    let i = 0
    const iv = setInterval(() => {
      i++
      if (i > 7) { setDisplay(text); clearInterval(iv); return }
      setDisplay(text.split('').map((c, idx) => (idx < i ? c : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)])).join(''))
    }, 45)
    return () => clearInterval(iv)
  }, [text, active])
  return display
}

function ScannerDemo({ neon }: { neon: string }) {
  const [input, setInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lines, setLines] = useState<string[]>([])
  const [result, setResult] = useState<{ score: number; safe: boolean } | null>(null)

  const scan = () => {
    if (!input.trim()) return
    setScanning(true); setResult(null); setProgress(0); setLines([])
    const log = [
      '[INIT] Dispatching to 10 intelligence nodes...',
      '[VT] VirusTotal query sent',
      '[GSB] Google SafeBrowse handshake',
      '[PT] PhishTank lookup initiated',
      '[AI] AbuseIPDB scoring',
      '[ML] DRS model inference...',
    ]
    let p = 0, li = 0
    const iv = setInterval(() => {
      p += Math.random() * 15 + 8
      if (li < log.length) setLines((l) => [...l, log[li++]])
      if (p >= 100) {
        clearInterval(iv); setScanning(false)
        const safe = Math.random() > 0.4
        setResult({ score: safe ? Math.floor(Math.random() * 18 + 2) : Math.floor(Math.random() * 55 + 45), safe })
      }
      setProgress(Math.min(p, 100))
    }, 180)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-black border px-3 py-2 text-xs font-mono focus:outline-none transition-colors"
          style={{ borderColor: `${neon}44`, color: neon }}
          placeholder="https://... or +91-XXXXX or UPI@"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && scan()}
        />
        <button onClick={scan} disabled={scanning}
          className="px-4 py-2 text-xs font-black font-mono tracking-widest transition-all disabled:opacity-40"
          style={{ background: neon, color: '#000' }}>
          {scanning ? 'SCAN' : 'EXEC'}
        </button>
      </div>
      {lines.length > 0 && (
        <div className="border p-3 font-mono text-xs space-y-1 max-h-32 overflow-y-auto"
          style={{ borderColor: `${neon}22`, background: `${neon}05` }}>
          {lines.map((l, i) => <div key={i} style={{ color: `${neon}99` }}>{l}</div>)}
          {scanning && (
            <div className="mt-2">
              <div className="flex justify-between mb-1" style={{ color: `${neon}55` }}>
                <span>PROGRESS</span><span>{Math.floor(progress)}%</span>
              </div>
              <div className="h-px w-full" style={{ background: `${neon}22` }}>
                <div className="h-px transition-all duration-150" style={{ width: `${progress}%`, background: neon }} />
              </div>
            </div>
          )}
        </div>
      )}
      {result && (
        <div className="border p-4 font-mono"
          style={{ borderColor: `${result.safe ? '#39FF14' : '#FF2D55'}55`, background: `${result.safe ? '#39FF14' : '#FF2D55'}08` }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs mb-1 font-black" style={{ color: result.safe ? '#39FF14' : '#FF2D55' }}>
                {result.safe ? 'STATUS: CLEAN' : 'STATUS: THREAT DETECTED'}
              </div>
              <div className="text-xs opacity-40">{result.safe ? 'No threat signatures found' : 'Flagged by 3+ intel sources'}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black" style={{ color: result.safe ? '#39FF14' : '#FF2D55' }}>{result.score}</div>
              <div className="text-xs opacity-30">DRS SCORE</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AlertsDemo({ neon }: { neon: string }) {
  const raw = [
    { region: 'Delhi NCR', type: 'Phishing Campaign', sev: 'CRITICAL', time: '1m', c: '#FF2D55' },
    { region: 'Mumbai', type: 'UPI Fraud Wave', sev: 'HIGH', time: '6m', c: '#FF6B00' },
    { region: 'Bangalore', type: 'SIM Swap Spree', sev: 'HIGH', time: '14m', c: '#FF6B00' },
    { region: 'Hyderabad', type: 'Fake Job Links', sev: 'MEDIUM', time: '41m', c: '#FFB800' },
    { region: 'Chennai', type: 'Vishing Bots', sev: 'LOW', time: '2h', c: '#39FF14' },
  ]
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (shown >= raw.length) return
    const t = setTimeout(() => setShown((s) => s + 1), 700)
    return () => clearTimeout(t)
  }, [shown, raw.length])

  return (
    <div className="space-y-2 font-mono">
      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: neon }}>
        <span className="animate-pulse">▶</span>
        <span className="tracking-widest">LIVE THREAT STREAM</span>
        <span className="ml-auto opacity-40">{shown}/{raw.length} active</span>
      </div>
      {raw.slice(0, shown).map((a, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-2 border transition-all duration-500"
          style={{ borderColor: `${a.c}33`, background: `${a.c}08` }}>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: a.c }} />
            <div>
              <div className="text-xs font-bold text-white">{a.region}</div>
              <div className="text-xs opacity-40">{a.type}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black px-2 py-0.5" style={{ color: a.c, border: `1px solid ${a.c}44` }}>{a.sev}</div>
            <div className="text-xs opacity-25 mt-1">{a.time} ago</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function WomenDemo({ neon }: { neon: string }) {
  const [anon, setAnon] = useState(false)
  const [panic, setPanic] = useState(false)
  return (
    <div className="space-y-3 font-mono">
      <div className="flex gap-2">
        {['NORMAL', 'ANON'].map((m) => (
          <button key={m} onClick={() => setAnon(m === 'ANON')}
            className="flex-1 py-2 text-xs font-black tracking-widest transition-all border"
            style={(anon ? m === 'ANON' : m === 'NORMAL')
              ? { background: neon, color: '#000', borderColor: neon }
              : { borderColor: `${neon}33`, color: `${neon}55` }}>
            {m}
          </button>
        ))}
      </div>
      {anon && (
        <div className="border px-3 py-2 text-xs tracking-wider"
          style={{ borderColor: `${neon}44`, color: `${neon}AA`, background: `${neon}08` }}>
          ◈ ID MASKED · LOCATION ROUNDED · ZERO LOGS
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {['REPORT INCIDENT', 'CALL 1091', 'SHARE LOCATION', 'CAPTURE EVIDENCE'].map((a) => (
          <button key={a} className="p-3 text-xs border text-left transition-all tracking-wider"
            style={{ borderColor: `${neon}22`, color: `${neon}55` }}>
            {a}
          </button>
        ))}
      </div>
      <button
        onClick={() => { setPanic(true); setTimeout(() => setPanic(false), 3000) }}
        className="w-full py-3 text-sm font-black tracking-widest transition-all"
        style={panic ? { background: '#39FF14', color: '#000' } : { background: '#FF2D55', color: '#fff' }}>
        {panic ? '◈ ALERT SENT — HELP EN ROUTE' : '▲ PANIC ALERT'}
      </button>
    </div>
  )
}

function VaultDemo({ neon }: { neon: string }) {
  const [files, setFiles] = useState([
    { name: 'evidence_001.png', hash: 'a3f9b2...c12e', sealed: true },
    { name: 'chat_log_2024.txt', hash: '7b2dc1...89af', sealed: false },
    { name: 'call_record.mp3', hash: 'd9f3a8...11bc', sealed: false },
  ])
  const [sealing, setSealing] = useState<number | null>(null)
  const seal = (i: number) => {
    setSealing(i)
    setTimeout(() => { setFiles((f) => f.map((x, idx) => (idx === i ? { ...x, sealed: true } : x))); setSealing(null) }, 1600)
  }
  return (
    <div className="space-y-3 font-mono">
      <div className="border px-3 py-2 flex items-center justify-between text-xs"
        style={{ borderColor: `${neon}44`, background: `${neon}08` }}>
        <span style={{ color: neon }}>AES-256 · POLYGON READY</span>
        <span className="animate-pulse" style={{ color: `${neon}77` }}>◈ ACTIVE</span>
      </div>
      {files.map((f, i) => (
        <div key={f.name} className="border px-3 py-2.5 flex items-center justify-between"
          style={{ borderColor: `${neon}22`, background: f.sealed ? `${neon}06` : 'transparent' }}>
          <div>
            <div className="text-xs text-white">{f.name}</div>
            <div className="text-xs opacity-25 mt-0.5">{f.hash}</div>
          </div>
          {f.sealed
            ? <span className="text-xs px-2 py-1 border font-black" style={{ color: neon, borderColor: `${neon}44` }}>⛓ SEALED</span>
            : <button onClick={() => seal(i)} disabled={sealing !== null}
                className="text-xs px-3 py-1 font-black transition-all disabled:opacity-30"
                style={{ background: neon, color: '#000' }}>
                {sealing === i ? '...' : 'SEAL'}
              </button>
          }
        </div>
      ))}
    </div>
  )
}

function CommunityDemo({ neon }: { neon: string }) {
  const [count, setCount] = useState(1847)
  const reports = [
    { text: 'Fake KYC call +91-98XXXXXXXX', votes: 89, verified: true },
    { text: 'Phishing SMS — HDFC reward link', votes: 142, verified: true },
    { text: 'Vishing attempt — loan offer', votes: 31, verified: false },
  ]
  useEffect(() => {
    const iv = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3)), 1800)
    return () => clearInterval(iv)
  }, [])
  return (
    <div className="space-y-3 font-mono">
      <div className="border px-3 py-3 flex justify-between items-center"
        style={{ borderColor: `${neon}44`, background: `${neon}08` }}>
        <span className="text-xs tracking-wider" style={{ color: `${neon}77` }}>ACTIVE REPORTS</span>
        <span className="text-2xl font-black" style={{ color: neon }}>{count.toLocaleString()}</span>
      </div>
      {reports.map((r) => (
        <div key={r.text} className="border px-3 py-2 flex items-start justify-between"
          style={{ borderColor: `${neon}22` }}>
          <div className="flex-1 mr-3">
            <div className="text-xs text-white">{r.text}</div>
            {r.verified && <div className="text-xs mt-0.5" style={{ color: '#39FF14' }}>◈ VERIFIED</div>}
          </div>
          <div className="text-right">
            <div className="text-sm font-black" style={{ color: neon }}>{r.votes}</div>
            <div className="text-xs opacity-25">signals</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const DEMOS: Record<string, ({ neon }: { neon: string }) => JSX.Element> = {
  scanner: ScannerDemo,
  alerts: AlertsDemo,
  women: WomenDemo,
  vault: VaultDemo,
  community: CommunityDemo,
}

export function FeaturesPage() {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const [tick, setTick] = useState(0)
  const f = features[active]
  const Demo = DEMOS[f.demo]
  const titleDisplay = useGlitch(f.title, glitching)

  const go = (i: number) => {
    if (i === active) return
    setFading(true); setGlitching(true)
    setTimeout(() => { setActive(i); setFading(false) }, 220)
    setTimeout(() => setGlitching(false), 700)
  }

  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 2500)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700;800&display=swap');

        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
          background-size:40px 40px;
        }
        .scanbar {
          position:fixed;top:0;left:0;right:0;height:2px;z-index:9999;pointer-events:none;
          animation:scanmove 4s linear infinite;
        }
        @keyframes scanmove { 0%{top:0;opacity:1} 90%{opacity:.3} 100%{top:100vh;opacity:0} }

        .crt-lines {
          position:fixed;inset:0;pointer-events:none;z-index:9998;
          background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px);
        }
        .clip-cyber {
          clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));
        }
        .clip-cyber-sm {
          clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
        }
        .clip-cyber-xs {
          clip-path:polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px));
        }
        @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:.88} 94%{opacity:1} 97%{opacity:.92} }
        .flicker { animation:flicker 5s infinite; }
        @keyframes pulse-neon { 0%,100%{opacity:1} 50%{opacity:.5} }

        input::placeholder { color:#2a2a2a; }
        input { caret-color:var(--neon,#39FF14); }
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-track{background:#000}::-webkit-scrollbar-thumb{background:#222}
      `}</style>
      <style>{`:root{--neon:${f.neon}}`}</style>

      <div className="scanbar" style={{ background: `linear-gradient(90deg,transparent,${f.neon}AA,transparent)` }} />
      <div className="crt-lines" />
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none transition-all duration-700"
        style={{ background: `radial-gradient(ellipse 70% 45% at 50% 0%,${f.neon}0B 0%,transparent 70%)` }} />

      <header className="relative border-b border-white/5 px-4 sm:px-6 py-4 flicker">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 flex items-center justify-center text-sm font-black clip-cyber-sm border"
              style={{ borderColor: `${f.neon}88`, color: f.neon, background: `${f.neon}12` }}>
              D
            </div>
            <div>
              <div className="text-sm font-black tracking-[0.3em]" style={{ color: f.neon }}>DHIP</div>
              <div className="text-xs tracking-widest text-white/20 hidden sm:block">DIGITAL HARM INTELLIGENCE PLATFORM</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2 text-white/20 border border-white/5 px-3 py-1">
              <span>v2.4.1</span><span className="opacity-40">·</span><span>SECURE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: f.neon, animation: 'pulse-neon 1.5s infinite' }} />
              <span className="text-white/30">{(1847 + tick * 2).toLocaleString()} blocked</span>
            </div>
          </div>
        </div>
      </header>

      <section className="px-4 sm:px-6 pt-16 pb-12 text-center relative">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 border px-5 py-2 text-xs tracking-widest mb-8 clip-cyber-xs"
            style={{ borderColor: `${f.neon}33`, color: '#ffffff44' }}>
            <span style={{ color: f.neon }}>▶</span>
            EVERYTHING YOU NEED TO STAY SAFE ONLINE
            <span className="animate-pulse" style={{ color: f.neon }}>_</span>
          </div>

          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-4 px-4">
              <span className="text-white">ONE PLATFORM.</span><br />
              <span style={{ color: f.neon, textShadow: `0 0 40px ${f.neon}33` }} className="transition-all duration-500">
                TEN SOURCES.
              </span><br />
              <span className="text-white">ZERO COMPROMISE.</span>
            </h1>
          </div>

          <p className="text-sm text-white/25 max-w-lg mx-auto mt-4 leading-loose tracking-wide">
            Military-grade threat intelligence layered with human-centered safety workflows —
            built for India, scaled for the world.
          </p>

          <div className="flex items-center gap-4 max-w-xs mx-auto mt-10">
            <div className="w-2 h-2 rotate-45 border" style={{ borderColor: `${f.neon}66` }} />
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,transparent,${f.neon}44,transparent)` }} />
            <div className="w-2 h-2 rotate-45 border" style={{ borderColor: `${f.neon}66` }} />
          </div>
        </div>
      </section>

      <nav className="sticky top-0 z-40 border-y border-white/5 bg-black/90 backdrop-blur-xl px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          {features.map((ft, i) => (
            <button
              key={ft.id} onClick={() => go(i)}
              className="flex-shrink-0 flex items-center gap-2.5 px-4 sm:px-6 py-4 text-xs font-black tracking-widest transition-all relative border-b-2"
              style={active === i
                ? { color: ft.neon, borderColor: ft.neon }
                : { color: '#ffffff30', borderColor: 'transparent' }}
            >
              <span style={active === i ? { color: ft.neon } : {}}>{ft.icon}</span>
              <span className="hidden sm:inline">{ft.code}</span>
              <span className="sm:hidden">{ft.code.split('_')[1]}</span>
            </button>
          ))}
          <div className="flex-1 border-b-2 border-transparent" />
        </div>
      </nav>

      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="border clip-cyber transition-all duration-300"
            style={{
              borderColor: `${f.neon}2A`,
              opacity: fading ? 0 : 1,
              transform: fading ? 'translateY(6px)' : 'translateY(0)',
              background: `linear-gradient(135deg,${f.neon}06 0%,transparent 40%,black 100%)`,
            }}
          >
            <div className="grid lg:grid-cols-2">
              <div className="p-7 lg:p-10 border-b lg:border-b-0 lg:border-r" style={{ borderColor: `${f.neon}14` }}>
                <div className="flex items-center gap-3 mb-7">
                  <div className="px-3 py-1 text-xs font-black tracking-[0.2em] clip-cyber-xs border"
                    style={{ borderColor: `${f.neon}66`, color: f.neon, background: `${f.neon}10` }}>
                    {f.code}
                  </div>
                  <div className="h-px flex-1" style={{ background: `${f.neon}18` }} />
                  <div className="w-2 h-2 rotate-45 border" style={{ borderColor: `${f.neon}55` }} />
                  <div className="w-1 h-1 rotate-45" style={{ background: `${f.neon}88` }} />
                </div>

                <div className="text-4xl mb-5">{f.icon}</div>
                <h2 className="text-3xl font-black tracking-tight text-white mb-1.5">{titleDisplay}</h2>
                <p className="text-sm mb-6 tracking-wider" style={{ color: `${f.neon}99` }}>{f.tagline}</p>
                <p className="text-sm leading-loose text-white/35 mb-8">{f.description}</p>

                <ul className="space-y-2.5 mb-9">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-xs tracking-wide text-white/45">
                      <span className="mt-0.5 font-black" style={{ color: f.neon }}>▸</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <button
                  className="px-7 py-3 text-xs font-black tracking-[0.2em] transition-all clip-cyber-xs hover:opacity-90 active:scale-95"
                  style={{ background: f.neon, color: '#000' }}>
                  INIT FREE TRIAL →
                </button>
              </div>

              <div className="p-7 lg:p-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1.5">
                    {['#FF2D55', '#FFB800', '#39FF14'].map((c) => (
                      <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex-1 border-b border-dashed border-white/5" />
                  <span className="text-xs tracking-[0.2em]" style={{ color: `${f.neon}44` }}>LIVE DEMO</span>
                </div>
                <Demo key={f.id} neon={f.neon} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs tracking-widest text-white/15">◈ ALL MODULES</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {features.map((ft, i) => (
              <button key={ft.id} onClick={() => go(i)}
                className="p-5 text-left border transition-all clip-cyber-sm hover:opacity-100"
                style={{
                  borderColor: active === i ? `${ft.neon}77` : '#ffffff0A',
                  background: active === i ? `${ft.neon}0C` : '#ffffff02',
                  opacity: active === i ? 1 : 0.45,
                }}>
                <div className="text-xl mb-3">{ft.icon}</div>
                <div className="text-xs font-black tracking-widest mb-1" style={{ color: active === i ? ft.neon : '#ffffff80' }}>
                  {ft.code}
                </div>
                <div className="text-xs text-white/30 leading-relaxed">{ft.title}</div>
                {active === i && <div className="mt-2.5 text-xs font-black" style={{ color: ft.neon }}>ACTIVE ▸</div>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-7">
            <span className="text-xs tracking-widest text-white/15">◈ DHIP vs COMPETITION</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="border clip-cyber" style={{ borderColor: '#ffffff0A' }}>
            <div className="grid grid-cols-4 border-b" style={{ borderColor: '#ffffff08', background: '#ffffff03' }}>
              {['CAPABILITY', 'DHIP', 'TRAD.', 'OTHERS'].map((h, i) => (
                <div key={h} className={`p-4 text-xs font-black tracking-widest ${i > 0 ? 'text-center' : ''}`}
                  style={{ color: i === 1 ? f.neon : '#ffffff18' }}>
                  {h}
                </div>
              ))}
            </div>
            {comparison.map((c) => (
              <div key={c.label} className="grid grid-cols-4 border-b hover:bg-white/[0.015] transition-colors"
                style={{ borderColor: '#ffffff05' }}>
                <div className="p-4 text-xs text-white/35 font-mono tracking-wide">{c.label}</div>
                {[c.dhip, c.trad, c.others].map((val, j) => (
                  <div key={`${c.label}-${j}`} className="p-4 flex justify-center items-center">
                    {val === true
                      ? <span className="text-xs font-black" style={{ color: j === 0 ? f.neon : '#ffffff22' }}>◈</span>
                      : val === 'partial'
                      ? <span className="text-xs border px-2 py-0.5 font-black tracking-wider" style={{ color: '#FFB80077', borderColor: '#FFB80022' }}>PART</span>
                      : <span className="text-white/10 text-xs">✕</span>
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs tracking-widest text-white/15 text-center mb-7">◈ POWERED BY</div>
          <div className="flex flex-wrap justify-center gap-3">
            {partners.map((p) => (
              <div key={p} className="px-4 py-2 border text-xs tracking-wider text-white/25 hover:text-white/55 transition-all clip-cyber-xs"
                style={{ borderColor: '#ffffff08', background: '#ffffff02' }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-xs tracking-widest text-white/15 mb-5">◈ INITIALIZE SYSTEM</div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-3">BEGIN PROTECTION NOW</h2>
          <p className="text-sm text-white/25 mb-10 tracking-wide leading-loose">
            Free tier available. No credit card. No compromise.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button className="px-8 py-3 text-sm font-black tracking-[0.2em] clip-cyber-xs transition-all hover:opacity-90 active:scale-95"
              style={{ background: f.neon, color: '#000' }}>
              INIT FREE →
            </button>
            <button className="px-8 py-3 text-sm font-black tracking-[0.2em] border clip-cyber-xs transition-all hover:border-white/20"
              style={{ borderColor: '#ffffff12', color: '#ffffff35' }}>
              READ DOCS
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-white/15">
          <span>DHIP © 2025 · ALL SYSTEMS NOMINAL</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: f.neon, animation: 'pulse-neon 1.5s infinite' }} />
            <span>UPTIME 99.97%</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default FeaturesPage
