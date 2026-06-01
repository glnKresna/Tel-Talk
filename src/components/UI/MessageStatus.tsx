import { CheckCheck } from 'lucide-react'

type MessageStatusProps = {
  statusBaca: boolean
}

export function MessageStatus({ statusBaca }: MessageStatusProps) {
  return (
    <CheckCheck
      size={14}
      className={`inline-block transition-colors ${
        statusBaca ? 'text-sky-400' : 'text-zinc-400/50'
      }`}
    />
  )
}
