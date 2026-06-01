import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { useAuthStore } from '../../../store/useAuthStore'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { UnreadBadge } from '../../UI/UnreadBadge'
import type { Room } from '../../../types/dashboardTypes'

type Props = {
  room: Room
  isActive: boolean
  isSidebarOpen: boolean
  onSelect: () => void
}

export function RoomListItem({ room, isActive, isSidebarOpen, onSelect }: Props) {
  const [unreadCount, setUnreadCount] = useState(0)
  const { currUser } = useAuthStore()

  useEffect(() => {
    if (!currUser?.uid || !room.id) return

    // If this room is currently active, mark it as read immediately
    if (isActive) {
      localStorage.setItem(`room_read_${room.id}`, Date.now().toString())
      setUnreadCount(0)

      // Periodically update the read timestamp while active to keep count at 0
      const interval = setInterval(() => {
        localStorage.setItem(`room_read_${room.id}`, Date.now().toString())
      }, 1000)

      return () => clearInterval(interval)
    }

    // Otherwise, listen to new messages and count unread
    const lastReadStr = localStorage.getItem(`room_read_${room.id}`)
    const lastReadMs = lastReadStr ? parseInt(lastReadStr, 10) : 0

    const messagesRef = collection(db, 'rooms', room.id, 'messages')
    const q = query(messagesRef, orderBy('waktuKirim', 'desc'), limit(50))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setUnreadCount(0)
          return
        }

        const unreadList = snapshot.docs.filter((doc) => {
          const data = doc.data()
          // Only count messages sent by others
          if (data.senderId === currUser.uid) return false
          if (!data.waktuKirim) return true
          const waktuKirimMs =
            typeof data.waktuKirim.toMillis === 'function'
              ? data.waktuKirim.toMillis()
              : (data.waktuKirim as any).seconds * 1000

          return waktuKirimMs > lastReadMs
        })

        setUnreadCount(unreadList.length)
      },
      (err) => {
        console.error(`Error loading unread count for Room ${room.id}:`, err)
      }
    )

    return unsubscribe
  }, [currUser?.uid, room.id, isActive])

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left group
        ${isActive
          ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent'}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <AvatarCircle
          photoURL={room.photoURL || null}
          displayName={room.name}
          size="xs"
          variant="dashboard"
        />
        {isSidebarOpen && (
          <span className="font-medium truncate group-hover:text-white transition-colors">
            {room.name}
          </span>
        )}
      </div>
      {isSidebarOpen && <UnreadBadge count={unreadCount} />}
    </button>
  )
}
