import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, documentId } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { X, Users, Calendar } from 'lucide-react'
import type { Room } from '../../../types/dashboardTypes'
import type { PublicProfile } from '../../../types/contactTypes'

type Props = {
  activeRoom: Room
  onClose: () => void
}

export function GroupInfoSidebar({ activeRoom, onClose }: Props) {
  const [members, setMembers] = useState<PublicProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeRoom.members || activeRoom.members.length === 0) {
        setMembers([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const q = query(
          collection(db, 'publicProfiles'), 
          where(documentId(), 'in', activeRoom.members)
        )

        const snap = await getDocs(q)
        const list = snap.docs.map((doc) => {
          const data = doc.data()
          return {
            uid: doc.id,
            username: typeof data.username === 'string' ? data.username : 'user',
            photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
            bio: typeof data.bio === 'string' ? data.bio : '',
          } as PublicProfile
        })
        
        // Sort alphabetically by username
        list.sort((a, b) => a.username.localeCompare(b.username))
        setMembers(list)
      } catch (err) {
        console.error('Error fetching group members:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMembers()
  }, [activeRoom])

  const isDefaultRoom = ['general', 'random', 'dev'].includes(activeRoom.id)

  return (
    <div className="w-[320px] bg-[#111116] border-l border-white/[0.06] flex flex-col h-full z-20 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between h-[65px] shrink-0">
        <h3 className="text-sm font-semibold text-white/95 flex items-center gap-2 select-none">
          <Users size={16} className="text-violet-400" />
          <span>Info Grup</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Large Group Photo & Name */}
        <div className="flex flex-col items-center text-center space-y-3 py-2 border-b border-white/[0.03] pb-6">
          <AvatarCircle
            photoURL={activeRoom.photoURL || null}
            displayName={activeRoom.name}
            size="lg"
            variant="dashboard"
          />
          <div className="space-y-1 select-text">
            <h4 className="text-base font-bold text-white tracking-wide">{activeRoom.name}</h4>
            <p className="text-[11px] text-violet-400 font-medium tracking-wide uppercase">
              {isDefaultRoom ? 'Saluran Bawaan' : 'Grup Tel-Talk'}
            </p>
          </div>
        </div>

        {/* Group Description / Metadata */}
        <div className="space-y-3 select-text bg-[#161622]/40 rounded-xl p-3 border border-white/[0.03]">
          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Deskripsi Grup</h5>
          <p className="text-xs text-zinc-300 leading-relaxed font-light">
            {isDefaultRoom
              ? `Ini adalah saluran bawaan Tel-Talk untuk berdiskusi tentang topik "${activeRoom.name}" bersama seluruh anggota komunitas.`
              : `Grup percakapan dinamis yang dibuat oleh pengguna Tel-Talk untuk koordinasi dan komunikasi interaktif.`}
          </p>
          
          <div className="flex items-center gap-2 pt-2 text-[10px] text-zinc-500 font-medium">
            <Calendar size={12} className="text-zinc-600" />
            <span>Tipe Grup: Terbuka untuk umum</span>
          </div>
        </div>

        {/* Group Members List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between select-none">
            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Anggota Grup ({members.length})
            </h5>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {members.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default"
                >
                  <AvatarCircle
                    photoURL={member.photoURL}
                    displayName={member.username}
                    size="xs"
                    variant="dashboard"
                  />
                  <div className="flex-1 min-w-0 select-text">
                    <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                      {member.username}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                      {member.bio || 'Available'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
