import type { RefObject } from 'react'
import type { ActiveTab, Room } from '../../../types/dashboardTypes'
import { DashboardSidebar } from '../sidebar/DashboardSidebar'
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
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  messageCount: number
  bottomRef: RefObject<HTMLDivElement | null>
  profileDisplayName: string
  profilePhotoURL: string | null
  isProfileOpen: boolean
  onOpenProfile: () => void
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
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-[#13131a]/50 backdrop-blur-sm">
          {activeTab === 'chat' ? (
            <ChatHeader activeRoom={activeRoom} messageCount={messageCount} />
          ) : (
            <ChatbotHeader />
          )}
        </header>

        {activeTab === 'chat' ? (
          <ChatPanel activeRoom={activeRoom} bottomRef={bottomRef} />
        ) : (
          <ChatbotPanel bottomRef={bottomRef} />
        )}
      </main>
    </div>
  )
}
