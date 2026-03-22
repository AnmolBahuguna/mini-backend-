import { zodResolver } from '@hookform/resolvers/zod'
import { Canvas } from '@react-three/fiber'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { FloatingShield } from '../../components/3d/FloatingShield'
import { FloatingLabel } from '../../components/ui/FloatingLabel'
import { GradientButton } from '../../components/ui/GradientButton'
import { useAuth } from '../../store/AuthContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional(),
})

type LoginInput = z.infer<typeof schema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(schema) })

  const canRenderCanvas = typeof window !== 'undefined' && 'ResizeObserver' in window

  if (user) return <Navigate to="/" replace />

  const submit = async (values: LoginInput) => {
    try {
      await signIn(values.email, values.password)
      navigate((location.state as { from?: string })?.from || '/')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid credentials')
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
                <FloatingShield size={1.1} color="#0066FF" speed={0.004} interactive />
              </Suspense>
            </Canvas>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0b1228] to-[#12162b]" />
          )}

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-10">
            <div>
              <h1 className="text-4xl font-black text-white">DHIP</h1>
              <p className="mt-2 text-white/60">Protecting India&apos;s Digital Future</p>
            </div>
            <div className="space-y-2 text-sm text-white/75">
              <p>✓ Real-time threat detection</p>
              <p>✓ AI-powered analysis</p>
              <p>✓ 100% anonymous reporting</p>
            </div>
            <p className="text-sm text-white/50">Trusted by 50,000+ users across India</p>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-12">
          <form onSubmit={handleSubmit(submit)} className="w-full max-w-sm space-y-4">
            <div className="mb-6 text-center lg:text-left">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF] to-[#8B5CF6]">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Sign in to DHIP</h2>
              <p className="mt-1 text-sm text-white/60">New here? <Link to="/auth/signup" className="text-blue-400 hover:text-blue-300">Create free account</Link></p>
            </div>

            <FloatingLabel id="login-email" label="Email address" placeholder="you@example.com" type="email" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />

            <div className="space-y-1">
              <label htmlFor="login-password" className="text-xs uppercase tracking-[0.15em] text-white/50">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><Lock className="h-4 w-4" /></span>
                <input id="login-password" className="input-base pl-10 pr-10" placeholder="Password" type={showPassword ? 'text' : 'password'} {...register('password')} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? <p className="text-xs text-red-400">{errors.password.message}</p> : null}
            </div>

            <div className="flex items-center justify-between text-sm text-white/60">
              <label className="inline-flex items-center gap-2"><input type="checkbox" {...register('remember')} className="accent-blue-600" /> Remember me for 30 days</label>
              <Link to="/auth/forgot-password" className="text-blue-400 hover:text-blue-300">Forgot password?</Link>
            </div>

            <GradientButton className="w-full" type="submit" loading={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </GradientButton>

            <div className="text-center text-sm text-white/60">Don&apos;t have an account? <Link to="/auth/signup" className="text-blue-400">Create free account</Link></div>
          </form>
        </main>
      </div>
    </section>
  )
}

export default LoginPage
