import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { GeometricShape } from '../components/3d/GeometricShape'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientButton } from '../components/ui/GradientButton'

const features = [
  {
    title: 'Threat Scanner',
    description: 'Scan URLs, phone numbers, and UPI entities using multi-source intelligence.',
    bullets: ['Parallel API checks', 'DRS score in <2s', 'Actionable recommendations', 'One-click reporting'],
  },
  {
    title: 'Live Alerts',
    description: 'Push regional threat alerts before the attack reaches your area.',
    bullets: ['State-level updates', 'Severity prioritization', 'Rapid warning feed', 'Emergency contact actions'],
  },
  {
    title: 'Women Safety Hub',
    description: 'Trauma-informed tools, panic alert flows, and controlled escalation paths.',
    bullets: ['Anonymous mode', 'Helpline integration', 'Safe reporting', 'Evidence support'],
  },
  {
    title: 'Evidence Vault',
    description: 'Client-side encryption and optional blockchain timestamping for legal readiness.',
    bullets: ['AES-256 encryption', 'Tamper-resistant trail', 'File hash proofs', 'Secure access'],
  },
  {
    title: 'Community Intelligence',
    description: 'Transform individual reports into collective digital protection.',
    bullets: ['Crowd-sourced signals', 'Verification workflow', 'Pattern clustering', 'Mass warning distribution'],
  },
]

const integrations = ['VirusTotal', 'Google Safe Browsing', 'Secure Cloud APIs', 'Polygon', 'Twilio', 'OpenRouter']

export function FeaturesPage() {
  return (
    <div>
      <section className="noise relative overflow-hidden py-16">
        <div className="absolute inset-0 -z-10">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.45} />
              <pointLight position={[2, 2, 2]} color="#0066FF" intensity={1.1} />
              <group position={[-2, 0, 0]} scale={0.6}><GeometricShape geometry="icosahedron" color="#0066FF" wireframe speed={0.01} /></group>
              <group position={[2, -0.5, 0]} scale={0.5}><GeometricShape geometry="octahedron" color="#8B5CF6" wireframe speed={0.012} /></group>
              <group position={[0, 1.8, -0.5]} scale={0.4}><GeometricShape geometry="cube" color="#00F5FF" wireframe speed={0.014} /></group>
            </Suspense>
          </Canvas>
        </div>

        <div className="page-wrap text-center">
          <h1 className="text-4xl font-black text-white md:text-6xl">Everything you need to stay safe online</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-white/60">One platform. Ten threat intelligence sources. Zero compromise.</p>
        </div>
      </section>

      <section className="page-wrap py-14">
        <div className="space-y-8">
          {features.map((feature, index) => (
            <div key={feature.title} className={index % 2 === 0 ? 'grid gap-4 lg:grid-cols-2' : 'grid gap-4 lg:grid-cols-2'}>
              <GlassCard className={index % 2 === 0 ? '' : 'lg:order-2'}>
                <div className="h-56 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-500/10 p-4">
                  <div className="h-full rounded-xl border border-white/10 bg-black/35" />
                </div>
              </GlassCard>
              <GlassCard className={index % 2 === 0 ? '' : 'lg:order-1'}>
                <h2 className="text-3xl font-black text-white">{feature.title}</h2>
                <p className="mt-3 text-white/70">{feature.description}</p>
                <ul className="mt-4 space-y-2">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-sm text-white/80"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{bullet}</li>
                  ))}
                </ul>
                <div className="mt-5"><GradientButton>Try it free</GradientButton></div>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      <section className="page-wrap py-8">
        <GlassCard>
          <h3 className="text-2xl font-black">DHIP Comparison</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="pb-3">Capability</th>
                  <th className="pb-3">DHIP</th>
                  <th className="pb-3">Traditional</th>
                  <th className="pb-3">Other Apps</th>
                </tr>
              </thead>
              <tbody>
                {[
                  'AI Risk Scoring',
                  'Regional Alerts',
                  'Encrypted Evidence Vault',
                  'Women Safety Workflows',
                ].map((row) => (
                  <tr key={row} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">{row}</td>
                    <td className="py-3 text-emerald-400"><CheckCircle2 className="h-4 w-4" /></td>
                    <td className="py-3 text-red-400"><XCircle className="h-4 w-4" /></td>
                    <td className="py-3 text-amber-400">Partial</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </section>

      <section className="page-wrap pb-14 pt-8">
        <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Powered by</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {integrations.map((item) => (
            <div key={item} className="glass rounded-xl px-4 py-3 text-center text-sm font-medium text-white/70 transition hover:text-white">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default FeaturesPage
