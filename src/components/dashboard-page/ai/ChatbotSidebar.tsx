type Props = {
  isSidebarOpen: boolean
}

export function ChatbotSidebar({ isSidebarOpen }: Props) {
  if (!isSidebarOpen) return null

  return (
    <div className="flex-1 p-4">
      <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-3">
        <p className="text-xs text-violet-300 font-medium mb-1">Tel-Bot</p>
        <p className="text-xs text-zinc-500">Tanya apa saja, AI siap bantu kamu.</p>
      </div>
    </div>
  )
}
