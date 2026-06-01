import { useState, useRef, useEffect, type RefObject, type Dispatch, type SetStateAction } from 'react'
import { MoreVertical } from 'lucide-react'
import type { ActiveTab, Room, ModalState } from '../../../types/dashboardTypes'
import type { ContactWithProfile, PublicProfile } from '../../../types/contactTypes'
import { getContactDisplayName } from '../../../types/contactTypes'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { NavRail } from './NavRail'
import { DashboardSubPanel } from './DashboardSubPanel'
import { ChatHeader } from '../chat/ChatHeader'
import { ChatbotHeader } from '../ai/ChatbotHeader'
import { ChatPanel } from '../chat/ChatPanel'
import { ChatbotPanel } from '../ai/ChatbotPanel'
import MessageBubble from '../../messageBubble'
import { useMsgStore } from '../../../store/useMsgStore'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { GroupInfoSidebar } from '../chat/GroupInfoSidebar'
import { UserInfoSidebar } from '../chat/UserInfoSidebar'
import { useRoomStore } from '../../../store/useRoomStore'

type Props = {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  rooms: Room[]
  activeRoom: Room | null
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
  onRenameContact: (contact: ContactWithProfile) => void
  onRemoveContact: (contact: ContactWithProfile) => void
  plusModal: ModalState
  setPlusModal: Dispatch<SetStateAction<ModalState>>
  currentUserId: string
  onViewContactProfile?: () => void
  onViewProfile?: (profile: PublicProfile) => void
  onClearChat?: () => void
  onCloseChat?: () => void
  onCloseRoomChat?: () => void
  onBlockContact?: () => void
  activeProfile?: PublicProfile | null
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
  onRenameContact,
  onRemoveContact,
  plusModal,
  setPlusModal,
  currentUserId,
  onClearChat,
  onCloseChat,
  onCloseRoomChat,
  onBlockContact,
  activeProfile,
  onViewProfile,
}: Props) {
  const { starredMessages, isLoading } = useMsgStore()
  const [dmMenuOpen, setDmMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false)
  const [isDmInfoOpen, setIsDmInfoOpen] = useState(false)

  // States & Refs untuk menu titik tiga header Room
  const [roomMenuOpen, setRoomMenuOpen] = useState(false)
  const roomMenuRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsGroupInfoOpen(false)
    setIsDmInfoOpen(false)
  }, [activeRoom?.id, selectedContactId, activeTab])

  useEffect(() => {
    if (!roomMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (roomMenuRef.current && !roomMenuRef.current.contains(e.target as Node)) {
        setRoomMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [roomMenuOpen])

  const isCurrentUserAdmin = activeRoom 
    ? activeRoom.admin === currentUserId || activeRoom.admins?.includes(currentUserId)
    : false

  const handleRenameRoom = async () => {
    if (!activeRoom) return
    const nextName = window.prompt("Ubah nama Room:", activeRoom.name)
    if (nextName && nextName.trim() && nextName.trim() !== activeRoom.name) {
      if (nextName.trim().length > 25) {
        alert("Nama room maksimal 25 karakter.")
        return
      }
      try {
        await useRoomStore.getState().updateRoomName(activeRoom.id, nextName.trim())
      } catch (err) {
        console.error(err)
        alert("Gagal mengubah nama room.")
      }
    }
  }

  const handleClearRoomChat = async () => {
    if (!activeRoom) return
    const confirmClear = window.confirm("Apakah Anda yakin ingin membersihkan riwayat chat di Room ini?")
    if (confirmClear) {
      try {
        await useRoomStore.getState().clearRoomChat(activeRoom.id, currentUserId)
        alert("Percakapan room berhasil dibersihkan.")
      } catch (err) {
        console.error(err)
        alert("Gagal membersihkan percakapan.")
      }
    }
  }

  const handleLeaveRoom = async () => {
    if (!activeRoom) return
    if (activeRoom.admin === currentUserId) {
      alert("Sebagai Pembuat Room Utama, Anda tidak bisa keluar dari Room.")
      return
    }
    const confirmLeave = window.confirm("Apakah Anda yakin ingin keluar dari Room ini?")
    if (confirmLeave) {
      try {
        await useRoomStore.getState().leaveRoom(activeRoom.id, currentUserId)
        onCloseRoomChat?.()
      } catch (err) {
        console.error(err)
        alert("Gagal keluar dari room.")
      }
    }
  }

  useEffect(() => {
    if (!dmMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDmMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dmMenuOpen])

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
        activeRoomId={activeRoom?.id || ''}
        onSelectRoom={onSelectRoom}
        contacts={contacts}
        contactsLoading={contactsLoading}
        selectedContactId={selectedContactId}
        onSelectContact={onSelectContact}
        plusModal={plusModal}
        setPlusModal={setPlusModal}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c10]">
        <header className="relative z-20 flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-[#13131a]/50 backdrop-blur-sm h-[65px]">
          {activeTab === 'dms' && (
            <div className="flex-1 flex items-center justify-between">
              <div
                className={`flex items-center gap-3 transition-opacity ${selectedContact ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => {
                  if (selectedContact) {
                    setIsDmInfoOpen((prev) => !prev)
                  }
                }}
              >
                {selectedContact && (
                  <AvatarCircle
                    photoURL={activeProfile?.photoURL ?? selectedContact.profile?.photoURL ?? null}
                    displayName={getContactDisplayName(selectedContact).replace(/^@/, '')}
                    size="xs"
                    variant="dashboard"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-tight">
                    {selectedContact ? getContactDisplayName(selectedContact).replace(/^@/, '') : 'Pilih Kontak'}
                  </span>
                  {selectedContact && (
                    <span className="text-[10px] text-zinc-500 font-medium mt-0.5">
                      {activeProfile?.isOnline
                        ? '🟢 Online'
                        : activeProfile?.lastSeen
                        ? `Terakhir dilihat ${formatLastSeen(activeProfile.lastSeen)}`
                        : 'Offline'}
                    </span>
                  )}
                </div>
              </div>

              {selectedContact && (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setDmMenuOpen((v) => !v)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {dmMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#13131a] border border-white/[0.08] shadow-2xl overflow-hidden py-1 z-50">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200"
                        onClick={() => {
                          setDmMenuOpen(false)
                          setIsDmInfoOpen(true)
                        }}
                      >
                        Info Pengguna
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200"
                        onClick={() => {
                          setDmMenuOpen(false)
                          onRenameContact(selectedContact)
                        }}
                      >
                        Ubah Nama
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200"
                        onClick={() => {
                          setDmMenuOpen(false)
                          setIsSearchOpen((v) => !v)
                        }}
                      >
                        Cari
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200"
                        onClick={() => {
                          setDmMenuOpen(false)
                          onClearChat?.()
                        }}
                      >
                        Bersihkan Chat
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200"
                        onClick={() => {
                          setDmMenuOpen(false)
                          onCloseChat?.()
                        }}
                      >
                        Tutup Chat
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200 border-t border-white/[0.04]"
                        onClick={() => {
                          setDmMenuOpen(false)
                          onBlockContact?.()
                        }}
                      >
                        {selectedContact.isBlocked ? 'Buka Blokir Kontak' : 'Blokir Kontak'}
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-500/10 text-left text-xs text-red-300"
                        onClick={() => {
                          setDmMenuOpen(false)
                          onRemoveContact(selectedContact)
                        }}
                      >
                        Hapus Kontak
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeTab === 'rooms' && activeRoom && (
            <div className="flex-1 flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity select-none min-w-0"
                onClick={() => setIsGroupInfoOpen((prev) => !prev)}
                title="Klik untuk info grup"
              >
                <ChatHeader activeRoom={activeRoom} messageCount={messageCount} />
              </div>
              
              <div className="relative" ref={roomMenuRef}>
                <button
                  type="button"
                  onClick={() => setRoomMenuOpen((v) => !v)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
                  title="Menu Room"
                >
                  <MoreVertical size={18} />
                </button>

                {roomMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#13131a] border border-white/[0.08] shadow-2xl overflow-hidden py-1 z-50">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200 cursor-pointer"
                      onClick={() => {
                        setRoomMenuOpen(false)
                        setIsGroupInfoOpen(true)
                      }}
                    >
                      Info Room
                    </button>
                    
                    {isCurrentUserAdmin && (
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200 cursor-pointer"
                        onClick={() => {
                          setRoomMenuOpen(false)
                          void handleRenameRoom()
                        }}
                      >
                        Ubah Nama
                      </button>
                    )}

                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200 cursor-pointer"
                      onClick={() => {
                        setRoomMenuOpen(false)
                        setIsSearchOpen((v) => !v)
                      }}
                    >
                      Cari
                    </button>

                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200 cursor-pointer"
                      onClick={() => {
                        setRoomMenuOpen(false)
                        void handleClearRoomChat()
                      }}
                    >
                      Bersihkan Chat
                    </button>

                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-xs text-zinc-200 cursor-pointer"
                      onClick={() => {
                        setRoomMenuOpen(false)
                        onCloseRoomChat?.()
                      }}
                    >
                      Tutup Chat
                    </button>

                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-500/10 text-left text-xs text-red-300 border-t border-white/[0.04] cursor-pointer"
                      onClick={() => {
                        setRoomMenuOpen(false)
                        void handleLeaveRoom()
                      }}
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'pinned' && (
            <div className="text-sm font-medium text-white/80">Pesan Berbintang</div>
          )}
          {activeTab === 'ai' && <ChatbotHeader />}
        </header>

        <div className={`flex-1 overflow-hidden relative flex ${(activeTab === 'rooms' && isGroupInfoOpen) || (activeTab === 'dms' && isDmInfoOpen && selectedContact) ? 'flex-row' : 'flex-col'}`}>
          {activeTab === 'dms' && selectedContact && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
              <ChatPanel
                activeRoom={{ id: [currentUserId, selectedContact.contactUid].sort().join('_'), name: getContactDisplayName(selectedContact).replace(/^@/, ''), icon: '👤' }}
                bottomRef={bottomRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
                contact={selectedContact}
              />
            </div>
          )}
          {activeTab === 'dms' && !selectedContact && (
            <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2 w-full">
              <span className="text-4xl">💬</span>
              <p className="text-sm">Silakan pilih kontak untuk memulai obrolan pribadi</p>
            </div>
          )}
          {activeTab === 'rooms' && activeRoom && (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
              <ChatPanel
                activeRoom={activeRoom}
                bottomRef={bottomRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isSearchOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
              />
            </div>
          )}
          {activeTab === 'rooms' && !activeRoom && (
            <div className="flex flex-col items-center justify-center h-full text-white/40 gap-2 w-full">
              <span className="text-4xl">💬</span>
              <p className="text-sm">Silakan pilih room untuk memulai obrolan grup</p>
            </div>
          )}
          {activeTab === 'rooms' && isGroupInfoOpen && activeRoom && (
            <GroupInfoSidebar
              activeRoom={activeRoom}
              onClose={() => setIsGroupInfoOpen(false)}
              currentUserId={currentUserId}
              onViewProfile={onViewProfile}
            />
          )}
          {activeTab === 'dms' && isDmInfoOpen && selectedContact && (
            <UserInfoSidebar
              contact={selectedContact}
              activeProfile={activeProfile ?? null}
              onClose={() => setIsDmInfoOpen(false)}
              onRenameContact={onRenameContact}
              onBlockContact={() => onBlockContact?.()}
              onRemoveContact={onRemoveContact}
            />
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
                          onRequestEdit={() => { }}
                          onRequestDelete={() => { }}
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

function formatLastSeen(timestamp: any): string {
  if (!timestamp) return 'Offline'
  try {
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp.seconds * 1000)
    const now = new Date()
    
    // Check if today
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                    
    if (isToday) {
      return `hari ini pukul ${format(date, 'HH:mm', { locale: id })}`
    }
    
    // Check if yesterday
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = date.getDate() === yesterday.getDate() &&
                        date.getMonth() === yesterday.getMonth() &&
                        date.getFullYear() === yesterday.getFullYear()
                        
    if (isYesterday) {
      return `kemarin pukul ${format(date, 'HH:mm', { locale: id })}`
    }
    
    return format(date, 'd MMMM yyyy pukul HH:mm', { locale: id })
  } catch (err) {
    console.error('Error formatting last seen:', err)
    return 'Offline'
  }
}