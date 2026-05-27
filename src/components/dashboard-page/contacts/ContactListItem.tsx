import { MoreVertical, MessageCircle, Users, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { getContactDisplayName, type ContactWithProfile } from '../../../types/contactTypes'

type Props = {
  contact: ContactWithProfile
  isActive: boolean
  onSelect: () => void
  onRename: () => void
  onContact: () => void
  onRemove: () => void
}

export function ContactListItem({
  contact,
  isActive,
  onSelect,
  onRename,
  onContact,
  onRemove,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const displayName = getContactDisplayName(contact)
  const legalName = contact.profile?.username

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
          displayName={displayName}
          size="xs"
          variant="dashboard"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{displayName}</p>
          {contact.customName && legalName && (
            <p className="text-[10px] text-zinc-500 truncate">{`@${legalName}`}</p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((v) => !v)
          }}
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06]"
          aria-label="Menu kontak"
        >
          <MoreVertical size={16} />
        </button>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onMouseDown={() => setMenuOpen(false)} />
          <div className="absolute right-2 top-full z-50 mt-1 w-44 rounded-xl bg-[#13131a] border border-white/[0.08] shadow-xl overflow-hidden py-1">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-white/[0.06]"
              onClick={() => {
                setMenuOpen(false)
                onContact()
              }}
            >
              <MessageCircle size={14} /> Hubungi
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-white/[0.06]"
              onClick={() => {
                setMenuOpen(false)
                onRename()
              }}
            >
              <Pencil size={14} /> Ubah nama
            </button>
            <button
              type="button"
              disabled
              title="Setelah fitur room grup siap"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 cursor-not-allowed"
            >
              <Users size={14} /> Tambah ke room
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
              onClick={() => {
                setMenuOpen(false)
                onRemove()
              }}
            >
              <Trash2 size={14} /> Hapus kontak
            </button>
          </div>
        </>
      )}
    </div>
  )
}
