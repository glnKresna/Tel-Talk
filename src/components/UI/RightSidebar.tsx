import { ReactNode } from 'react'
import { X } from 'lucide-react'

type RightSidebarProps = {
  title: string
  icon?: ReactNode
  onClose: () => void
  children: ReactNode
  width?: string // e.g. "w-[320px]"
}

export function RightSidebar({
  title,
  icon,
  onClose,
  children,
  width = 'w-[320px]',
}: RightSidebarProps) {
  return (
    <div className={`${width} bg-[#111116] border-l border-white/[0.06] flex flex-col h-full z-20 animate-in slide-in-from-right duration-200 shrink-0`}>
      {/* Header */}
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between h-[65px] shrink-0">
        <h3 className="text-sm font-semibold text-white/95 flex items-center gap-2 select-none">
          {icon}
          <span>{title}</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
        >
          <X size={15} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {children}
      </div>
    </div>
  )
}
