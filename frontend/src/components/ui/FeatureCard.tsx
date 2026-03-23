import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface FeatureCardProps {
  icon: LucideIcon
  iconColor?: string
  title: string
  description: string
  className?: string
}

export function FeatureCard({ icon: Icon, iconColor = '#5cbfff', title, description, className }: FeatureCardProps) {
  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={clsx(
        'bg-gray-800/50 border border-gray-700 rounded-2xl p-6 transition-all duration-300',
        'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900/70 border border-gray-700">
          <Icon className="h-6 w-6" style={{ color: iconColor }} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.article>
  )
}

export default FeatureCard
