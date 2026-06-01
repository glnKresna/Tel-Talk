import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, documentId } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import type { Room } from '../../../types/dashboardTypes'
import { AvatarCircle } from '../../profile-page/avatarCircle'

type Props = {
  activeRoom: Room
  messageCount?: number
}

export function ChatHeader({ activeRoom }: Props) {
  const [memberNames, setMemberNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchMemberNames = async () => {
      if (!activeRoom.members || activeRoom.members.length === 0) {
        setMemberNames([])
        return
      }

      const isDefaultRoom = ['general', 'random', 'dev'].includes(activeRoom.id)
      if (isDefaultRoom && (!activeRoom.members || activeRoom.members.length === 0)) {
        setMemberNames(['Semua Pengguna'])
        return
      }

      try {
        setLoading(true)
        // Firestore 'in' query supports up to 30 elements in array, which fits Tel-Talk groups
        const q = query(
          collection(db, 'publicProfiles'),
          where(documentId(), 'in', activeRoom.members)
        )
        const snap = await getDocs(q)
        const list = snap.docs.map((doc) => doc.data().username || 'user')
        list.sort((a, b) => a.localeCompare(b))
        setMemberNames(list)
      } catch (err) {
        console.error('Error fetching room member names in header:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMemberNames()
  }, [activeRoom])

  const formatMembersString = () => {
    if (loading) return 'Memuat anggota...'
    if (memberNames.length === 0) return 'Tidak ada anggota'
    
    // Jika room default
    if (['general', 'random', 'dev'].includes(activeRoom.id)) {
      return 'Semua Pengguna'
    }

    if (memberNames.length <= 4) {
      return memberNames.join(', ')
    }
    const visible = memberNames.slice(0, 3).join(', ')
    const hiddenCount = memberNames.length - 3
    return `${visible}, +${hiddenCount} lainnya`
  }

  return (
    <>
      <AvatarCircle
        photoURL={activeRoom.photoURL || null}
        displayName={activeRoom.name}
        size="xs"
        variant="dashboard"
      />
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-white text-sm truncate leading-tight">{activeRoom.name}</h2>
        <p 
          className="text-[10px] text-zinc-500 truncate mt-0.5" 
          title={memberNames.length > 0 ? memberNames.join(', ') : undefined}
        >
          {formatMembersString()}
        </p>
      </div>
    </>
  )
}
