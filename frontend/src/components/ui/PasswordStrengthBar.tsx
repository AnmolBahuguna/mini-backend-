type Props = {
  password: string
}

function getStrength(password: string) {
  if (password.length < 8) return { label: 'Weak', color: 'bg-red-600', width: 'w-1/4' }
  const types = [/[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length
  if (password.length >= 12 && types >= 3) return { label: 'Very Strong', color: 'bg-emerald-600', width: 'w-full' }
  if (types >= 2) return { label: 'Strong', color: 'bg-yellow-500', width: 'w-3/4' }
  return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/4' }
}

export function PasswordStrengthBar({ password }: Props) {
  const strength = getStrength(password)

  return (
    <div>
      <div className="mt-2 rounded-full bg-gray-700 p-1">
        <div className={`h-2 rounded-full ${strength.color} ${strength.width}`} />
      </div>
      <p className="mt-1 text-xs text-gray-400">{strength.label}</p>
    </div>
  )
}
