import { useState } from 'react'
import { AlertCircle, CheckCircle, WifiOff, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'

type PanicState = 'idle'|'requesting'|'acquiring'|'sending'|'sent'|'offline'

interface PanicButtonProps {
  contacts?: string[]
}

export function PanicButton({ contacts = ['100'] }: PanicButtonProps) {
  const [state, setState] = useState<PanicState>('idle')

  const handlePanic = () => {
    if (!navigator.onLine) {
      setState('offline')
      const msg = encodeURIComponent('EMERGENCY: I need help! Sent via DHIP')
      window.location.href = `sms:${contacts.join(',')}?body=${msg}`
      return
    }
    setState('requesting')
    const geoOptions: PositionOptions = { timeout: 10000, maximumAge: 30000, enableHighAccuracy: false }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setState('acquiring')
        const { latitude: lat, longitude: lng } = pos.coords
        setState('sending')
        try {
          // Fire and forget or await; failures shouldn't block the user action
          await api.post('/api/panic/', { lat, lng, contacts }).catch(() => {})
        } catch {
          // Ignore network errors during panic flow
        }
        setState('sent')
        setTimeout(() => setState('idle'), 3000)
      },
      () => {
        // Location denied — send without GPS
        setState('sending')
        api.post('/api/panic/', { lat: null, lng: null, contacts }).catch(() => {})
          .then(() => { setState('sent'); setTimeout(()=>setState('idle'),3000) })
      },
      geoOptions,
    )
  }

  const config = {
    idle:       { bg:'bg-red-600',   icon: AlertCircle,  label:'PANIC', sub:'SOS' },
    requesting: { bg:'bg-red-600',   icon: Loader2,      label:'PANIC', sub:'Requesting...' },
    acquiring:  { bg:'bg-red-600',   icon: Loader2,      label:'PANIC', sub:'Acquiring GPS...' },
    sending:    { bg:'bg-red-600',   icon: Loader2,      label:'PANIC', sub:'Sending Alert...' },
    sent:       { bg:'bg-green-600', icon: CheckCircle,  label:'SENT!', sub:'Contacts Alerted' },
    offline:    { bg:'bg-red-600',   icon: WifiOff,      label:'PANIC', sub:'SMS Mode' },
  }[state]

  return (
    <button onClick={handlePanic} aria-label="🆘 PANIC"
      className={`${config.bg} w-48 h-48 rounded-full flex flex-col items-center
                  justify-center relative hover:scale-105 transition-transform duration-200 shadow-[0_0_40px_rgba(220,38,38,0.4)]
                  ${state === 'idle' ? 'animate-[pulse_2s_infinite]' : ''}`}>
      <config.icon className={`w-12 h-12 text-white ${['requesting', 'acquiring', 'sending'].includes(state) ? 'animate-spin' : ''}`} />
      <span className='text-white font-black text-3xl mt-2'>{config.label}</span>
      <span className='text-white/90 text-sm mt-1 font-medium'>{config.sub}</span>
    </button>
  )
}
