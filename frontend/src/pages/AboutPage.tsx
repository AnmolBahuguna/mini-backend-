import { Building2, Flag, Shield, Target, Users } from 'lucide-react'

const principles = [
  {
    icon: Shield,
    title: 'Safety by Design',
    description: 'Security and privacy are treated as first-class product requirements from day one.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Shared threat intelligence helps protect people beyond individual incidents.',
  },
  {
    icon: Target,
    title: 'Actionable Defense',
    description: 'Every signal should result in clear next steps, not just technical noise.',
  },
]

const milestones = [
  { year: '2024', title: 'Concept Initiated', detail: 'Focused on India-specific cyber harm patterns and response gaps.' },
  { year: '2025', title: 'Core Modules Released', detail: 'Threat check, community reporting, and alerts were introduced.' },
  { year: '2026', title: 'DHIP v2 Experience', detail: 'Unified, modern UX across safety hubs, vault, and intelligence surfaces.' },
]

export function AboutPage() {
  return (
    <div>
      <section className="bg-[linear-gradient(160deg,#0A0F1E_0%,#121f36_45%,#1f2d4b_100%)] py-14">
        <div className="page-wrap text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Who We Are</p>
          <h1 className="mt-2 text-4xl font-black text-white md:text-5xl">About DHIP</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-gray-300 md:text-base">
            DHIP (Digital Harm Intelligence Platform) is built to help people detect, report, and prevent cyber harm through collective intelligence.
          </p>
        </div>
      </section>

      <section className="page-wrap py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
            <Flag className="h-6 w-6 text-blue-300" />
            <h2 className="mt-3 text-lg font-bold text-white">Mission</h2>
            <p className="mt-2 text-sm text-gray-300">Shift cyber safety from reactive response to predictive prevention for everyday users.</p>
          </article>
          <article className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
            <Building2 className="h-6 w-6 text-violet-300" />
            <h2 className="mt-3 text-lg font-bold text-white">Approach</h2>
            <p className="mt-2 text-sm text-gray-300">Blend AI-assisted signals, verified reports, and practical reporting workflows.</p>
          </article>
          <article className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
            <Users className="h-6 w-6 text-emerald-300" />
            <h2 className="mt-3 text-lg font-bold text-white">Impact</h2>
            <p className="mt-2 text-sm text-gray-300">Support safer decisions at scale with fast access to trustable threat intelligence.</p>
          </article>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
                <Icon className="h-5 w-5 text-blue-300" />
                <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-300">{item.description}</p>
              </article>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-gray-700 bg-gray-800/60 p-6">
          <h2 className="text-xl font-bold text-white">Journey</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {milestones.map((milestone) => (
              <div key={milestone.year} className="rounded-xl border border-gray-700 bg-gray-900/60 p-4">
                <p className="text-sm font-black text-blue-300">{milestone.year}</p>
                <p className="mt-1 text-sm font-semibold text-white">{milestone.title}</p>
                <p className="mt-2 text-xs text-gray-400">{milestone.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
