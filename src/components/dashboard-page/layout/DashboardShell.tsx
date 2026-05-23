import type { RefObject } from 'react'
import type { ActiveTab, Room } from '../../../types/dashboardTypes'
import type { ContactAddedVia, ContactWithProfile, PublicProfile } from '../../../types/contactTypes'
import { DashboardSidebar } from '../sidebar/DashboardSidebar'
import { ChatHeader } from '../chat/ChatHeader'
import { ChatbotHeader } from '../ai/ChatbotHeader'
import { ContactsHeader } from '../contacts/ContactsHeader'
import { ChatPanel } from '../chat/ChatPanel'
import { ChatbotPanel } from '../ai/ChatbotPanel'
import { ContactsPanel } from '../contacts/ContactsPanel'

type Props = {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  rooms: Room[]
  activeRoom: Room
  onSelectRoom: (room: Room) => void
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  messageCount: number
  bottomRef: RefObject<HTMLDivElement | null>
  profileDisplayName: string
  profilePhotoURL: string | null
  isProfileOpen: boolean
  onOpenProfile: () => void
  currentUserId: string
  contacts: ContactWithProfile[]
  contactsLoading: boolean
  selectedContactId: string | null
  selectedContact: ContactWithProfile | null
  onSelectContact: (contactUid: string) => void
  isContact: (uid: string) => boolean
  onSaveContact: (uid: string, via: ContactAddedVia) => Promise<void>
  onViewUserProfile: (profile: PublicProfile) => void
  onContactUser: (uid: string) => Promise<void>
  onRenameContact: (contact: ContactWithProfile) => void
  onRemoveContact: (contact: ContactWithProfile) => void
  onContactsToast: (msg: string) => void
}

export function DashboardShell({
  activeTab,
  onTabChange,
  rooms,
  activeRoom,
  onSelectRoom,
  isSidebarOpen,
  onToggleSidebar,
  messageCount,
  bottomRef,
  profileDisplayName,
  profilePhotoURL,
  isProfileOpen,
  onOpenProfile,
  currentUserId,
  contacts,
  contactsLoading,
  selectedContactId,
  selectedContact,
  onSelectContact,
  isContact,
  onSaveContact,
  onViewUserProfile,
  onContactUser,
  onRenameContact,
  onRemoveContact,
  onContactsToast,
}: Props) {
  return (
    <div className="flex h-screen bg-[#0f0f14] text-white overflow-hidden">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        rooms={rooms}
        activeRoomId={activeRoom.id}
        onSelectRoom={onSelectRoom}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={onToggleSidebar}
        profileDisplayName={profileDisplayName}
        profilePhotoURL={profilePhotoURL}
        isProfileOpen={isProfileOpen}
        onOpenProfile={onOpenProfile}
        contacts={contacts}
        contactsLoading={contactsLoading}
        selectedContactId={selectedContactId}
        onSelectContact={onSelectContact}
        onRenameContact={onRenameContact}
        onContactPeer={(c) => void onContactUser(c.contactUid)}
        onRemoveContact={onRemoveContact}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-[#13131a]/50 backdrop-blur-sm">
          {activeTab === 'chat' && (
            <ChatHeader activeRoom={activeRoom} messageCount={messageCount} />
          )}
          {activeTab === 'contacts' && (
            <ContactsHeader contactCount={contacts.length} />
          )}
          {activeTab === 'ai' && <ChatbotHeader />}
        </header>

        {activeTab === 'chat' && (
          <ChatPanel activeRoom={activeRoom} bottomRef={bottomRef} />
        )}
        {activeTab === 'contacts' && (
          <ContactsPanel
            currentUserId={currentUserId}
            selectedContact={selectedContact}
            isContact={isContact}
            onSaveContact={onSaveContact}
            onViewProfile={onViewUserProfile}
            onContactUser={onContactUser}
            onRenameContact={onRenameContact}
            onRemoveContact={onRemoveContact}
            toast={onContactsToast}
          />
        )}
        {activeTab === 'ai' && <ChatbotPanel bottomRef={bottomRef} />}
      </main>
    </div>
  )
}
