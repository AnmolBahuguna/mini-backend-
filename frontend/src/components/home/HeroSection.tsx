import { ChevronDown, Play, ShieldCheck } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { GradientButton } from '../ui/GradientButton'
import { FloatingShield } from '../3d/FloatingShield'
import { ParticleField } from '../3d/ParticleField'
import { Link } from 'react-router-dom'

const wordsLine1 = ['Protect', "India's"]
const wordsLine2 = ['Digital', 'Future']
const quickScans = ['sbi-secure-login.xyz', '+91-9834512099', 'reward@upi-alert.in']

export function HeroSection() {
  const [selectedScan, setSelectedScan] = useState(quickScans[0])

  const stats = useMemo(
    () => [
      { value: '12,847+', label: 'threats detected' },
      { value: '94.3%', label: 'accuracy rate' },
      { value: '< 2 sec', label: 'response time' },
    ],
    [],
  )

  return (
    <section className="noise grid-bg relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_8%_12%,rgba(56,189,248,0.2),transparent_42%),radial-gradient(circle_at_92%_18%,rgba(99,102,241,0.2),transparent_36%),linear-gradient(180deg,#020817_0%,#0a1628_56%,#020817_100%)]">
      <div className="absolute inset-0 -z-10">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 55 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.35} />
            <directionalLight position={[2, 2, 2]} intensity={1} color="#38bdf8" />
            <ParticleField count={2600} color="#38bdf8" speed={0.0035} mouseInteractive />
            <FloatingShield size={0.9} color="#0066FF" speed={0.003} interactive />
          </Suspense>
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[#020817]/30" />

      <div className="page-wrap relative z-10 flex min-h-screen flex-col items-center justify-center py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.15)]"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-sky-300" />
          AI-Powered Cyber Intelligence
        </motion.div>

        <h1 className="text-center text-[clamp(56px,7vw,112px)] font-black leading-[0.95] tracking-tight">
          <span className="block text-slate-100">
            {wordsLine1.map((word, index) => (
              <motion.span key={word} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1 }} className="mr-4 inline-block">
                {word}
              </motion.span>
            ))}
          </span>
          <span className="gradient-text block">
            {wordsLine2.map((word, index) => (
              <motion.span key={word} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.1 }} className="mr-4 inline-block">
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 max-w-2xl text-xl text-slate-300"
        >
          AI-powered threat intelligence that warns you BEFORE the attack.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <GradientButton icon={ShieldCheck}>Start Threat Scan</GradientButton>
          <GradientButton variant="outline" icon={Play}>Watch Demo</GradientButton>
        </motion.div>

        <div className="mt-6 w-full max-w-3xl rounded-2xl border border-sky-400/20 bg-[#0d1526]/85 p-4 shadow-[0_20px_50px_-35px_rgba(56,189,248,0.4)] backdrop-blur">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quick Threat Check</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickScans.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedScan(item)}
                className={selectedScan === item ? 'rounded-full border border-sky-400/50 bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-300' : 'rounded-full border border-sky-400/20 bg-[#111e35] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-sky-400/45 hover:text-sky-300'}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-400/20 bg-[#111e35]/90 px-3 py-2 text-xs">
            <span className="font-mono text-slate-200">{selectedScan}</span>
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-300">Potential Risk · Review Suggested</span>
            <Link to="/threat-check" className="text-sky-300 hover:text-sky-200">Open full scanner →</Link>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 + index * 0.15, type: 'spring', stiffness: 140 }}
              className="rounded-2xl border border-sky-400/20 bg-[#0d1526]/80 px-6 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-[0_10px_25px_rgba(2,8,23,0.45)]"
            >
              <p className="text-2xl font-extrabold text-slate-100">{stat.value}</p>
              <p className="text-xs uppercase tracking-widest text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="absolute bottom-8 flex flex-col items-center gap-1 text-slate-400">
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
