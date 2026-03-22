type Props = {
  role: 'user' | 'ai'
  text: string
  timestamp?: string
}

export function ChatBubble({ role, text, timestamp }: Props) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isUser ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-100'} max-w-md rounded-2xl p-3 text-sm`}>
        <p>{text}</p>
        {timestamp ? <p className={`mt-1 text-[10px] ${isUser ? 'text-violet-200' : 'text-gray-400'}`}>{timestamp}</p> : null}
      </div>
    </div>
  )
}
