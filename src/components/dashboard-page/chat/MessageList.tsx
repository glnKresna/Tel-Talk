import { useEffect, useMemo, type RefObject } from 'react'
import MessageBubble from '../../messageBubble'
import type { Pesan } from '../../../store/useMsgStore'
import type { Room } from '../../../types/dashboardTypes'

type Props = {
  activeRoom: Room
  messages: Pesan[]
  msgLoading: boolean
  msgError: string | null
  bottomRef: RefObject<HTMLDivElement | null>
  currentUserId?: string
  onRequestEdit: (messageId: string, currentText: string) => void
  onRequestDelete: (messageId: string) => void
  searchQuery?: string
  onRequestReply?: (message: Pesan) => void
}

export function MessageList({
  activeRoom,
  messages,
  msgLoading,
  msgError,
  bottomRef,
  currentUserId,
  onRequestEdit,
  onRequestDelete,
  searchQuery = '',
  onRequestReply,
}: Props) {
  const matchingMessages = useMemo(() => {
    if (!searchQuery.trim()) return []
    return messages.filter((m) =>
      m.isiPesan?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [messages, searchQuery])

  useEffect(() => {
    if (searchQuery.trim() && matchingMessages.length > 0) {
      const newestMatch = matchingMessages[matchingMessages.length - 1]
      if (newestMatch?.id) {
        const el = document.getElementById(`msg-${newestMatch.id}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }, [searchQuery, matchingMessages])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
      {msgLoading && messages.length === 0 && (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {msgError && messages.length === 0 && !msgLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <p className="text-red-300 text-sm">{msgError}</p>
          <p className="text-zinc-600 text-xs mt-1">Periksa koneksi atau coba ganti room.</p>
        </div>
      )}

      {messages.length === 0 && !msgLoading && !msgError && (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <span className="text-4xl mb-3">{activeRoom.icon}</span>
          <p className="text-zinc-500 text-sm">Belum ada pesan di #{activeRoom.name}</p>
          <p className="text-zinc-600 text-xs mt-1">Jadilah yang pertama ngobrol!</p>
        </div>
      )}

      {messages.map((msg) => {
        const isMatch = Boolean(
          searchQuery.trim() &&
            msg.isiPesan?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        return (
          <MessageBubble
            key={msg.id}
            roomId={activeRoom.id}
            message={msg}
            isOwnMessage={msg.senderId === currentUserId}
            isHighlighted={isMatch}
            searchQuery={searchQuery}
            onRequestEdit={onRequestEdit}
            onRequestDelete={onRequestDelete}
            onRequestReply={onRequestReply}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
