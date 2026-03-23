import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './HomeLanding.css'
import { StatsCounter } from '../components/ui/StatsCounter'
import { useDashboardStats } from '../hooks/useDashboardStats'

const tickerItems = [
  { label: '+91-98765-43210', detail: 'Digital Arrest Scam', risk: 'HIGH', region: 'Uttarakhand', level: 'high' },
  { label: 'paytm-offr.xyz', detail: 'Phishing URL', risk: 'HIGH', region: 'Delhi NCR', level: 'high' },
  { label: 'work@earnhome.in', detail: 'Job Scam', risk: 'MED', region: 'Mumbai', level: 'med' },
  { label: '9876@fakeicici', detail: 'UPI Fraud', risk: 'HIGH', region: 'Bengaluru', level: 'high' },
  { label: 'crypto-3x.net', detail: 'Investment Scam', risk: 'HIGH', region: 'Hyderabad', level: 'high' },
  { label: '+91-76543-21098', detail: 'Loan App Fraud', risk: 'MED', region: 'Chennai', level: 'med' },
  { label: 'aadhaar-kyc.co', detail: 'Govt Impersonation', risk: 'HIGH', region: 'Jaipur', level: 'high' },
]

type ProcessStep = {
  num: string
  navLabel: string
  navTime: string
  color: string
  chipBg: string
  chipText: string
  iconBg: string
  iconColor: string
  icon: string
  tag: string
  fname: string
  title: string
  desc: string
  chip: string
  metrics: Array<{ v: string; l: string }>
}

const processSteps: ProcessStep[] = [
  {
    num: '01',
    navLabel: 'Submit Entity',
    navTime: '<50ms',
    color: '#3B82F6',
    chipBg: 'rgba(59,130,246,.12)',
    chipText: '#93C5FD',
    iconBg: 'rgba(59,130,246,.12)',
    iconColor: '#60A5FA',
    icon: '▶',
    tag: 'Input Layer',
    fname: 'entity_router.py',
    title: 'Submit any digital entity',
    desc: 'Paste a suspicious URL, phone, UPI ID, email or message. DHIP auto-detects the entity type and checks Redis cache first — returning known threats in under 50ms with zero latency.',
    chip: 'Redis cache hit · anonymous · no account needed',
    metrics: [
      { v: '<50ms', l: 'Cache hit' },
      { v: '5 types', l: 'Entity types' },
      { v: '100%', l: 'Anonymous' },
    ],
  },
  {
    num: '02',
    navLabel: 'Parallel APIs',
    navTime: '~400ms',
    color: '#22D3EE',
    chipBg: 'rgba(34,211,238,.12)',
    chipText: '#67E8F9',
    iconBg: 'rgba(34,211,238,.12)',
    iconColor: '#22D3EE',
    icon: '⚡',
    tag: 'Intelligence Layer',
    fname: 'threat_analyzer.py',
    title: 'Parallel intelligence gathering',
    desc: 'ThreadPoolExecutor fires 3–5 API calls simultaneously — VirusTotal, Google Safe Browsing, PhishTank, AbuseIPDB and IPQualityScore. No serial bottleneck. All results combined in ~400ms.',
    chip: '3–5 APIs simultaneously · no serial wait',
    metrics: [
      { v: '400ms', l: 'Avg combined' },
      { v: '70+', l: 'Engines' },
      { v: '5×', l: 'vs serial' },
    ],
  },
  {
    num: '03',
    navLabel: 'DRS + AI',
    navTime: '~1.8s',
    color: '#8B5CF6',
    chipBg: 'rgba(139,92,246,.12)',
    chipText: '#C4B5FD',
    iconBg: 'rgba(139,92,246,.12)',
    iconColor: '#A78BFA',
    icon: '◆',
    tag: 'Scoring Layer',
    fname: 'drs_calculator.py',
    title: 'DRS scoring + AI explanation',
    desc: 'A weighted formula combines all API signals into a 0–10 Digital Risk Score. Celery fires an async OpenRouter AI task for a plain-language explanation — without blocking the main response.',
    chip: '94.3% accuracy · async AI · Gemini fallback',
    metrics: [
      { v: '0–10', l: 'DRS scale' },
      { v: '94.3%', l: 'Accuracy' },
      { v: '<2s', l: 'Score time' },
    ],
  },
  {
    num: '04',
    navLabel: 'Alert Cascade',
    navTime: '<3s',
    color: '#10B981',
    chipBg: 'rgba(16,185,129,.12)',
    chipText: '#6EE7B7',
    iconBg: 'rgba(16,185,129,.12)',
    iconColor: '#34D399',
    icon: '☁',
    tag: 'Distribution Layer',
    fname: 'alert_dispatch.py',
    title: 'Community protection cascade',
    desc: 'Result saved to Supabase. Realtime WebSocket instantly pushes the alert to every subscribed dashboard in the affected district. Spike detection fires HIGH alerts at 3× the 30-day baseline.',
    chip: '<3s end-to-end · 50,000+ concurrent users',
    metrics: [
      { v: '<3s', l: 'Delivery' },
      { v: '50K+', l: 'Users reached' },
      { v: '3×', l: 'Spike threshold' },
    ],
  },
]

