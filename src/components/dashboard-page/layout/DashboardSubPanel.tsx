import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react' // TAMBAHKAN INI
import { Search, Plus, User, Users } from 'lucide-react' // TAMBAHKAN ICON BARU INI
import type { ActiveTab, Room, ModalState } from '../../../types/dashboardTypes' // UPDATE INI
import type { ContactWithProfile } from '../../../types/contactTypes'
import { getContactDisplayName } from '../../../types/contactTypes'
import { ContactSidebarList } from '../contacts/ContactSidebarList'
import { RoomList } from '../chat/RoomList'
import { ChatbotSidebar } from '../ai/ChatbotSidebar'

type SubPanelProps = {
    activeTab: ActiveTab
    rooms: Room[]
    activeRoomId: string
    onSelectRoom: (room: Room) => void
    contacts: ContactWithProfile[]
    contactsLoading: boolean
    selectedContactId: string | null
    onSelectContact: (contactUid: string) => void
    plusModal: ModalState
    setPlusModal: Dispatch<SetStateAction<ModalState>>
}

export function DashboardSubPanel({
    activeTab,
    rooms,
    activeRoomId,
    onSelectRoom,
    contacts,
    contactsLoading,
    selectedContactId,
    onSelectContact,
    plusModal,
    setPlusModal,
    }: SubPanelProps) {
    const [keyword, setKeyword] = useState('')

    const panelTitles = {
        dms: 'Direct Messages',
        rooms: 'Rooms Channel',
        pinned: 'Pesan Berbintang',
        ai: 'AI Assistant',
    }

    // Cek apakah tombol '+' perlu dirender (hanya di DMs dan Rooms)
    const showPlusButton = activeTab === 'dms' || activeTab === 'rooms'

    return (
        // Tambahkan class 'relative' supaya elemen 'absolute' terkurung di dalam panel ini
        <div className="w-[280px] bg-[#111116] border-r border-white/[0.06] flex flex-col h-full z-20 relative">
        <div className="p-4 flex flex-col gap-3 border-b border-white/[0.04]">
            <h2 className="text-md font-semibold text-white/90">{panelTitles[activeTab]}</h2>
            
            {activeTab !== 'ai' && (
            <div className="relative">
                <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                type="text" 
                placeholder="Cari disini..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-[#181824] border border-white/[0.06] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                />
            </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
            {activeTab === 'dms' && (
            <ContactSidebarList 
                contacts={contacts.filter(c => 
                getContactDisplayName(c).toLowerCase().includes(keyword.toLowerCase())
                )}
                isLoading={contactsLoading}
                isSidebarOpen={true}
                selectedContactId={selectedContactId}
                onSelectContact={onSelectContact}
            />
            )}

            {activeTab === 'rooms' && (
            <RoomList 
                rooms={rooms.filter(r => r.name.toLowerCase().includes(keyword.toLowerCase()))}
                activeRoomId={activeRoomId}
                isSidebarOpen={true}
                onSelectRoom={onSelectRoom}
            />
            )}

            {activeTab === 'pinned' && (
            <div className="text-center text-xs text-white/30 pt-8 px-4">
                Tidak ada pesan berbintang yang ditemukan.
            </div>
            )}

            {activeTab === 'ai' && (
              <ChatbotSidebar isSidebarOpen={true} />
            )}
        </div>

        {/* TAMPILAN OVERLAY TOMBOL '+' DAN MODAL */}
        {showPlusButton && (
            <>
            {plusModal.isOpen && (
                <div className="absolute bottom-20 right-5 bg-[#181824] border border-white/[0.08] shadow-2xl rounded-xl py-1.5 w-48 text-sm animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
                <button 
                    onClick={() => {
                      setPlusModal({ isOpen: true, type: 'add_contact' })
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-white/90"
                >
                    <User className="w-4 h-4 text-violet-400" />
                    <span>Tambah Kontak</span>
                </button>
                <button 
                    onClick={() => {
                    alert('Fitur buat room baru dipicu')
                    setPlusModal({ isOpen: false, type: null })
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.04] text-left text-white/90 border-t border-white/[0.04]"
                >
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>Buat Room Baru</span>
                </button>
                </div>
            )}

            <button
                onClick={() => setPlusModal(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                className={`absolute bottom-5 right-5 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg z-40 ${
                plusModal.isOpen 
                    ? 'bg-violet-600 text-white rotate-45' 
                    : 'bg-violet-500 hover:bg-violet-600 text-white'
                }`}
            >
                <Plus className="w-6 h-6" />
            </button>
            </>
        )}
        </div>
    )
}