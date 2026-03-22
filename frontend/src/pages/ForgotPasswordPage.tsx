import { useState } from 'react'
import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 via-[#0A0F1E] to-violet-900">
      <div className="page-wrap flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900/80 p-8">
          {!sent ? (
            <>
              <h1 className="text-3xl font-bold text-white">Reset Password</h1>
              <p className="mt-2 text-sm text-gray-400">Enter your email to receive a reset link.</p>
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="input-base mt-5" type="email" placeholder="you@example.com" />
              <button onClick={() => setSent(true)} className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">Send Reset Link</button>
            </>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white">Check your inbox!</h2>
              <p className="mt-2 text-sm text-gray-300">A reset link has been sent to {email}.</p>
            </div>
          )}

          <Link to="/auth/login" className="mt-6 inline-block text-sm text-blue-400">← Back to Sign In</Link>
        </div>
      </div>
    </section>
  )
}
