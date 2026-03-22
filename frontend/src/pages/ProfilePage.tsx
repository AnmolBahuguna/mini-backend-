import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../store/AuthContext'

type Tab = 'My Reports' | 'Saved Alerts' | 'Emergency Contacts' | 'Notifications' | 'Account Settings'

export function ProfilePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('My Reports')
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Aman', phone: '+919876543210', relationship: 'Brother' },
  ])
  const [draft, setDraft] = useState({ name: '', phone: '', relationship: '' })

  const rank = useMemo(() => (contacts.length > 3 ? 'Guardian' : 'Contributor'), [contacts.length])

  return (
    <div className="page-wrap py-16">
      <section className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
              {(user?.displayName || 'DU').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{user?.displayName || 'DHIP User'}</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <p className="text-xs text-gray-500">Joined {new Date(user?.joinedAt || Date.now()).toLocaleDateString()}</p>
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

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} className="input-base" placeholder="Name" />
                <input value={draft.phone} onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))} className="input-base" placeholder="Phone" />
                <input value={draft.relationship} onChange={(event) => setDraft((prev) => ({ ...prev, relationship: event.target.value }))} className="input-base" placeholder="Relationship" />
                <button
                  onClick={() => {
                    if (!draft.name || !draft.phone || !draft.relationship || contacts.length >= 5) return
                    setContacts((prev) => [...prev, { id: crypto.randomUUID(), ...draft }])
                    setDraft({ name: '', phone: '', relationship: '' })
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white"
                >
                  <Plus className="h-4 w-4" /> Add Contact
                </button>
              </div>
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
              <input className="input-base" defaultValue={user?.displayName} placeholder="Name" />
              <input className="input-base" defaultValue={user?.phone} placeholder="Phone" />
              <input className="input-base" defaultValue={user?.state} placeholder="State/Region" />
              <button className="rounded-xl bg-blue-600 px-5 py-3 text-white">Save Settings</button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
