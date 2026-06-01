import type { ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  busy?: boolean
  children: ReactNode
}

export function ProfileModalShell({ open, onClose, busy = false, children }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={() => {
        if (!busy) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#13131a] border border-white/[0.08] shadow-2xl p-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
