import { motion } from 'framer-motion'
import type { PanicState } from '../../types/threat'

interface PanicButtonProps {
  state: PanicState
  onTrigger: () => void
}

const labelByState: Record<PanicState, string> = {
  idle: 'PANIC',
  requesting: 'REQUESTING',
  sending: 'SENDING',
  sent: 'SENT',
}

export function PanicButton({ state, onTrigger }: PanicButtonProps) {
  const isBusy = state !== 'idle'

  return (
    <motion.button
      onClick={onTrigger}
      disabled={isBusy}
      whileHover={{ scale: isBusy ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={state === 'sent'
        ? 'mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-700 text-lg font-black text-white shadow-xl'
        : 'mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-lg font-black text-white shadow-xl'}
    >
      {labelByState[state]}
    </motion.button>
  )
}
