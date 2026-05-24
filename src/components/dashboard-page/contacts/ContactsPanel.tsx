import { MessageCircle, Pencil, Users } from 'lucide-react'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { getContactDisplayName, type ContactWithProfile, type PublicProfile } from '../../../types/contactTypes'
import { ContactSearch } from './ContactSearch'
import type { ContactAddedVia } from '../../../types/contactTypes'

type Props = {
  currentUserId: string
  selectedContact: ContactWithProfile | null
  isContact: (uid: string) => boolean
  onSaveContact: (uid: string, via: ContactAddedVia) => Promise<void>
  onViewProfile: (profile: PublicProfile) => void
  onContactUser: (uid: string) => Promise<void>
  onRenameContact: (contact: ContactWithProfile) => void
  onRemoveContact: (contact: ContactWithProfile) => void
  toast: (msg: string) => void
}

export function ContactsPanel({
  currentUserId,
  selectedContact,
  isContact,
  onSaveContact,
  onViewProfile,
  onContactUser,
  onRenameContact,
  onRemoveContact,
  toast,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="max-w-xl mx-auto space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-white mb-1">Tambah kontak</h3>
          <p className="text-xs text-zinc-500 mb-3">
            Cari user Tel-Talk lewat email lengkap atau nama.
          </p>
          <ContactSearch
            currentUserId={currentUserId}
            isContact={isContact}
            onSaveContact={async (uid, via) => {
              await onSaveContact(uid, via)
              toast('Kontak berhasil disimpan.')
            }}
            onViewProfile={onViewProfile}
            onContactUser={onContactUser}
          />
        </section>

        {selectedContact && (
          <section className="p-4 rounded-2xl bg-[#1e1e2a] border border-white/[0.08]">
            <div className="flex items-center gap-3">
              <AvatarCircle
                photoURL={selectedContact.profile?.photoURL ?? null}
                displayName={getContactDisplayName(selectedContact)}
                size="md"
                variant="dashboard"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {getContactDisplayName(selectedContact)}
                </p>
                {selectedContact.customName && selectedContact.profile?.username && (
                  <p className="text-xs text-zinc-500 truncate">{`@${selectedContact.profile.username}`}</p>
                )}
                {selectedContact.profile?.bio && (
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{selectedContact.profile.bio}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={() => void onContactUser(selectedContact.contactUid)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white"
              >
                <MessageCircle size={14} /> Hubungi
              </button>
              <button
                type="button"
                onClick={() => onRenameContact(selectedContact)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:bg-white/[0.08]"
              >
                <Pencil size={14} /> Ubah nama
              </button>
              <button
                type="button"
                disabled
                title="Setelah fitur room grup siap"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 border border-white/[0.06] cursor-not-allowed"
              >
                <Users size={14} /> Tambah ke room
              </button>
              <button
                type="button"
                onClick={() => {
                  void onRemoveContact(selectedContact)
                  toast('Kontak dihapus.')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-500/10 border border-red-500/20"
              >
                Hapus kontak
              </button>
            </div>
          </section>
        )}

        {!selectedContact && (
          <p className="text-center text-xs text-zinc-600 py-8">
            Pilih kontak di sidebar atau simpan hasil pencarian.
          </p>
        )}
      </div>
    </div>
  )
}
