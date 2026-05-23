import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

type Tab = 'My Reports' | 'Saved Alerts' | 'Emergency Contacts' | 'Notifications' | 'Account Settings'

export function ProfilePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('My Reports')
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Aman', phone: '+919876543210', relationship: 'Brother' },
  ])

  const contactSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string().regex(/^(\+?\d{10,13})$/, 'Enter a valid phone'),
    relationship: z.string().min(2, 'Relationship is required'),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', phone: '', relationship: '' },
  })

  const derivedProfile = useMemo(() => {
    const metadata = (user?.user_metadata || {}) as Record<string, string | undefined>
    const displayName = metadata.full_name || metadata.name || user?.email || 'DHIP User'
    const phone = metadata.phone || ''
    const state = metadata.state || ''
    const joinedAt = user?.created_at || '2024-01-01T00:00:00Z'
    return { displayName, phone, state, joinedAt }
  }, [user])

  const joinedDate = useMemo(() => {
    const source = derivedProfile.joinedAt || '2024-01-01T00:00:00Z'
    return new Date(source).toLocaleDateString()
  }, [derivedProfile.joinedAt])

  const rank = useMemo(() => (contacts.length > 3 ? 'Guardian' : 'Contributor'), [contacts.length])

  return (
    <div className="page-wrap py-16">
      <section className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
              {derivedProfile.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{derivedProfile.displayName}</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <p className="text-xs text-gray-500">Joined {joinedDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl bg-gray-900 p-3"><p className="font-bold text-white">14</p><p className="text-gray-400">Reports</p></div>
            <div className="rounded-xl bg-gray-900 p-3"><p className="font-bold text-white">9</p><p className="text-gray-400">Verified</p></div>
            <div className="rounded-xl bg-gray-900 p-3"><p className="font-bold text-white">{rank}</p><p className="text-gray-400">Rank</p></div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="card h-fit">
          {(['My Reports', 'Saved Alerts', 'Emergency Contacts', 'Notifications', 'Account Settings'] as Tab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={tab === item ? 'mb-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-left text-sm font-semibold text-white' : 'mb-2 w-full rounded-lg px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800'}>
              {item}
            </button>
          ))}
        </aside>

        <div className="card">
          {tab === 'My Reports' ? <p className="text-gray-300">Your submitted reports with status badges will appear here.</p> : null}
          {tab === 'Saved Alerts' ? <p className="text-gray-300">No saved alerts yet.</p> : null}

          {tab === 'Emergency Contacts' ? (
            <div>
              <h3 className="text-xl font-bold text-white">Emergency Contacts</h3>
              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400"><th className="py-2">Name</th><th className="py-2">Phone</th><th className="py-2">Relationship</th><th className="py-2">Action</th></tr>
                  </thead>
                  <tbody>
                    {contacts.map((item) => (
                      <tr key={item.id} className="border-t border-gray-700 text-gray-200">
                        <td className="py-2">{item.name}</td><td className="py-2 font-mono">{item.phone}</td><td className="py-2">{item.relationship}</td>
                        <td className="py-2"><button onClick={() => setContacts((prev) => prev.filter((contact) => contact.id !== item.id))} className="rounded-lg bg-red-600 p-2 text-white"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form
                className="mt-5 grid gap-3 md:grid-cols-4"
                onSubmit={handleSubmit((values) => {
                  if (contacts.length >= 5) {
                    toast.error('You can only store up to 5 contacts')
                    return
                  }
                  setContacts((prev) => [...prev, { id: crypto.randomUUID(), ...values }])
                  reset()
                  toast.success('Contact added')
                })}
              >
                <div>
                  <input {...register('name')} className="input-base" placeholder="Name" />
                  {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
                </div>
                <div>
                  <input {...register('phone')} className="input-base" placeholder="Phone" />
                  {errors.phone ? <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p> : null}
                </div>
                <div>
                  <input {...register('relationship')} className="input-base" placeholder="Relationship" />
                  {errors.relationship ? <p className="mt-1 text-xs text-red-400">{errors.relationship.message}</p> : null}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Add Contact'}
                </button>
              </form>
            </div>
          ) : null}

          {tab === 'Notifications' ? (
            <div className="space-y-3 text-gray-200">
              {['Email alerts', 'SMS alerts', 'Regional alerts', 'New threat types'].map((item) => (
                <label key={item} className="flex items-center justify-between rounded-xl border border-gray-700 p-3">
                  <span>{item}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-blue-600" />
                </label>
              ))}
            </div>
          ) : null}

          {tab === 'Account Settings' ? (
            <div className="space-y-4">
              <input className="input-base" defaultValue={derivedProfile.displayName} placeholder="Name" />
              <input className="input-base" defaultValue={derivedProfile.phone} placeholder="Phone" />
              <input className="input-base" defaultValue={derivedProfile.state} placeholder="State/Region" />
              <button className="rounded-xl bg-blue-600 px-5 py-3 text-white">Save Settings</button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
