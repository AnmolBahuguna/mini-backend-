import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { GeometricShape } from '../3d/GeometricShape'
import { GlassCard } from '../ui/GlassCard'

const steps = [
  { id: '01', title: 'REPORT', text: 'Someone reports a suspicious URL, phone number, or scam.', shape: 'icosahedron', color: '#0066FF' },
  { id: '02', title: 'SCAN', text: 'Backend fires multiple intelligence APIs in parallel.', shape: 'octahedron', color: '#00F5FF' },
  { id: '03', title: 'SCORE', text: 'AI computes Digital Risk Score 0-10 in under 2 seconds.', shape: 'cube', color: '#8B5CF6' },
  { id: '04', title: 'ALERT', text: 'Regional community receives warning before exposure.', shape: 'tetrahedron', color: '#F97316' },
  { id: '05', title: 'PROTECT', text: 'Users stay safe through collective intelligence loops.', shape: 'sphere', color: '#00FF88' },
] as const

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-sky-900/10 to-transparent py-16">
      <div className="page-wrap">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Workflow</p>
          <h2 className="mt-2 text-4xl font-black text-slate-100">How DHIP Works</h2>
          <p className="mt-2 text-sm text-slate-400">A simple flow that helps users detect risk early and respond quickly.</p>
        </div>

        <div className="flex snap-x gap-4 overflow-x-auto pb-3">
          {steps.map((step) => (
            <motion.div key={step.id} className="min-w-[280px] flex-1 snap-start" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <GlassCard className="relative h-full border-sky-400/20 bg-[#0d1526]/85 text-slate-100 shadow-sm">
                <span className="absolute right-4 top-2 text-6xl font-black text-slate-700/30">{step.id}</span>
                <div className="mb-3 h-40 overflow-hidden rounded-xl border border-sky-400/15 bg-[#111e35]">
                  <Canvas camera={{ position: [0, 0, 3] }}>
                    <Suspense fallback={null}>
                      <ambientLight intensity={0.6} />
                      <pointLight position={[2, 2, 2]} intensity={1.2} color={step.color} />
                      <GeometricShape geometry={step.shape === 'tetrahedron' ? 'octahedron' : step.shape} color={step.color} speed={0.02} />
                    </Suspense>
                  </Canvas>
                </div>
                <p className="text-xs font-semibold tracking-[0.2em] text-sky-300">{step.title}</p>
                <p className="mt-2 text-sm text-slate-300">{step.text}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
