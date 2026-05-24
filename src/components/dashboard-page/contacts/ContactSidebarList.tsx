import { ContactListItem } from './ContactListItem'
import type { ContactWithProfile } from '../../../types/contactTypes'

type Props = {
  contacts: ContactWithProfile[]
  isLoading: boolean
  isSidebarOpen: boolean
  selectedContactId: string | null
  onSelectContact: (contactUid: string) => void
  onRename: (contact: ContactWithProfile) => void
  onContact: (contact: ContactWithProfile) => void
  onRemove: (contact: ContactWithProfile) => void
}

export function ContactSidebarList({
  contacts,
  isLoading,
  isSidebarOpen,
  selectedContactId,
  onSelectContact,
  onRename,
  onContact,
  onRemove,
}: Props) {
  if (!isSidebarOpen) {
    return (
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col items-center gap-1">
        {contacts.slice(0, 8).map((c) => (
          <button
            key={c.contactUid}
            type="button"
            title={c.customName || c.profile?.username}
            onClick={() => onSelectContact(c.contactUid)}
            className={`w-10 h-10 rounded-full text-[10px] font-bold flex items-center justify-center
              ${selectedContactId === c.contactUid
                ? 'bg-violet-600/30 text-violet-200 ring-2 ring-violet-500/40'
                : 'bg-violet-600/15 text-violet-300'}`}
          >
            {(c.customName || c.profile?.username || '?')[0]?.toUpperCase()}
          </button>
        ))}
      </nav>
    )
  }

  return (
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {isLoading && contacts.length === 0 && (
        <div className="flex justify-center py-6">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!isLoading && contacts.length === 0 && (
        <p className="text-xs text-zinc-500 text-center px-2 py-6">Belum ada kontak tersimpan.</p>
      )}
      {contacts.map((contact) => (
        <ContactListItem
          key={contact.contactUid}
          contact={contact}
          isActive={selectedContactId === contact.contactUid}
          onSelect={() => onSelectContact(contact.contactUid)}
          onRename={() => onRename(contact)}
          onContact={() => onContact(contact)}
          onRemove={() => onRemove(contact)}
        />
      ))}
    </nav>
  )
}
