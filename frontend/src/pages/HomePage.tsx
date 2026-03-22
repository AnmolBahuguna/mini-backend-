import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShieldCheck, Radar, Users, Archive } from 'lucide-react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { StatsCounter } from '../components/ui/StatsCounter'
import { GradientButton } from '../components/ui/GradientButton'

export function HomePage() {
  const statsQuery = useDashboardStats()

  const stats = statsQuery.data ?? {
    threatsDetected: 12847,
    activeAlerts: 312,
    protectedUsers: 50000,
    detectionAccuracy: 94.3,
  }

  const cards = [
    {
      icon: ShieldCheck,
      title: 'Threat Scanner',
      description: 'AI-driven detection for URLs, UPI IDs, phone numbers, and suspicious entities.',
    },
    {
      icon: Radar,
      title: 'Realtime Alerts',
      description: 'Region-first feed for high-severity campaigns with proactive warning windows.',
    },
    {
      icon: Users,
      title: 'Community Intel',
      description: 'Crowdsourced reports enriched with intelligence scoring and verification signals.',
    },
    {
      icon: Archive,
      title: 'Evidence Vault',
      description: 'Secure forensic storage workspace designed for legal and incident workflows.',
    },
  ]

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A0F1E] via-[#111827] to-[#1f1b4a] py-20">
        <div className="page-wrap relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl"
          >
            Proactive Threat Intelligence for Safer Digital Systems
          </motion.h1>
          <p className="mt-4 max-w-2xl text-base text-gray-300 md:text-lg">
            DHIP helps teams detect, verify, and respond to digital harm campaigns before impact scales.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/threat-check"><GradientButton>Open Threat Scanner</GradientButton></Link>
            <Link to="/alerts"><GradientButton variant="outline">View Alerts</GradientButton></Link>
            <Link to="/community"><GradientButton variant="purple">Community Feed</GradientButton></Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(37,99,235,0.2),transparent_40%)]" />
      </section>

      <section className="page-wrap mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-2xl bg-white/5" />
          ))
        ) : (
          <>
            <StatsCounter value={stats.threatsDetected} label="Threats Detected" />
            <StatsCounter value={stats.activeAlerts} label="Active Alerts" />
            <StatsCounter value={stats.protectedUsers} label="Protected Users" />
            <StatsCounter value={Math.round(stats.detectionAccuracy)} label="Detection Accuracy %" />
          </>
        )}
      </section>

      <section className="page-wrap mt-10 grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <motion.article
              key={card.title}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border border-white/10 bg-[#1F2937]/70 p-6 shadow-lg"
            >
              <Icon className="h-6 w-6 text-blue-300" />
              <h2 className="mt-3 text-xl font-bold text-white">{card.title}</h2>
              <p className="mt-2 text-sm text-gray-300">{card.description}</p>
            </motion.article>
          )
        })}
      </section>
    </div>
  )
}

export default HomePage
