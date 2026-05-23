import type { ActiveTab, Room } from '../../../types/dashboardTypes'
import { RoomList } from '../chat/RoomList'
import { ChatbotSidebar } from '../ai/ChatbotSidebar'
import { ContactSidebarList } from '../contacts/ContactSidebarList'
import { ProfileSidebarTrigger } from './ProfileSidebarTrigger'
import type { ContactWithProfile } from '../../../types/contactTypes'

type Props = {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  rooms: Room[]
  activeRoomId: string
  onSelectRoom: (room: Room) => void
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  profileDisplayName: string
  profilePhotoURL: string | null
  isProfileOpen: boolean
  onOpenProfile: () => void
  contacts: ContactWithProfile[]
  contactsLoading: boolean
  selectedContactId: string | null
  onSelectContact: (contactUid: string) => void
  onRenameContact: (contact: ContactWithProfile) => void
  onContactPeer: (contact: ContactWithProfile) => void
  onRemoveContact: (contact: ContactWithProfile) => void
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  rooms,
  activeRoomId,
  onSelectRoom,
  isSidebarOpen,
  onToggleSidebar,
  profileDisplayName,
  profilePhotoURL,
  isProfileOpen,
  onOpenProfile,
  contacts,
  contactsLoading,
  selectedContactId,
  onSelectContact,
  onRenameContact,
  onContactPeer,
  onRemoveContact,
}: Props) {
  return (
    <aside
      className={`flex flex-col bg-[#13131a] border-r border-white/[0.06] transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-16'}`}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        {isSidebarOpen && (
          <span className="font-bold text-white tracking-tight">Tel-Talk</span>
        )}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label={isSidebarOpen ? 'Ciutkan sidebar' : 'Perluas sidebar'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isSidebarOpen ? 'M11 19l-7-7 7-7' : 'M13 5l7 7-7 7'} />
          </svg>
        </button>
      </div>

      <div className="flex gap-1 p-3 border-b border-white/[0.06]">
        <button
          type="button"
          onClick={() => onTabChange('chat')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'chat'
              ? 'bg-violet-600/20 text-violet-300'
              : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          {isSidebarOpen ? 'Chat' : '💬'}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('contacts')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'contacts'
              ? 'bg-violet-600/20 text-violet-300'
              : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          {isSidebarOpen ? 'Kontak' : '👥'}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('ai')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
            ${activeTab === 'ai'
              ? 'bg-violet-600/20 text-violet-300'
              : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          {isSidebarOpen ? 'AI' : '🤖'}
        </button>
      </div>

      {activeTab === 'chat' && (
        <RoomList
          rooms={rooms}
          activeRoomId={activeRoomId}
          isSidebarOpen={isSidebarOpen}
          onSelectRoom={onSelectRoom}
        />
      )}

      {activeTab === 'contacts' && (
        <ContactSidebarList
          contacts={contacts}
          isLoading={contactsLoading}
          isSidebarOpen={isSidebarOpen}
          selectedContactId={selectedContactId}
          onSelectContact={onSelectContact}
          onRename={onRenameContact}
          onContact={onContactPeer}
          onRemove={onRemoveContact}
        />
      )}

      {activeTab === 'ai' && <ChatbotSidebar isSidebarOpen={isSidebarOpen} />}

      <ProfileSidebarTrigger
        isSidebarOpen={isSidebarOpen}
        displayName={profileDisplayName}
        photoURL={profilePhotoURL}
        isProfileOpen={isProfileOpen}
        onOpenProfile={onOpenProfile}
      />
    </aside>
  )
}
