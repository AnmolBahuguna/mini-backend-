import type { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  subtitle: string
  Icon?: LucideIcon
  gradientClassName?: string
}

export function PageHero({ title, subtitle, Icon, gradientClassName }: Props) {
  return (
    <section className={`border-b border-gray-800 py-16 md:py-24 ${gradientClassName || ''}`}>
      <div className="page-wrap">
        <div className="mx-auto max-w-3xl text-center">
          {Icon ? (
            <div className="mb-4 flex justify-center">
              <Icon className="h-10 w-10 text-blue-400" aria-hidden="true" />
            </div>
          ) : null}
          <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
          <p className="mt-4 text-base text-gray-300 md:text-lg">{subtitle}</p>
        </div>
      </div>
    </section>
  )
}
