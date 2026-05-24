import { useEffect } from 'react'
import { X } from 'lucide-react'
import { ContactSearch } from './ContactSearch'
import type { ContactAddedVia, PublicProfile } from '../../../types/contactTypes'

type Props = {
  open: boolean
  onClose: () => void
  currentUserId: string
  isContact: (uid: string) => boolean
  onSaveContact: (uid: string, via: ContactAddedVia) => Promise<void>
  onViewProfile: (profile: PublicProfile) => void
  onContactUser: (uid: string) => Promise<void>
}

export function AddContactModal({
  open,
  onClose,
  currentUserId,
  isContact,
  onSaveContact,
  onViewProfile,
  onContactUser,
}: Props) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#13131a] border border-white/[0.08] shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
          <div>
            <h3 className="text-md font-semibold text-white">Tambah Kontak</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Cari pengguna Tel-Talk lewat username mereka.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/70 hover:text-white flex items-center justify-center transition-colors"
            title="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <ContactSearch
          currentUserId={currentUserId}
          isContact={isContact}
          onSaveContact={onSaveContact}
          onViewProfile={onViewProfile}
          onContactUser={onContactUser}
        />
      </div>
    </div>
  )
}
