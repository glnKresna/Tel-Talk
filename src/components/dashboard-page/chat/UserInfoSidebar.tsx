import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { User, Edit2, Ban, Trash2 } from 'lucide-react'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { RightSidebar } from '../../UI/RightSidebar'
import type { ContactWithProfile, PublicProfile } from '../../../types/contactTypes'
import { getContactDisplayName } from '../../../types/contactTypes'

type UserInfoSidebarProps = {
  contact: ContactWithProfile
  activeProfile: PublicProfile | null
  onClose: () => void
  onRenameContact: (contact: ContactWithProfile) => void
  onBlockContact: () => void
  onRemoveContact: (contact: ContactWithProfile) => void
}

export function UserInfoSidebar({
  contact,
  activeProfile,
  onClose,
  onRenameContact,
  onBlockContact,
  onRemoveContact,
}: UserInfoSidebarProps) {
  const profile = activeProfile || contact.profile
  const username = profile?.username || 'user'
  const displayName = getContactDisplayName(contact).replace(/^@/, '')
  const hasCustomName = Boolean(contact.customName?.trim())

  // Presence Format
  const isOnline = profile?.isOnline || false
  const lastSeen = profile?.lastSeen || null

  const formatLastSeenLocal = (timestamp: any): string => {
    if (!timestamp) return 'Offline'
    try {
      const date = typeof timestamp.toDate === 'function' 
        ? timestamp.toDate() 
        : new Date(timestamp.seconds * 1000)
      const now = new Date()
      
      const isToday = date.getDate() === now.getDate() &&
                      date.getMonth() === now.getMonth() &&
                      date.getFullYear() === now.getFullYear()
                      
      if (isToday) {
        return `Hari ini pukul ${format(date, 'HH:mm', { locale: id })}`
      }
      
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      const isYesterday = date.getDate() === yesterday.getDate() &&
                          date.getMonth() === yesterday.getMonth() &&
                          date.getFullYear() === yesterday.getFullYear()
                          
      if (isYesterday) {
        return `Kemarin pukul ${format(date, 'HH:mm', { locale: id })}`
      }
      
      return format(date, 'd MMMM yyyy pukul HH:mm', { locale: id })
    } catch (err) {
      console.error('Error formatting last seen inside sidebar:', err)
      return 'Offline'
    }
  }

  return (
    <RightSidebar
      title="Info Pengguna"
      icon={<User size={16} className="text-violet-400" />}
      onClose={onClose}
    >
      {/* Large User Photo & Name */}
      <div className="flex flex-col items-center text-center space-y-3 py-2 border-b border-white/[0.03] pb-6">
        <div className="relative group">
          <AvatarCircle
            photoURL={profile?.photoURL || null}
            displayName={displayName}
            size="lg"
            variant="dashboard"
          />
          {/* Subtle Online Ring */}
          {isOnline && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111116] shadow-md animate-pulse" />
          )}
        </div>

        <div className="space-y-1 select-text">
          <h4 className="text-base font-bold text-white tracking-wide truncate max-w-[280px]">
            {displayName}
          </h4>
          
          {hasCustomName && (
            <p className="text-xs text-zinc-400 font-normal truncate max-w-[280px]">
              @{username}
            </p>
          )}

          <div className="inline-flex items-center gap-1.5 pt-1.5 text-[11px] font-medium tracking-wide">
            {isOnline ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                🟢 Aktif Sekarang
              </span>
            ) : (
              <span className="text-zinc-500 font-light flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                {lastSeen ? `Terakhir dilihat ${formatLastSeenLocal(lastSeen)}` : 'Offline'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio / About */}
      <div className="space-y-3 select-text bg-[#161622]/40 rounded-xl p-4 border border-white/[0.03] hover:border-white/[0.05] transition-colors">
        <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Bio</h5>
        <p className="text-xs text-zinc-200 leading-relaxed font-light whitespace-pre-wrap">
          {profile?.bio?.trim() ? profile.bio : 'Belum ada bio.'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2.5 pt-2 select-none">
        <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1">Kelola Kontak</h5>
        
        <div className="grid grid-cols-1 gap-2">
          {/* Ubah Nama */}
          <button
            type="button"
            onClick={() => onRenameContact(contact)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-left text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
          >
            <Edit2 size={14} className="text-violet-400" />
            <span>Ubah Nama Kontak</span>
          </button>

          {/* Blokir Kontak */}
          <button
            type="button"
            onClick={onBlockContact}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
              contact.isBlocked
                ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:text-emerald-200'
                : 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 text-rose-300 hover:text-rose-200'
            }`}
          >
            <Ban size={14} className={contact.isBlocked ? 'text-emerald-400' : 'text-rose-400'} />
            <span>{contact.isBlocked ? 'Buka Blokir Kontak' : 'Blokir Kontak'}</span>
          </button>

          {/* Hapus Kontak */}
          <button
            type="button"
            onClick={() => onRemoveContact(contact)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-500/[0.02] hover:bg-red-500/10 border border-red-500/15 hover:border-red-500/25 text-left text-xs font-semibold text-red-400 hover:text-red-300 transition-all cursor-pointer"
          >
            <Trash2 size={14} className="text-red-400" />
            <span>Hapus Kontak</span>
          </button>
        </div>
      </div>
    </RightSidebar>
  )
}