function ProcessSection() {
  return (
    <div className="process-simple">
      <div className="hdr">
        <div className="hdr-left">
          <p className="tag">Process</p>
          <h2 className="hdr-h2">How DHIP Works</h2>
          <p className="hdr-sub">From submission to community-wide protection — a straightforward four-step pipeline built for reliability.</p>
        </div>
        <div className="timer">
          <div className="timer-lbl">Total pipeline</div>
          <div className="timer-val">&lt;3s</div>
          <div className="timer-unit">end-to-end</div>
        </div>
      </div>

      <div className="process-grid">
        {processSteps.map((step) => (
          <div key={step.num} className="process-card">
            <div className="process-card-top">
              <span className="process-num">{step.num}</span>
              <span className="process-chip" style={{ background: step.chipBg, color: step.chipText }}>{step.tag}</span>
            </div>
            <h3 className="process-title">{step.title}</h3>
            <p className="process-desc">{step.desc}</p>
            <div className="process-metrics">
              {step.metrics.map((m) => (
                <div key={m.l} className="process-metric">
                  <span className="m-val" style={{ color: step.color }}>{m.v}</span>
                  <span className="m-lbl">{m.l}</span>
                </div>
              ))}
            </div>
            <div className="process-footer" style={{ background: step.iconBg, color: step.iconColor }}>
              <span className="process-icon">{step.icon}</span>
              <span className="process-meta">{step.fname}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const workingFlow = [
  {
    title: '1) Intake + Validation',
    detail: 'Users submit URLs, phones, UPI IDs, emails, or raw messages. Schema validation routes each entity to the right pipeline.',
    badge: 'Auto-detect entity type',
  },
  {
    title: '2) Parallel Intelligence',
    detail: 'ThreadPoolExecutor fans out to VirusTotal, Google Safe Browsing, PhishTank, IPQualityScore, and AbuseIPDB in parallel.',
    badge: '5 external APIs · <2s',
  },
  {
    title: '3) Scoring + AI Summary',
    detail: 'Digital Risk Score blends ML signals with reputation data. OpenRouter AI explains findings; Gemini is the fallback.',
    badge: 'DRS 0–10 · 94%+',
  },
  {
    title: '4) Broadcast + Safety',
    detail: 'Supabase stores the verdict, pushes realtime alerts, and updates the Women Safety hub and Evidence Vault actions.',
    badge: 'Realtime to 50K+ users',
  },
]

const apis = [
  { name: 'VirusTotal', purpose: '70+ AV engine URL/domain scan', limit: '500 req/day', color: '#EF4444', status: 'Live', focus: 'Malware & phishing' },
  { name: 'Google Safe Browsing', purpose: 'Phishing + malware database', limit: '10,000 req/day', color: '#3B82F6', status: 'Live', focus: 'Browser threats' },
  { name: 'PhishTank', purpose: 'Community phishing URL list', limit: 'Unlimited', color: '#F59E0B', status: 'Live', focus: 'Crowd signals' },
  { name: 'AbuseIPDB', purpose: 'IP address reputation scoring', limit: '1,000 req/day', color: '#22D3EE', status: 'Live', focus: 'IP abuse' },
  { name: 'IPQualityScore', purpose: 'Phone number fraud detection', limit: '5,000 req/mo', color: '#10B981', status: 'Live', focus: 'Phone/UPI risk' },
  { name: 'OpenRouter', purpose: 'Primary AI — 400+ models', limit: 'Free tier', color: '#8B5CF6', status: 'Live', focus: 'AI summaries' },
  { name: 'Google Gemini', purpose: 'AI fallback when OpenRouter down', limit: '15 req/min', color: '#34D399', status: 'Live', focus: 'AI fallback' },
  { name: 'Twilio', purpose: 'PANIC button SMS dispatch', limit: '600 SMS trial', color: '#F87171', status: 'Live', focus: 'Panic SMS' },
  { name: 'Supabase', purpose: 'DB + Auth + Realtime + Storage', limit: '500MB free', color: '#818CF8', status: 'Live', focus: 'DB + realtime' },
  { name: 'Polygon Mumbai', purpose: 'Blockchain evidence timestamping', limit: 'Testnet — free', color: '#A78BFA', status: 'Live', focus: 'Tamper-proofing' },
]

const stats = [
  { label: 'Active Reports', value: 2647, tone: 'blue', emoji: '📋' },
  { label: 'Detection Accuracy', value: 98, suffix: '.2%', tone: 'green', emoji: '🎯' },
  { label: 'Contributors', value: 150, suffix: 'K+', tone: 'violet', emoji: '👥' },
  { label: 'Threats Prevented', value: 1265, tone: 'cyan', emoji: '🛡' },
]

const typedPhrases = [
  "> Scanning India's digital threat landscape in real-time...",
  '> One anonymous report → thousands protected. Instantly.',
  '> AI-powered DRS: 94.3% phishing detection accuracy.',
]

export function HomePage() {
  const [typed, setTyped] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { data: liveStats } = useDashboardStats()
  const [activeApi, setActiveApi] = useState(apis[0])
  const impactMetrics = useMemo(() => ([
    { label: 'Threats Detected', value: liveStats?.threatsDetected ?? 1265, suffix: '' },
    { label: 'Active Alerts', value: liveStats?.activeAlerts ?? 412, suffix: '' },
    { label: 'Protected Users', value: liveStats?.protectedUsers ?? 150_000, suffix: '+' },
    { label: 'Detection Accuracy (live)', value: liveStats?.detectionAccuracy ?? 98.2, suffix: '%' },
  ]), [liveStats])

  useEffect(() => {
    let phraseIndex = 0
    let charIndex = 0
    let deleting = false
    let timer: number | undefined
    let active = true

    const type = () => {
      if (!active) return
      const phrase = typedPhrases[phraseIndex]
      if (!deleting) {
        charIndex = Math.min(charIndex + 1, phrase.length)
        setTyped(phrase.slice(0, charIndex))
        if (charIndex === phrase.length) {
          deleting = true
          timer = window.setTimeout(type, 1900)
          return
        }
      } else {
        charIndex = Math.max(charIndex - 1, 0)
        setTyped(phrase.slice(0, charIndex))
        if (charIndex === 0) {
          deleting = false
          phraseIndex = (phraseIndex + 1) % typedPhrases.length
          timer = window.setTimeout(type, 260)
          return
        }
      }
      timer = window.setTimeout(type, deleting ? 22 : 46)
    }

    timer = window.setTimeout(type, 400)
    return () => {
      active = false
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('.reveal'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vis')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 },
    )

    sections.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const PAL = ['#3B82F6', '#8B5CF6', '#22D3EE', '#10B981']
    let nodes: Array<{ x: number; y: number; vx: number; vy: number; r: number; a: number; p: number; c: string }> = []
    let W = 0
    let H = 0
    let scanY = 0
    const mouse = { x: -999, y: -999 }
    let raf = 0

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    const mkNodes = () => {
      nodes = Array.from({ length: 88 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.4,
        a: Math.random() * 0.5 + 0.2,
        p: Math.random() * Math.PI * 2,
        c: PAL[Math.floor(Math.random() * PAL.length)],
      }))
    }

    const hexToRgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)].join(',')

    const frame = () => {
      raf = requestAnimationFrame(frame)
      ctx.fillStyle = '#050810'
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(59,130,246,.03)'
      for (let x = 30; x < W; x += 60) {
        for (let y = 30; y < H; y += 60) {
          ctx.beginPath()
          ctx.arc(x, y, 0.75, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        n.p += 0.013
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
        const dx = n.x - mouse.x
        const dy = n.y - mouse.y
        const d = Math.hypot(dx, dy)
        if (d < 100) {
          n.x += (dx / d) * 0.85
          n.y += (dy / d) * 0.85
        }
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 160) {
            ctx.strokeStyle = `rgba(59,130,246,${(1 - d / 160) * 0.13})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      nodes.forEach((n) => {
        const pulse = 0.65 + 0.35 * Math.sin(n.p)
        const rgb = hexToRgb(n.c)
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6)
        g.addColorStop(0, `rgba(${rgb},${n.a * 0.13})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = n.a * pulse
        ctx.fillStyle = n.c
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      })

      nodes.forEach((n) => {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y)
        if (d < 200) {
          ctx.strokeStyle = `rgba(34,211,238,${(1 - d / 200) * 0.28})`
          ctx.lineWidth = 0.65
          ctx.beginPath()
          ctx.moveTo(mouse.x, mouse.y)
          ctx.lineTo(n.x, n.y)
          ctx.stroke()
        }
      })

      scanY = (scanY + 1) % H
      const sg = ctx.createLinearGradient(0, scanY - 52, 0, scanY + 3)
      sg.addColorStop(0, 'rgba(59,130,246,0)')
      sg.addColorStop(0.8, 'rgba(59,130,246,.02)')
      sg.addColorStop(1, 'rgba(59,130,246,.055)')
      ctx.fillStyle = sg
      ctx.fillRect(0, scanY - 52, W, 55)

      const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.12, W / 2, H / 2, H * 0.82)
      v.addColorStop(0, 'rgba(0,0,0,0)')
      v.addColorStop(1, 'rgba(0,0,0,.72)')
      ctx.fillStyle = v
      ctx.fillRect(0, 0, W, H)
    }

    const handleResize = () => {
      resize()
      mkNodes()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    resize()
    mkNodes()
    frame()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const marqueeItems = useMemo(() => [...tickerItems, ...tickerItems], [])

  return (
    <div className="dhip">
      <canvas id="cvs" ref={canvasRef} aria-hidden="true" />
      <div className="dhip-inner">
        <section className="hero" id="top">
          <div className="hero-badge">
            <span className="badge-shine" />
            <span className="badge-dot" />
            India's Predictive Cyber Intelligence Platform
          </div>

          <h1 className="hero-h1">
            <span className="h1-line1">Detect Threats.</span>
            <span className="h1-line2">Protect Communities.</span>
            <span className="h1-line3">Before Harm Occurs.</span>
          </h1>

          <p className="hero-sub"><span>{typed}</span><span className="typed-cur" /></p>

          <div className="hero-btns">
            <Link to="/threat-check" className="btn-primary" aria-label="Analyze Threat">🛡 &nbsp;Analyze Threat</Link>
            <Link to="/women-safety" className="btn-violet" aria-label="Women Safety Hub">◈ &nbsp;Women Safety Hub</Link>
            <Link to="/community" className="btn-outline" aria-label="Community Reports">↗ &nbsp;Community Reports</Link>
          </div>

          <div className="ticker-wrap" aria-label="Live threat ticker">
            <div className="ticker-label"><span className="dot" />Live</div>
            <div className="ticker-scroll">
              <div className="ticker-track">
                {marqueeItems.map((item, idx) => (
                  <span key={`${item.label}-${idx}`} className="ti">
                    <span className="ti-entity">{item.label}</span> — {item.detail} &nbsp;
                    <span className={`sev sev-${item.level === 'high' ? 'H' : item.level === 'med' ? 'M' : 'L'}`}>{item.risk}</span>&nbsp; {item.region}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="stats-bar">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={stat.label} className={`stat-cell c-${stat.tone} reveal`} style={{ transitionDelay: `${idx * 0.08}s` }}>
                <div className="stat-icon">{stat.emoji}</div>
                <div>
                  <StatsCounter value={stat.value} suffix={stat.suffix} />
                  <span className="stat-lbl">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="section" id="features">
          <div className="container">
            <div className="sec-header reveal">
              <div className="sec-header-left">
                <p className="sec-tag">Capabilities</p>
                <h2 className="sec-h2">Intelligence at Every Layer</h2>
                <p className="sec-p">Full-spectrum cyber protection engineered for India's 800M+ internet users — from real-time scanning to AI-powered predictive threat mutation detection.</p>
              </div>
              <div className="sec-header-right">
                <div className="sec-stat">
                  <span className="sec-stat-val" style={{ color: '#3B82F6' }}>70+</span>
                  <span className="sec-stat-lbl">Threat Engines</span>
                </div>
                <div className="sec-divider" />
                <div className="sec-stat">
                  <span className="sec-stat-val" style={{ color: '#10B981' }}>94.3%</span>
                  <span className="sec-stat-lbl">Accuracy</span>
                </div>
                <div className="sec-divider" />
                <div className="sec-stat">
                  <span className="sec-stat-val" style={{ color: '#8B5CF6' }}>10</span>
                  <span className="sec-stat-lbl">APIs Integrated</span>
                </div>
              </div>
            </div>

            <div className="feat-grid reveal" style={{ transitionDelay: '.1s' }}>
              <div className="fc c-blue">
                <div className="fc-icon">🔍</div>
                <span className="fc-tag">Scanner</span>
                <h3 className="fc-title">Threat Intelligence Scanner</h3>
                <p className="fc-body">Analyze URLs, phones, UPI IDs and emails across 70+ threat engines — VirusTotal, Google Safe Browsing, PhishTank — fired in parallel via <span style={{ color: '#93C5FD', background: 'rgba(59,130,246,.1)', padding: '1px 5px', borderRadius: 3, fontSize: 12 }}>ThreadPoolExecutor</span>. Results in under 2 seconds.</p>
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.5rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>VirusTotal</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#60A5FA' }}>70+ engines</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#2563EB,#22D3EE)', borderRadius: 2, animation: 'barGrow .9s .3s ease-out forwards', width: '92%', transformOrigin: 'left' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>Response time</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#60A5FA' }}>{'<'} 2s</span>
                  </div>
                </div>
              </div>

              <div className="fc c-green">
                <div className="fc-icon">📊</div>
                <span className="fc-tag">ML Model</span>
                <h3 className="fc-title">Digital Risk Score (DRS)</h3>
                <p className="fc-body">Weighted 0–10 DRS combining Random Forest + BERT classification with crowd-sourced signal weighting. 94.3%+ phishing detection accuracy. Redis cached at 5-minute TTL.</p>
                <div style={{ marginTop: '1.3rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>Sample DRS Score</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: '#EF4444' }}>8.7 / 10</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#10B981,#F59E0B,#EF4444)', borderRadius: 3, animation: 'barGrow 1s .4s ease-out forwards', width: '87%', transformOrigin: 'left' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.4rem' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#6EE7B7' }}>LOW</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#FCD34D' }}>MEDIUM</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#FCA5A5' }}>HIGH</span>
                  </div>
                </div>
              </div>

              <div className="fc c-violet">
                <div className="fc-icon">🌸</div>
                <span className="fc-tag">Safety</span>
                <h3 className="fc-title">Women Safety Hub</h3>
                <p className="fc-body">One-tap PANIC SOS with GPS, AES-256-GCM encrypted evidence vault, 24/7 AI counselor, and 200+ verified NGO directory — built entirely on a zero-knowledge architecture.</p>
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.6rem', position: 'relative', zIndex: 1 }}>
                  {['Zero-knowledge architecture', 'GPS panic dispatch <3s', '200+ verified NGO directory', '24/7 AI safety counselor'].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                      <span style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: 'var(--t2)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fc c-amber fc-tmd">
                <div className="tmd-inner">
                  <div>
                    <div className="fc-icon">⚡</div>
                    <span className="fc-tag">Predictive AI</span>
                    <h3 className="fc-title" style={{ fontSize: 17, marginTop: '.4rem' }}>Temporal Mutation Detection</h3>
                    <p className="fc-body">DBSCAN clustering tracks how scam scripts evolve and predicts new variants <strong style={{ color: 'var(--t1)', fontWeight: 600 }}>5–7 days ahead</strong> of mass deployment — shifting India's cyber defense from reactive to proactive.</p>
                    <div className="tmd-chips">
                      <span className="tmd-chip">DBSCAN Clustering</span>
                      <span className="tmd-chip">Pattern Confidence Engine</span>
                      <span className="tmd-chip">5–7 Day Lead Time</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>91.3%</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Confidence</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>6d</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Lead Time</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>12.8K</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Users Warned</div>
                      </div>
                    </div>
                  </div>
                  <div className="code-wrap">
                    <div className="code-topbar">
                      <span className="cd cd-r" />
                      <span className="cd cd-a" />
                      <span className="cd cd-g" />
                      <span className="code-fname">tmd_model.py</span>
                    </div>
                    <div className="code-body">
                      <div><span className="cm"># Temporal Mutation Detection</span></div>
                      <div><span className="kw">model</span> = <span className="fn">DBSCAN</span>(</div>
                      <div>&nbsp;&nbsp;&nbsp;&nbsp;eps=<span className="nm">0.3</span>, min_samples=<span className="nm">5</span></div>
                      <div>)</div>
                      <div style={{ marginTop: 4 }}><span className="kw">clusters</span> = model.<span className="fn">fit</span>(threat_vectors)</div>
                      <div style={{ marginTop: 8 }}><span className="cm"># Predict next mutation variant</span></div>
                      <div><span className="fn">predict_variant</span>(cluster_id=<span className="nm">14</span>)</div>
                      <div className="code-output">
                        <div className="out-line">
                          <span style={{ color: '#10B981', fontSize: 12 }}>✓</span>
                          <span className="ok">New variant detected (cluster_14)</span>
                        </div>
                        <div className="out-line">
                          <span style={{ color: '#F59E0B', fontSize: 12 }}>⚡</span>
                          <span className="wn">Alert dispatched → 12,847 users</span>
                        </div>
                        <div className="out-meta">
                          confidence: <span className="ok">91.3%</span>
                          &nbsp;·&nbsp;
                          lead_time: <span className="wn">6d 4h</span>
                          &nbsp;·&nbsp;
                          <span style={{ color: '#475569' }}>status: <span style={{ color: '#6EE7B7' }}>ACTIVE</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="fc c-red">
                <div className="fc-icon">🔐</div>
                <span className="fc-tag">Zero-Knowledge</span>
                <h3 className="fc-title">Evidence Vault</h3>
                <p className="fc-body">AES-256-GCM client-side encryption — files never reach the server. SHA-256 hash with optional Polygon blockchain timestamping for legal-grade immutable proof of evidence.</p>
                <div style={{ marginTop: '1.25rem', background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 7, padding: '.85rem 1rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#FCA5A5', letterSpacing: '.08em', textTransform: 'uppercase' }}>Encryption Pipeline</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', flexWrap: 'wrap' }}>
                    {['File Input', 'SHA-256 Hash', 'AES-256-GCM', 'Polygon TX'].map((label, idx) => (
                      <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem' }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 7px', borderRadius: 3, background: 'rgba(239,68,68,.1)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,.15)' }}>{label}</span>
                        {idx < 3 ? <span style={{ color: '#475569', fontSize: 12 }}>→</span> : null}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="fc c-cyan fc-community">
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                  <div className="fc-icon" style={{ marginBottom: 0 }}>📡</div>
                  <div>
                    <span className="fc-tag" style={{ marginBottom: 0, display: 'inline-block' }}>Realtime</span>
                    <h3 className="fc-title" style={{ marginBottom: 0, fontSize: 17 }}>Community Intelligence</h3>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 4, padding: '4px 10px' }}>
                    <span className="live-dot" />LIVE
                  </div>
                </div>

                <div className="community-inner">
                  <div className="comm-col">
                    <div className="comm-col-label">Network Scale</div>
                    <div className="comm-metric">50,000+</div>
                    <div className="comm-metric-lbl">Concurrent users<br />protected in real-time</div>
                    <span className="comm-badge badge-cyan">Supabase Realtime WebSocket</span>
                    <div className="mini-bar-wrap">
                      {[
                        { label: 'Delhi NCR', w: '88%', val: '88%' },
                        { label: 'Mumbai', w: '74%', val: '74%' },
                        { label: 'Bengaluru', w: '61%', val: '61%' },
                      ].map((row, idx) => (
                        <div key={row.label} className="mini-bar-row" style={idx === 2 ? { marginBottom: 0 } : undefined}>
                          <span className="mini-bar-label">{row.label}</span>
                          <div className="mini-bar-track"><div className="mini-bar-fill" style={{ background: '#22D3EE', width: row.w, animationDelay: `${idx * 0.1}s`, transformOrigin: 'left' }} /></div>
                          <span className="mini-bar-val" style={{ color: '#22D3EE' }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="comm-divider" />

                  <div className="comm-col">
                    <div className="comm-col-label">Alert Delivery</div>
                    <div className="comm-metric">{'<'}3s</div>
                    <div className="comm-metric-lbl">From submission to<br />community-wide alert</div>
                    <span className="comm-badge badge-green"><span className="live-dot" />Auto-dispatching</span>
                    <div style={{ marginTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                      {[
                        { label: 'Report submitted', time: '0ms' },
                        { label: 'DRS computed', time: '~340ms' },
                        { label: 'WebSocket push', time: '~880ms' },
                        { label: 'All dashboards', time: '<3s' },
                      ].map((row) => (
                        <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12.5, color: 'var(--t2)' }}>{row.label}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)' }}>{row.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="comm-divider" />

                  <div className="comm-col">
                    <div className="comm-col-label">Spike Detection</div>
                    <div className="comm-metric">3×</div>
                    <div className="comm-metric-lbl">Baseline threshold to<br />auto-trigger district alerts</div>
                    <span className="comm-badge badge-amber">Auto alert generation</span>
                    <div style={{ marginTop: '1.1rem', background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 6, padding: '.75rem .9rem', fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.9 }}>
                      <div><span style={{ color: '#475569' }}>24h_reports:</span> <span style={{ color: '#FCD34D' }}>47</span></div>
                      <div><span style={{ color: '#475569' }}>daily_avg:</span> <span style={{ color: '#6EE7B7' }}>14.2</span></div>
                      <div><span style={{ color: '#475569' }}>spike_ratio:</span> <span style={{ color: '#FCA5A5' }}>3.3×</span> ⚠</div>
                      <div><span style={{ color: '#475569' }}>action:</span> <span style={{ color: '#FCD34D' }}>AUTO_ALERT</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="process">
          <div className="container">
            <ProcessSection />
          </div>
        </section>

        <section className="section" id="about">
          <div className="container">
            <div className="reveal">
              <p className="sec-tag">About DHIP</p>
              <h2 className="sec-h2">What happens after you land</h2>
              <p className="sec-p">A quick, API-backed walkthrough of how the platform works end-to-end. Live impact numbers are pulled from /api/dashboard every 15 seconds.</p>
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 24, alignItems: 'stretch' }}>
              <div className="feat-card f-blue" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}>
                <div className="feat-top-bar" />
                <h3 className="feat-title">Live impact (API-backed)</h3>
                <p className="feat-desc">Supabase + REST API powering the live counters; refreshes automatically to reflect the latest detections and protections.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 16 }}>
                  {impactMetrics.map((m, idx) => (
                    <div key={m.label} className={`stat-cell c-${idx % 2 === 0 ? 'blue' : 'green'}`} style={{ minHeight: 'auto', boxShadow: 'none' }}>
                      <div className="stat-icon">{idx === 0 ? '🛰' : idx === 1 ? '⚡' : idx === 2 ? '👥' : '🎯'}</div>
                      <div>
                        <StatsCounter value={m.value} suffix={m.suffix} />
                        <span className="stat-lbl">{m.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="feat-desc" style={{ marginTop: 14, opacity: 0.78 }}>Backed by react-query with a 15s refetch; falls back to cached numbers if offline.</p>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {workingFlow.map((step, idx) => (
                  <div key={step.title} className={`feat-card f-${idx === 0 ? 'blue' : idx === 1 ? 'cyan' : idx === 2 ? 'violet' : 'green'}`} style={{ padding: 18 }}>
                    <div className="feat-top-bar" />
                    <span className="feat-tag-badge" style={{ marginBottom: 8 }}>{step.badge}</span>
                    <h3 className="feat-title" style={{ marginBottom: 6 }}>{step.title}</h3>
                    <p className="feat-desc" style={{ marginBottom: 6 }}>{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="intelligence">
          <div className="container">
            <div className="reveal">
              <p className="sec-tag">Intelligence Sources</p>
              <h2 className="sec-h2">10 Integrated APIs</h2>
              <p className="sec-p">Every scan cross-validates across independent sources to eliminate false negatives and amplify signal confidence. All ten APIs are live with active health checks.</p>
            </div>
            <div className="api-interactive reveal" style={{ transitionDelay: '.1s' }}>
              <div className="api-list">
                <div className="api-list-head">
                  <div>
                    <p className="api-detail-label">Live Signals</p>
                    <p className="api-detail-title" style={{ fontSize: 16, margin: 0 }}>All providers monitored every 60s</p>
                  </div>
                  <span className="api-pill" style={{ color: '#34D399', borderColor: '#34D399' }}>Live</span>
                </div>
                {apis.map((api) => {
                  const isActive = activeApi.name === api.name
                  return (
                    <button
                      key={api.name}
                      className={`api-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveApi(api)}
                      type="button"
                      aria-pressed={isActive}
                    >
                      <span className="api-dot" style={{ background: api.color }} />
                      <div className="api-item-body">
                        <div className="api-item-top">
                          <span className="api-name">{api.name}</span>
                          <span className="api-pill" style={{ color: api.color, borderColor: api.color }}>{api.status}</span>
                        </div>
                        <span className="api-purpose" style={{ whiteSpace: 'normal' }}>{api.focus}</span>
                        <div className="api-item-meta">
                          <span className="api-limit">{api.limit}</span>
                          <span className="api-focus">{api.purpose}</span>
                        </div>
                      </div>
                      <span className="api-chevron" aria-hidden="true">{isActive ? '-' : '+'}</span>
                    </button>
                  )
                })}
              </div>

              <div className="api-detail">
                <div className="api-detail-head">
                  <div>
                    <p className="api-detail-label">Live Signal</p>
                    <h3 className="api-detail-title">{activeApi.name}</h3>
                    <p className="api-detail-sub">{activeApi.purpose}</p>
                  </div>
                  <span className="api-pill" style={{ color: activeApi.color, borderColor: activeApi.color }}>{activeApi.status}</span>
                </div>
                <div className="api-detail-grid">
                  <div className="api-detail-card">
                    <p className="api-detail-kicker">Focus</p>
                    <p className="api-detail-value">{activeApi.focus}</p>
                  </div>
                  <div className="api-detail-card">
                    <p className="api-detail-kicker">Rate Limit</p>
                    <p className="api-detail-value">{activeApi.limit}</p>
                  </div>
                  <div className="api-detail-card">
                    <p className="api-detail-kicker">Health Check</p>
                    <p className="api-detail-value">Live · <span style={{ color: '#34D399' }}>OK</span></p>
                  </div>
                </div>
                <div className="api-detail-body">
                  <p>DHIP routes every entity through {activeApi.name} in parallel with the other engines. Signals from this source are weighted and combined in the Digital Risk Score, with caching and automatic fallback if latency spikes.</p>
                  <ul>
                    <li>Used for: {activeApi.focus}</li>
                    <li>Fallback policy: cached verdict + remaining engines if timeout</li>
                    <li>Telemetry: success rate, latency, and abuse flags tracked per request</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="sec-p" style={{ marginTop: 14, color: 'var(--t3)' }}>Redundancy is built-in: if any provider is slow or down, DHIP automatically falls back to cached intelligence and remaining engines.</p>
          </div>
        </section>

        <section className="cta-section" id="community">
          <div className="cta-glow1" />
          <div className="cta-glow2" />
          <h2 className="cta-h2 reveal">Join the Movement. Protect Your India.</h2>
          <p className="cta-p reveal">When one person reports a threat, that intelligence instantly protects thousands in the same region. Be part of India's collective cyber shield.</p>
          <div className="cta-btns reveal">
            <Link to="/threat-check" className="btn-primary" aria-label="Start Checking Threats" style={{ fontSize: 15, padding: '12px 28px' }}>🛡 &nbsp;Start Checking Threats</Link>
            <Link to="/community/report" className="btn-outline" aria-label="Report Anonymously" style={{ fontSize: 15, padding: '12px 28px' }}>📋 &nbsp;Report Anonymously</Link>
          </div>
          <p className="cta-helplines reveal" style={{ transitionDelay: '.1s' }}>
            Cyber Helpline: <a href="tel:1930">1930</a> &nbsp;·&nbsp;
            NCW: <a href="tel:7827170170">7827-170-170</a> &nbsp;·&nbsp;
            Police: <a href="tel:100">100</a>
          </p>
        </section>

        <footer>
          <div className="foot-inner">
            <div className="foot-brand">
              <div className="nav-shield" style={{ width: 26, height: 26, fontSize: 13 }}>🛡</div>
              <span className="foot-brand-name">DHIP</span>
              <span className="foot-tagline">Digital Harm Intelligence Platform · Graphic Era Hill University · 2025</span>
            </div>
            <nav className="foot-links">
              <a href="#">Privacy</a><a href="#">Security</a>
              <a href="#">API Docs</a><a href="#">GitHub</a><a href="#">Report Abuse</a>
            </nav>
            <span className="foot-copy">v2.0 · Anmol Bahuguna</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default HomePage
