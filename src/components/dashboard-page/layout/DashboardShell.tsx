import type { RefObject, Dispatch, SetStateAction } from 'react'
import type { ActiveTab, Room, ModalState } from '../../../types/dashboardTypes'
import type { ContactWithProfile } from '../../../types/contactTypes'
import { getContactDisplayName } from '../../../types/contactTypes'
import { NavRail } from './NavRail'
import { DashboardSubPanel } from './DashboardSubPanel'
import { ChatHeader } from '../chat/ChatHeader'
import { ChatbotHeader } from '../ai/ChatbotHeader'
import { ChatPanel } from '../chat/ChatPanel'
import { ChatbotPanel } from '../ai/ChatbotPanel'

type Props = {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  rooms: Room[]
  activeRoom: Room
  onSelectRoom: (room: Room) => void
  messageCount: number
  bottomRef: RefObject<HTMLDivElement | null>
  profileDisplayName: string
  profilePhotoURL: string | null
  onOpenProfile: () => void
  contacts: ContactWithProfile[]
  contactsLoading: boolean
  selectedContactId: string | null
  selectedContact: ContactWithProfile | null
  onSelectContact: (contactUid: string) => void
  onContactUser: (uid: string) => Promise<void>
  onRenameContact: (contact: ContactWithProfile) => void
  onRemoveContact: (contact: ContactWithProfile) => void
  plusModal: ModalState
  setPlusModal: Dispatch<SetStateAction<ModalState>>
}

export function DashboardShell({
  activeTab,
  onTabChange,
  rooms,
  activeRoom,
  onSelectRoom,
  messageCount,
  bottomRef,
  profileDisplayName,
  profilePhotoURL,
  onOpenProfile,
  contacts,
  contactsLoading,
  selectedContactId,
  selectedContact,
  onSelectContact,
  onContactUser,
  onRenameContact,
  onRemoveContact,
  plusModal,
  setPlusModal,
}: Props) {
  return (
    <div className="flex h-screen bg-[#0f0f14] text-white overflow-hidden select-none">
      
      <NavRail 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        profilePhotoURL={profilePhotoURL}
        profileDisplayName={profileDisplayName}
        onOpenProfile={onOpenProfile}
      />

      <DashboardSubPanel 
        activeTab={activeTab}
        rooms={rooms}
        activeRoomId={activeRoom.id}
        onSelectRoom={onSelectRoom}
        contacts={contacts}
        contactsLoading={contactsLoading}
        selectedContactId={selectedContactId}
        onSelectContact={onSelectContact}
        onRenameContact={onRenameContact}
        onRemoveContact={onRemoveContact}
        onContactPeer={(contact) => onContactUser(contact.contactUid)}
        plusModal={plusModal}
        setPlusModal={setPlusModal}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c10]">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-[#13131a]/50 backdrop-blur-sm h-[65px]">
          {activeTab === 'dms' && (
            <div className="text-sm font-medium text-white/80">
              {selectedContact ? `Chat dengan ${getContactDisplayName(selectedContact)}` : 'Pilih Kontak'}
            </div>
          )}
          {activeTab === 'rooms' && (
            <ChatHeader activeRoom={activeRoom} messageCount={messageCount} />
          )}
          {activeTab === 'pinned' && (
            <div className="text-sm font-medium text-white/80">Pesan Tersemat</div>
          )}
          {activeTab === 'ai' && <ChatbotHeader />}
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'dms' && selectedContact && (
            <ChatPanel activeRoom={{ id: selectedContact.contactUid, name: getContactDisplayName(selectedContact), icon: '👤' }} bottomRef={bottomRef} />
          )}
          {activeTab === 'dms' && !selectedContact && (
            <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2">
              <span className="text-4xl">💬</span>
              <p className="text-sm">Silakan pilih kontak untuk memulai obrolan pribadi</p>
            </div>
          )}
          {activeTab === 'rooms' && (
            <ChatPanel activeRoom={activeRoom} bottomRef={bottomRef} />
          )}
          {activeTab === 'pinned' && (
            <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2">
              <span className="text-4xl">📌</span>
              <p className="text-sm">Pesan yang Anda pin akan muncul di sini</p>
            </div>
          )}
          {activeTab === 'ai' && <ChatbotPanel bottomRef={bottomRef} />}
        </div>
      </main>
    </div>
  )
}