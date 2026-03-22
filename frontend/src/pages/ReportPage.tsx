import confetti from 'canvas-confetti'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHero } from '../components/layout/PageHero'
import { indiaRegions } from '../lib/indiaRegions'

const schema = z.object({
  threatType: z.string().min(1, 'Threat type is required'),
  entity: z.string().min(1, 'Threat entity is required'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  state: z.string().min(1, 'State/Region is required'),
  victimCount: z.string().optional(),
  anonymous: z.boolean(),
})

type FormInput = z.infer<typeof schema>

export function ReportPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { anonymous: true },
  })

  const submit = async (_values: FormInput) => {
    await new Promise((resolve) => setTimeout(resolve, 900))
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } })
    reset()
  }

  return (
    <div>
      <PageHero title="Report a Threat" subtitle="Your report helps protect thousands of users across India" />
      <section className="page-wrap py-16">
        <form onSubmit={handleSubmit(submit)} className="card space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400 uppercase">Threat Type</label>
            <select className="input-base" {...register('threatType')}>
              <option value="">Select type</option>
              <option>URL/Link</option><option>Phone Number</option><option>UPI ID</option><option>App/Website</option><option>Other</option>
            </select>
            {errors.threatType ? <p className="mt-1 text-xs text-red-400">{errors.threatType.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400 uppercase">Threat Entity</label>
            <input className="input-base" {...register('entity')} placeholder="Enter suspicious URL / phone / UPI" />
            {errors.entity ? <p className="mt-1 text-xs text-red-400">{errors.entity.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400 uppercase">Description</label>
            <textarea className="input-base min-h-32" {...register('description')} placeholder="Describe what happened" />
            {errors.description ? <p className="mt-1 text-xs text-red-400">{errors.description.message}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400 uppercase">State/Region</label>
              <select className="input-base" {...register('state')}>
                <option value="">Select region</option>
                {indiaRegions.map((region) => <option key={region}>{region}</option>)}
              </select>
              {errors.state ? <p className="mt-1 text-xs text-red-400">{errors.state.message}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400 uppercase">Victim Count (optional)</label>
              <input className="input-base" type="number" min={1} {...register('victimCount')} />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-200">
            <input type="checkbox" {...register('anonymous')} className="accent-emerald-600" />
            Report anonymously (recommended)
          </label>

          <button disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-60" type="submit">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </section>
    </div>
  )
}
