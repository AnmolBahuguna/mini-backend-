import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export function ForgotPasswordPage() {
  const schema = z.object({ email: z.string().email('Enter a valid email') })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<{ email: string }>({ resolver: zodResolver(schema), defaultValues: { email: '' } })
  const [submittedEmail, setSubmittedEmail] = useState('')

  const submit = async ({ email }: { email: string }) => {
    try {
      if (supabase) {
        await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/login` })
      }
      toast.success('If that email exists, a reset link is on the way')
      setSubmittedEmail(email)
      reset({ email })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send reset link right now'
      toast.error(message)
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 via-[#0A0F1E] to-violet-900">
      <div className="page-wrap flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900/80 p-8">
          {!isSubmitSuccessful ? (
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Reset Password</h1>
                <p className="mt-2 text-sm text-gray-400">Enter your email to receive a reset link.</p>
              </div>

              <div>
                <input {...register('email')} className="input-base" type="email" placeholder="you@example.com" />
                {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-60">
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white">Check your inbox!</h2>
              <p className="mt-2 text-sm text-gray-300">A reset link has been sent to {submittedEmail || 'your email'}.</p>
            </div>
          )}

          <Link to="/auth/login" className="mt-6 inline-block text-sm text-blue-400">← Back to Sign In</Link>
        </div>
      </div>
    </section>
  )
}
