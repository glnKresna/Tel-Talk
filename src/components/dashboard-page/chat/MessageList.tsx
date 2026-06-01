import { useEffect, useMemo, type RefObject, memo } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { id } from 'date-fns/locale'
import MessageBubble from '../../messageBubble'
import { ChatTimelineSeparator } from '../../UI/ChatTimelineSeparator'
import type { Pesan } from '../../../store/useMsgStore'
import type { Room } from '../../../types/dashboardTypes'
import type { ContactWithProfile } from '../../../types/contactTypes'

const getGroupDateLabel = (timestamp: any): string => {
  if (!timestamp) return ''
  try {
    const date = typeof timestamp.toDate === 'function'
      ? timestamp.toDate()
      : new Date(timestamp.seconds * 1000)

    if (isToday(date)) {
      return 'Hari Ini'
    }
    if (isYesterday(date)) {
      return 'Kemarin'
    }
    return format(date, 'dd/MM/yyyy', { locale: id })
  } catch (err) {
    console.error('Error grouping message date label:', err)
    return ''
  }
}

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
  contacts?: ContactWithProfile[]
}

export const MessageList = memo(function MessageList({
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
  contacts = [],
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

  // Memoize date grouping and search highlighting to avoid heavy date-fns calculations on every keystroke
  const messagesWithSeparators = useMemo(() => {
    return messages.map((msg, index) => {
      const isMatch = Boolean(
        searchQuery.trim() &&
          msg.isiPesan?.toLowerCase().includes(searchQuery.toLowerCase())
      )

      const currentLabel = getGroupDateLabel(msg.waktuKirim)
      const prevMsg = index > 0 ? messages[index - 1] : null
      const prevLabel = prevMsg ? getGroupDateLabel(prevMsg.waktuKirim) : null
      const showSeparator = Boolean(currentLabel && currentLabel !== prevLabel)

      return {
        msg,
        isMatch,
        showSeparator,
        currentLabel,
      }
    })
  }, [messages, searchQuery])

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

      {messagesWithSeparators.map(({ msg, isMatch, showSeparator, currentLabel }, index) => {
        return (
          <div key={msg.id || index} className="flex flex-col">
            {showSeparator && (
              <ChatTimelineSeparator label={currentLabel} />
            )}
            <MessageBubble
              roomId={activeRoom.id}
              message={msg}
              isOwnMessage={msg.senderId === currentUserId}
              isHighlighted={isMatch}
              searchQuery={searchQuery}
              onRequestEdit={onRequestEdit}
              onRequestDelete={onRequestDelete}
              onRequestReply={onRequestReply}
              contacts={contacts}
            />
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
})
