type ChatTimelineSeparatorProps = {
  label: string
}

export function ChatTimelineSeparator({ label }: ChatTimelineSeparatorProps) {
  if (!label) return null

  return (
    <div className="flex items-center justify-center my-4 select-none w-full">
      <span className="bg-[#1e1e2a]/80 border border-white/[0.04] text-zinc-400 font-bold text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md backdrop-blur-sm">
        {label}
      </span>
    </div>
  )
}
