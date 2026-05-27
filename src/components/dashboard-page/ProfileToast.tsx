type Props = {
  message: string | null
}

export function ProfileToast({ message }: Props) {
  if (!message) return null

  return (
    <div className="fixed top-5 right-5 z-[60] flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg">
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      {message}
    </div>
  )
}
