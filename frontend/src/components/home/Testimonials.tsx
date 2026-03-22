import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

const testimonials = [
  { name: 'Priya Sharma', role: 'Teacher', city: 'Lucknow', quote: 'DHIP flagged a fake UPI request before I could transfer money.', badge: 'Phishing Detection' },
  { name: 'Rahul Verma', role: 'Business Owner', city: 'Mumbai', quote: 'We blocked a malicious domain in minutes and avoided account compromise.', badge: 'Domain Intelligence' },
  { name: 'Ananya Singh', role: 'Student', city: 'Delhi', quote: 'Women Safety Hub gave me clear steps and confidence to report safely.', badge: 'Safety Support' },
  { name: 'Mohan Das', role: 'Retired Officer', city: 'Chennai', quote: 'Digital arrest warning helped me identify scam pressure tactics instantly.', badge: 'Scam Alert' },
  { name: 'Kavya Reddy', role: 'Freelancer', city: 'Bangalore', quote: 'A fake job offer was caught in seconds using the threat scanner.', badge: 'Job Scam Detection' },
]

export function Testimonials() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex((v) => (v + 1) % testimonials.length), 4000)
    return () => clearInterval(timer)
  }, [])

  const active = testimonials[index]

  return (
    <section className="page-wrap py-16">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Social Proof</p>
        <h2 className="mt-2 text-4xl font-black text-slate-100">Trusted by users across India</h2>
      </div>

      <div className="mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.article
            key={active.name}
            initial={{ opacity: 0, rotateX: -8, y: 12 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, rotateX: 8, y: -12 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-sky-400/20 bg-[#0d1526]/90 p-8 shadow-[0_18px_40px_-30px_rgba(2,8,23,0.8)]"
          >
            <p className="mb-4 text-5xl text-blue-400">“</p>
            <p className="text-lg italic text-slate-200">{active.quote}</p>
            <div className="mt-6 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-100">{active.name}</p>
                <p className="text-sm text-slate-400">{active.role}, {active.city}</p>
              </div>
              <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">{active.badge}</span>
            </div>
            <div className="mt-4 flex gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
          </motion.article>
        </AnimatePresence>

        <div className="mt-5 flex justify-center gap-2">
          {testimonials.map((item, dotIndex) => (
            <button
              key={item.name}
              onClick={() => setIndex(dotIndex)}
              className={dotIndex === index ? 'h-2.5 w-7 rounded-full bg-sky-500' : 'h-2.5 w-2.5 rounded-full bg-slate-600'}
              aria-label={`Go to testimonial ${dotIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
