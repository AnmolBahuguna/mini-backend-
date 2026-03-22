import { motion } from 'framer-motion'
import { HeartHandshake, LockKeyhole, Bot, Activity } from 'lucide-react'
import { useTypewriter } from '../../hooks/useTypewriter'
import { GlassCard } from '../ui/GlassCard'

const cardAnim = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export function BentoGrid() {
  const aiText = useTypewriter({
    text: 'Analyzing indicators... threat confidence 94.3% | Pattern overlap with known phishing kit.',
    speed: 22,
    startDelay: 250,
  })

  return (
    <section className="page-wrap py-16">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Core Capabilities</p>
        <h2 className="mt-2 text-4xl font-black text-slate-100">Built as a Premium Intelligence Grid</h2>
        <p className="mt-3 text-sm text-slate-400">Explore what DHIP can do with clear, interactive safety tools.</p>
      </div>

      <div className="grid auto-rows-[minmax(180px,auto)] gap-4 lg:grid-cols-3">
        <motion.div {...cardAnim} className="lg:col-span-2">
          <GlassCard className="h-full border-sky-400/20 bg-[#0d1526]/85 text-slate-100 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Threat Intelligence Scanner</h3>
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-300"><span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />LIVE</span>
            </div>
            <div className="rounded-xl border border-sky-400/15 bg-[#111e35] p-4">
              <p className="font-mono text-sm text-slate-300">sbi-secure-login.xyz</p>
              <div className="mt-3 h-2 rounded-full bg-slate-700">
                <div className="h-2 w-[85%] rounded-full bg-gradient-to-r from-amber-400 to-red-500 glow-red" />
              </div>
              <p className="mt-2 text-xs text-red-300">DRS: 8.5 / 10 (High Risk)</p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div {...cardAnim} className="lg:row-span-2">
          <GlassCard className="h-full border-sky-400/20 bg-[#0d1526]/85 text-slate-100 shadow-sm">
            <h3 className="mb-3 text-lg font-bold">Regional Threat Map</h3>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 24 }).map((_, index) => (
                <div key={index} className={index % 4 === 0 ? 'h-6 rounded bg-red-500/40' : index % 3 === 0 ? 'h-6 rounded bg-amber-500/40' : 'h-6 rounded bg-emerald-500/40'} />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">Live data from 28 states</p>
          </GlassCard>
        </motion.div>

        <motion.div {...cardAnim}>
          <GlassCard className="h-full border-sky-400/20 bg-[#0d1526]/85 text-slate-100 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-violet-300"><Bot className="h-4 w-4" /> OpenRouter AI</div>
            <h3 className="text-lg font-bold">AI Analysis</h3>
            <p className="mt-3 min-h-16 text-sm text-slate-300">{aiText}</p>
          </GlassCard>
        </motion.div>

        <motion.div {...cardAnim}>
          <GlassCard className="h-full border-sky-400/20 bg-[#0d1526]/85 text-slate-100 shadow-sm">
            <h3 className="text-lg font-bold">Community Intelligence</h3>
            <div className="mt-3 flex -space-x-2">
              {['A', 'R', 'K', 'P', 'M', '+'].map((letter) => (
                <div key={letter} className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/20 bg-[#111e35] text-xs font-bold text-sky-300">{letter}</div>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-300">+12,847 reports submitted</p>
          </GlassCard>
        </motion.div>

        <motion.div {...cardAnim}>
          <GlassCard className="h-full border-violet-400/25 bg-violet-500/10 text-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-violet-300"><HeartHandshake className="h-5 w-5 animate-pulse" /> Women Safety Hub</div>
            <p className="mt-3 text-sm text-slate-200">Safe space. Anonymous. Encrypted.</p>
            <p className="mt-1 text-xs text-slate-400">NCW: 7827-170-170</p>
          </GlassCard>
        </motion.div>

        <motion.div {...cardAnim} className="lg:col-span-2">
          <GlassCard className="h-full border-sky-400/20 bg-[#0d1526]/85 text-slate-100 shadow-sm">
            <div className="mb-2 flex items-center gap-2"><Activity className="h-4 w-4 text-sky-300" /> Digital Risk Score — How it works</div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={i < 3 ? 'h-3 rounded bg-emerald-400' : i < 6 ? 'h-3 rounded bg-amber-400' : 'h-3 rounded bg-red-500'} />
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div {...cardAnim} className="lg:col-span-1">
          <GlassCard className="h-full border-sky-400/20 bg-[#0d1526]/85 text-slate-100 shadow-sm">
            <div className="mb-2 flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-sky-300" /> Evidence Vault</div>
            <p className="text-sm text-slate-300">AES-256 encrypted evidence with optional blockchain timestamping.</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="rounded border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-sky-300">AES-256</span>
              <span className="rounded border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-violet-300">Blockchain</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}

export default BentoGrid
