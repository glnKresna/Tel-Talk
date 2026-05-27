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
import MessageBubble from '../../messageBubble'
import { useMsgStore } from '../../../store/useMsgStore'

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
  currentUserId: string
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
  currentUserId,
}: Props) {
  const { starredMessages, isLoading } = useMsgStore()

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
            <div className="text-sm font-medium text-white/80">Pesan Berbintang</div>
          )}
          {activeTab === 'ai' && <ChatbotHeader />}
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'dms' && selectedContact && (
            <ChatPanel activeRoom={{ id: [currentUserId, selectedContact.contactUid].sort().join('_'), name: getContactDisplayName(selectedContact), icon: '👤' }} bottomRef={bottomRef} />
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
            isLoading && starredMessages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : starredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2 select-none text-center px-4">
                <span className="text-4xl">⭐</span>
                <p className="text-sm">Belum ada pesan berbintang</p>
                <p className="text-xs text-zinc-500">Klik kanan pada gelembung pesan di obrolan mana saja untuk membintanginya.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {starredMessages.map((msg) => {
                  const isOwnMessage = msg.senderId === currentUserId
                  const isRoom = msg.parentType === 'rooms'
                  const room = isRoom ? rooms.find((r) => r.id === msg.parentId) : null
                  const originLabel = isRoom
                    ? `${room ? room.name : msg.parentId} · @${msg.senderName}`
                    : `@${msg.senderName}`

                  return (
                    <div key={msg.id} className="flex flex-col gap-2">
                      {/* Smart Header Origin */}
                      <div className="flex items-center gap-1.5 text-xs text-violet-400/80 font-medium px-2">
                        <span className="hover:underline cursor-default select-none">
                          {originLabel}
                        </span>
                      </div>

                      {/* Message Bubble Container with glassmorphic styling */}
                      <div className="bg-[#15151f] rounded-2xl p-4 border border-white/[0.04] transition-all hover:bg-[#181825] hover:border-white/[0.08] shadow-lg">
                        <MessageBubble
                          roomId={msg.parentId!}
                          message={msg}
                          isOwnMessage={isOwnMessage}
                          onRequestEdit={() => {}}
                          onRequestDelete={() => {}}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}
          {activeTab === 'ai' && <ChatbotPanel bottomRef={bottomRef} />}
        </div>
      </main>
    </div>
  )
}