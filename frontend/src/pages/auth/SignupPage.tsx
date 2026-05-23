import { zodResolver } from '@hookform/resolvers/zod'
import confetti from 'canvas-confetti'
import { Check, Eye, EyeOff, Lock, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { Suspense, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { FloatingShield } from '../../components/3d/FloatingShield'
import { FloatingLabel } from '../../components/ui/FloatingLabel'
import { GradientButton } from '../../components/ui/GradientButton'
import { PasswordStrengthBar } from '../../components/ui/PasswordStrengthBar'
import { indiaRegions } from '../../lib/indiaRegions'
import { useAuth } from '../../hooks/useAuth'

const schema = z.object({
  fullName: z.string().min(2).max(60),
  email: z.string().email(),
  phone: z.string().regex(/^[+]?[0-9]{10,13}$/).optional().or(z.literal('')),
  state: z.string().min(1),
  district: z.string().min(2).max(80),
  password: z.string().min(8).regex(/[A-Z]/, 'Must contain an uppercase letter').regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((value) => value, 'You must accept terms'),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupInput = z.infer<typeof schema>

type Step = 1 | 2 | 3

export function SignupPage() {
  const { user, signup, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const returnUrl = new URLSearchParams(location.search).get('returnUrl')
  const [step, setStep] = useState<Step>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    register,
    trigger,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(schema), mode: 'onChange' })

  const canRenderCanvas = typeof window !== 'undefined' && 'ResizeObserver' in window

  const passwordStrength = useWatch({ control, name: 'password' }) || ''

  const stepValidity = useMemo(() => ({
    1: ['fullName', 'email'] as const,
    2: ['phone', 'state', 'district'] as const,
    3: ['password', 'confirmPassword', 'terms'] as const,
  }), [])

  if (user) return <Navigate to="/" replace />

  const goNext = async () => {
    const valid = await trigger(stepValidity[step], { shouldFocus: true })
    if (valid) setStep((value) => (Math.min(3, value + 1) as Step))
  }

  const submit = async (values: SignupInput) => {
    try {
      await signup(values.email, values.password, values.fullName, {
        phone: values.phone,
        district: values.district,
        state: values.state,
      })
      confetti({ particleCount: 120, spread: 80, colors: ['#0066FF', '#8B5CF6', '#00F5FF'] })
      toast.success('Account created! Check email to verify.')
      navigate('/auth/login', { replace: true, state: { from: returnUrl || '/' } })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup failed')
    }
  }

  return (
    <section className="min-h-screen bg-[#030712]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden border-r border-white/10 lg:block">
          {canRenderCanvas ? (
            <Canvas camera={{ position: [0, 0, 4.5] }}>
              <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <pointLight position={[2, 2, 2]} intensity={1.1} color="#0066FF" />
                <FloatingShield size={1.1} color="#8B5CF6" speed={0.004} interactive />
              </Suspense>
            </Canvas>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#101530] to-[#1b1440]" />
          )}
          <div className="pointer-events-none absolute inset-0 p-10">
            <h1 className="text-4xl font-black text-white">Join 50,000+ Indians</h1>
            <p className="mt-2 text-white/60">Build safer digital communities with shared intelligence.</p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-12">
          <form onSubmit={handleSubmit(submit)} className="w-full max-w-sm space-y-4">
            <div className="mb-3 text-center lg:text-left">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF] to-[#8B5CF6]">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Create your account</h2>
            </div>

            <div className="mb-2 flex items-center justify-between text-xs text-white/50">
              {['Account', 'Location', 'Security'].map((label, idx) => {
                const current = idx + 1
                const done = step > current
                const active = step === current
                return (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <span className={done ? 'flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white' : active ? 'flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white' : 'flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-white/50'}>
                      {done ? <Check className="h-4 w-4" /> : current}
                    </span>
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>

            {step === 1 ? (
              <>
                <FloatingLabel id="signup-full-name" label="Full Name" placeholder="Your full name" icon={<User className="h-4 w-4" />} error={errors.fullName?.message} {...register('fullName')} />
                <FloatingLabel id="signup-email" label="Email" placeholder="you@example.com" type="email" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
                <button type="button" onClick={goNext} className="w-full rounded-xl bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] py-3 font-semibold text-white">Continue →</button>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <FloatingLabel id="signup-phone" label="Phone" placeholder="+91XXXXXXXXXX" icon={<Phone className="h-4 w-4" />} error={errors.phone?.message} {...register('phone')} />
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.15em] text-white/50">State / UT</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><MapPin className="h-4 w-4" /></span>
                    <select className="input-base pl-10" {...register('state')}>
                      <option value="">Select your state/region</option>
                      {indiaRegions.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  {errors.state ? <p className="text-xs text-red-400">State is required</p> : null}
                </div>
                <FloatingLabel id="signup-district" label="District" placeholder="District" icon={<MapPin className="h-4 w-4" />} error={errors.district?.message} {...register('district')} />
                <p className="text-xs text-white/50">This helps us send regional threat alerts.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-white/15 py-3 text-sm text-white/80">← Back</button>
                  <button type="button" onClick={goNext} className="rounded-xl bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] py-3 text-sm font-semibold text-white">Continue →</button>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.15em] text-white/50">Password</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><Lock className="h-4 w-4" /></span>
                    <input className="input-base pl-10 pr-10" placeholder="Password" type={showPassword ? 'text' : 'password'} {...register('password')} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={passwordStrength} />
                  {errors.password ? <p className="text-xs text-red-400">{errors.password.message}</p> : null}
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.15em] text-white/50">Confirm Password</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><Lock className="h-4 w-4" /></span>
                    <input className="input-base pl-10 pr-10" placeholder="Confirm password" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} />
                    <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword ? <p className="text-xs text-red-400">{errors.confirmPassword.message}</p> : null}
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" {...register('terms')} className="accent-blue-600" />
                  I agree to Terms of Service and Privacy Policy
                </label>
                {errors.terms ? <p className="text-xs text-red-400">{errors.terms.message}</p> : null}

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-white/15 py-3 text-sm text-white/80">← Back</button>
                  {error ? <p className="text-sm text-red-400 text-center">{error}</p> : null}
                  <GradientButton className="w-full" type="submit" loading={isSubmitting || isLoading} disabled={isSubmitting || isLoading}>{isSubmitting || isLoading ? 'Creating account...' : 'Create Account'}</GradientButton>
                </div>
              </>
            ) : null}

            <p className="pt-2 text-center text-sm text-white/60">Already have an account? <Link to="/auth/login" className="text-blue-400">Sign In</Link></p>
          </form>
        </main>
      </div>
    </section>
  )
}

export default SignupPage
