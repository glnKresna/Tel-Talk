import { useState, useRef, useEffect } from 'react'
import { Plus, Search, MessageSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { useChatbotStore } from '../../../store/useChatbotStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { DeleteSessionModal } from './DeleteSessionModal'

type Props = {
  isSidebarOpen: boolean
}

export function ChatbotSidebar({ isSidebarOpen }: Props) {
  const { currUser } = useAuthStore()
  const {
    sessions,
    activeSessionId,
    renameSession,
    deleteSession,
    setActiveSessionId,
    subscribeSessions,
  } = useChatbotStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currUser) return
    return subscribeSessions(currUser.uid)
  }, [currUser, subscribeSessions])

  // Close popover when clicking outside
  useEffect(() => {
    if (!openPopoverId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpenPopoverId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openPopoverId])

  const handleNewChat = () => {
    setActiveSessionId(null)
  }

  const handleRename = async (sessionId: string) => {
    if (!currUser) return
    const trimmed = renameValue.trim()
    if (!trimmed) {
      setEditingSessionId(null)
      setRenameValue('')
      return
    }

    const original = sessions.find((s) => s.id === sessionId)
    if (original && original.title === trimmed) {
      setEditingSessionId(null)
      setRenameValue('')
      return
    }

    try {
      await renameSession(currUser.uid, sessionId, trimmed)
      setEditingSessionId(null)
      setRenameValue('')
    } catch (err) {
      console.error('Failed to rename session:', err)
    }
  }

  const handleConfirmDelete = async () => {
    if (!currUser || !deleteTarget) return
    try {
      await deleteSession(currUser.uid, deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isSidebarOpen) return null

  return (
    <div className="flex-1 flex flex-col h-full select-none">
      {/* 1. New Chat Button */}
      <div className="px-2 pt-2">
        <button
          type="button"
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e1e2a] hover:bg-[#252535] border border-white/[0.08] hover:border-violet-500/30 transition-all text-xs font-semibold text-white/95 shadow-md active:scale-[0.98]"
        >
          <Plus size={16} className="text-violet-400 shrink-0" />
          <span>Percakapan Baru</span>
        </button>
      </div>

      {/* 2. Search Box */}
      <div className="p-2 relative">
        <Search size={14} className="text-zinc-500 absolute left-5 top-1/2 -translate-y-1/2 shrink-0" />
        <input
          type="text"
          placeholder="Cari percakapan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#181824]/50 border border-white/[0.05] rounded-xl pl-10 pr-4 py-2 text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      {/* 3. Recent Title */}
      <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-zinc-500 tracking-wider uppercase">
        Terbaru
      </div>

      {/* 4. List of Sessions */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
        {filteredSessions.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-8 text-[11px] text-zinc-600">
              Tidak ada kecocokan
            </div>
          ) : null
        ) : (
          filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId
            const isEditing = session.id === editingSessionId

            return (
              <div
                key={session.id}
                className="relative group rounded-xl transition-all"
              >
                <div
                  onClick={() => {
                    if (!isEditing && activeSessionId !== session.id) {
                      setActiveSessionId(session.id)
                    }
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-colors
                    ${isActive
                      ? 'bg-violet-600/15 text-violet-300 font-semibold border border-violet-500/20'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare size={13} className={`shrink-0 ${isActive ? 'text-violet-400' : 'text-zinc-500'}`} />
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => void handleRename(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleRename(session.id)
                          if (e.key === 'Escape') setEditingSessionId(null)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-transparent text-[11px] text-white focus:outline-none py-0.5 leading-tight font-medium"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate pr-4 flex-1 select-none text-[11px] leading-tight">
                        {session.title}
                      </span>
                    )}
                  </div>

                  {/* Three Dots Action Button */}
                  {!isEditing && (
                    <div className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenPopoverId(session.id)
                        }}
                        className="p-1 rounded hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300"
                      >
                        <MoreVertical size={13} />
                      </button>

                      {/* Popover Menu Options */}
                      {openPopoverId === session.id && (
                        <div
                          ref={popoverRef}
                          className="absolute right-0 mt-1 w-24 rounded-lg bg-[#181824] border border-white/[0.08] shadow-2xl overflow-hidden py-1 z-30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/[0.04] text-left text-[10px] text-zinc-300 font-medium"
                            onClick={() => {
                              setEditingSessionId(session.id)
                              setRenameValue(session.title)
                              setOpenPopoverId(null)
                            }}
                          >
                            <Edit2 size={10} className="text-violet-400 shrink-0" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-red-500/10 text-left text-[10px] text-red-300 font-medium"
                            onClick={() => {
                              setDeleteTarget(session)
                              setOpenPopoverId(null)
                            }}
                          >
                            <Trash2 size={10} className="text-red-400 shrink-0" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <DeleteSessionModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
