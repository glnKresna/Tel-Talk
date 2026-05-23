import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatbotStore } from '../store/useChatbotStore'
import { useMsgStore } from '../store/useMsgStore'
import { DashboardShell } from '../components/dashboard-page/layout/DashboardShell'
import { OwnProfileModal } from '../components/dashboard-page/profile/OwnProfileModal'
import { useOwnProfile } from '../components/dashboard-page/profile/useOwnProfile'
import { ProfileToast } from '../components/dashboard-page/ProfileToast'
import type { ActiveTab, Room } from '../types/dashboardTypes'

const ROOMS: Room[] = [
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'random', name: 'Random', icon: '🎲' },
  { id: 'dev', name: 'Dev Talk', icon: '💻' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { currUser, logoutUser } = useAuthStore()
  const { subscribeToRoom, messages } = useMsgStore()
  const { pesan: aiMessages } = useChatbotStore()

  const profile = useOwnProfile({
    currUser,
    currUserEmail: currUser?.email,
    isModalOpen: isProfileOpen,
  })

  useEffect(() => {
    const unsubscribe = subscribeToRoom(activeRoom.id)
    return () => unsubscribe()
  }, [activeRoom.id, subscribeToRoom])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiMessages])

  return (
    <>
      <DashboardShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rooms={ROOMS}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        messageCount={messages.length}
        bottomRef={bottomRef}
        profileDisplayName={profile.sidebarDisplayName}
        profilePhotoURL={profile.photoURL}
        isProfileOpen={isProfileOpen}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <OwnProfileModal
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currUserEmail={currUser?.email}
        profile={profile}
        onLogout={logoutUser}
      />

      <ProfileToast message={profile.toastMsg} />
    </>
  )
}
