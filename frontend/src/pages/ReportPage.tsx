import confetti from 'canvas-confetti'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PageHero } from '../components/layout/PageHero'
import { indiaRegions } from '../lib/indiaRegions'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { useOptionalAuth } from '../store/useAuthContext'

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
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useOptionalAuth()
  const user = auth?.user
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { anonymous: true },
  })

  const submit = async (values: FormInput) => {
    if (!user) {
      const returnUrl = encodeURIComponent(location.pathname)
      toast.error('Please sign in to submit a report')
      navigate(`/login${returnUrl ? `?returnUrl=${returnUrl}` : ''}`)
      return
    }

    try {
        const metadata = (user?.user_metadata || {}) as Record<string, string | undefined>
        const reporterName = metadata.full_name || metadata.name || user?.email

        const payload = {
          entity: values.entity,
          scamType: values.threatType,
          description: values.description,
          state: values.state,
          victimCount: values.victimCount ? Number(values.victimCount) : undefined,
          anonymous: values.anonymous,
          reporterName: values.anonymous ? undefined : reporterName,
          reporterEmail: values.anonymous ? undefined : user.email,
        }

      const { data } = await api.post('/api/reports/', payload)
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } })
      const message = (data as { message?: string; id?: string })?.message || 'Report submitted successfully'
      toast.success(message)
      reset({ anonymous: true, threatType: '', description: '', entity: '', state: '', victimCount: '' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit report right now'
      toast.error(message)
    }
  }

  return (
    <div>
      <PageHero title="Report a Threat" subtitle="Your report helps protect thousands of users across India" />
      <section className="page-wrap py-16">
        <form onSubmit={handleSubmit(submit)} className="card space-y-4">
          <button
            type="button"
            className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400 uppercase">Threat Type</label>
            <select className="input-base" {...register('threatType')}>
              <option value="">Select type</option>
              <option>URL/Link</option><option>Phone Number</option><option>UPI ID</option><option>App/Website</option><option>Loan App</option><option>Digital Arrest</option><option>Job Scam</option><option>Other</option>
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
