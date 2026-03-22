import { ShieldCheck, Sparkles } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { GeometricShape } from '../3d/GeometricShape'
import { ParticleField } from '../3d/ParticleField'
import { GradientButton } from '../ui/GradientButton'

export function CTASection() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-gradient-to-b from-[#0a1628] to-[#020817] py-16">
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.45} />
            <pointLight position={[3, 3, 3]} intensity={1.1} color="#38bdf8" />
            <GeometricShape geometry="sphere" color="#0066FF" wireframe speed={0.005} />
            <ParticleField count={700} color="#00F5FF" speed={0.002} mouseInteractive />
          </Suspense>
        </Canvas>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[#020817]/35" />

      <div className="page-wrap flex min-h-[70vh] flex-col items-center justify-center text-center">
        <h2 className="max-w-4xl text-4xl font-black text-slate-100 md:text-6xl">Join 50,000+ Indians staying safe online</h2>
        <p className="mt-3 text-lg text-slate-300">Free forever. Anonymous. No data sold.</p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/auth/signup"><GradientButton icon={ShieldCheck}>Create Free Account</GradientButton></Link>
          <Link to="/features"><GradientButton variant="outline" icon={Sparkles}>See How It Works</GradientButton></Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-slate-300">
          <span className="rounded-full border border-sky-400/20 bg-[#111e35] px-3 py-1">🔒 AES-256 Encrypted</span>
          <span className="rounded-full border border-sky-400/20 bg-[#111e35] px-3 py-1">⛓️ Blockchain Verified</span>
          <span className="rounded-full border border-sky-400/20 bg-[#111e35] px-3 py-1">🛡️ Zero Data Sold</span>
        </div>
      </div>
    </section>
  )
}

export default CTASection
