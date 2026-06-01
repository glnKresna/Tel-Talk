import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { db } from '../../../config/firebase'
import { useAuthStore } from '../../../store/useAuthStore'
import type { Pesan } from '../../../store/useMsgStore'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { getContactDisplayName, type ContactWithProfile } from '../../../types/contactTypes'
import { UnreadBadge } from '../../UI/UnreadBadge'

type Props = {
  contact: ContactWithProfile
  isActive: boolean
  onSelect: () => void
}

export function ContactListItem({
  contact,
  isActive,
  onSelect,
}: Props) {
  const [lastMessage, setLastMessage] = useState<Pesan | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const { currUser } = useAuthStore()
  const displayName = getContactDisplayName(contact)

  // 1. Listen to the latest message
  useEffect(() => {
    if (!currUser?.uid || !contact.contactUid) return

    const conversationId = [currUser.uid, contact.contactUid].sort().join('_')
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    const q = query(messagesRef, orderBy('waktuKirim', 'desc'), limit(1))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0]
          const msg = { id: docSnap.id, ...docSnap.data() } as Pesan

          // Check if message was sent before or at the clear chat timestamp
          if (contact.clearedAt && msg.waktuKirim) {
            const clearedAtMs =
              typeof contact.clearedAt.toMillis === 'function'
                ? contact.clearedAt.toMillis()
                : (contact.clearedAt as any).seconds * 1000
            const waktuKirimMs =
              typeof msg.waktuKirim.toMillis === 'function'
                ? msg.waktuKirim.toMillis()
                : (msg.waktuKirim as any).seconds * 1000

            if (waktuKirimMs <= clearedAtMs) {
              setLastMessage(null)
              return
            }
          }

          setLastMessage(msg)
        } else {
          setLastMessage(null)
        }
      },
      (err) => {
        console.error('Error fetching last message:', err)
      }
    )

    return unsubscribe
  }, [currUser?.uid, contact.contactUid, contact.clearedAt])

  // 2. Listen to unread message count
  useEffect(() => {
    if (!currUser?.uid || !contact.contactUid) return

    const conversationId = [currUser.uid, contact.contactUid].sort().join('_')
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    
    // Unread messages query (sent by other user, statusBaca is false)
    const unreadQ = query(
      messagesRef,
      where('senderId', '==', contact.contactUid),
      where('statusBaca', '==', false)
    )

    const unsubscribe = onSnapshot(
      unreadQ,
      (snapshot) => {
        let count = snapshot.docs.length

        // Filter out locally cleared messages if any
        if (contact.clearedAt && count > 0) {
          const clearedAtMs =
            typeof contact.clearedAt.toMillis === 'function'
              ? contact.clearedAt.toMillis()
              : (contact.clearedAt as any).seconds * 1000

          const validUnreadDocs = snapshot.docs.filter((doc) => {
            const data = doc.data()
            if (!data.waktuKirim) return true
            const waktuKirimMs =
              typeof data.waktuKirim.toMillis === 'function'
                ? data.waktuKirim.toMillis()
                : (data.waktuKirim as any).seconds * 1000
            return waktuKirimMs > clearedAtMs
          })
          count = validUnreadDocs.length
        }

        setUnreadCount(count)
      },
      (err) => {
        console.error('Error fetching unread count:', err)
      }
    )

    return unsubscribe
  }, [currUser?.uid, contact.contactUid, contact.clearedAt])

  const lastMessageTime = lastMessage?.waktuKirim?.toDate
    ? format(lastMessage.waktuKirim.toDate(), 'HH:mm', { locale: id })
    : ''

  const getLastMessagePreview = () => {
    if (!lastMessage) return 'Belum ada pesan'
    if (lastMessage.fileUrl) {
      const type = lastMessage.fileType || ''
      if (type.startsWith('image/')) return '📷 Foto'
      if (type.startsWith('video/')) return '🎥 Video'
      if (type.startsWith('audio/')) return '🎵 Audio'
      return '📄 Dokumen'
    }
    return lastMessage.isiPesan || ''
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onSelect}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left
          ${isActive
            ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent'}`}
      >
        <AvatarCircle
          photoURL={contact.profile?.photoURL ?? null}
          displayName={displayName.replace(/^@/, '')}
          size="sm"
          variant="dashboard"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate text-sm">
            {displayName.replace(/^@/, '')}
          </p>
          <p className="text-xs text-zinc-500 truncate mt-0.5">
            {getLastMessagePreview()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 self-start mt-0.5">
          {lastMessageTime && (
            <span className="text-[10px] text-zinc-500 shrink-0">
              {lastMessageTime}
            </span>
          )}
          <UnreadBadge count={unreadCount} />
        </div>
      </button>
    </div>
  )
}
