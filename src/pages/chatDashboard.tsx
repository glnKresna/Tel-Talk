import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatbotStore } from '../store/useChatbotStore'
import { useMsgStore } from '../store/useMsgStore'
import ChatDashboardUI from './dashboard/dashboardUI'
import type { ActiveTab, Room } from './dashboard/types'

const ROOMS: Room[] = [
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'random', name: 'Random', icon: '🎲' },
  { id: 'dev', name: 'Dev Talk', icon: '💻' },
]

export default function ChatDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { currUser, logoutUser } = useAuthStore();
  const { subscribeToRoom, messages } = useMsgStore();
  const { pesan: aiMessages } = useChatbotStore();

  useEffect(() => {
    if (activeRoom) {
      const unsubscribe = subscribeToRoom(activeRoom.id);
      return () => unsubscribe();
    }
  }, [activeRoom.id, subscribeToRoom]);

  // Auto-scroll ke bawah setiap kali messages atau aiMessages berubah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiMessages]);

  return (
    <ChatDashboardUI
      activeTab={activeTab}
      onTabChange={setActiveTab}
      rooms={ROOMS}
      activeRoom={activeRoom}
      onSelectRoom={setActiveRoom}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      currUserEmail={currUser?.email}
      onLogout={logoutUser}
      bottomRef={bottomRef}
    />
  )
}