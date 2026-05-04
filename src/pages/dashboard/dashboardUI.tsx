import type { ChangeEvent, KeyboardEvent, RefObject } from 'react'
import type { Pesan } from '../../store/useMsgStore'
import type { ActiveTab, ChatbotMsg, FilePreviewState, Room } from './types'
import { ChatRoomsHeader, ChatRoomsMain, ChatRoomsSidebar } from './chatRoomsUI'
import { ChatbotHeader, ChatbotMain, ChatbotSidebar } from './chatbotUI'

type Props = {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void

  rooms: Room[]
  activeRoom: Room
  onSelectRoom: (room: Room) => void

  isSidebarOpen: boolean
  onToggleSidebar: () => void

  currUserEmail?: string | null
  onLogout: () => void

  // Chat
  messages: Pesan[]
  msgLoading: boolean
  currUserId?: string
  inputText: string
  onInputTextChange: (text: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  filePreview: FilePreviewState | null
  fileInputRef: RefObject<HTMLInputElement | null>
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onClearFilePreview: () => void
  bottomRef: RefObject<HTMLDivElement | null>

  // AI
  aiMessages: ChatbotMsg[]
  aiLoading: boolean
  aiInput: string
  onAiInputChange: (text: string) => void
  onAiKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onAiSend: () => void
}

export default function ChatDashboardUI({
  activeTab,
  onTabChange,
  rooms,
  activeRoom,
  onSelectRoom,
  isSidebarOpen,
  onToggleSidebar,
  currUserEmail,
  onLogout,
  messages,
  msgLoading,
  currUserId,
  inputText,
  onInputTextChange,
  onKeyDown,
  onSend,
  filePreview,
  fileInputRef,
  onFileChange,
  onClearFilePreview,
  bottomRef,
  aiMessages,
  aiLoading,
  aiInput,
  onAiInputChange,
  onAiKeyDown,
  onAiSend,
}: Props) {
  return (
    <div className="flex h-screen bg-[#0f0f14] text-white overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`flex flex-col bg-[#13131a] border-r border-white/[0.06] transition-all duration-300
          ${isSidebarOpen ? 'w-64' : 'w-16'}`}
      >
        {/* Brand */}
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
            onClick={onToggleSidebar}
            className="ml-auto text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={isSidebarOpen ? 'M11 19l-7-7 7-7' : 'M13 5l7 7-7 7'} />
            </svg>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-3 border-b border-white/[0.06]">
          <button
            onClick={() => onTabChange('chat')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
              ${activeTab === 'chat'
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {isSidebarOpen ? 'Chat' : '💬'}
          </button>
          <button
            onClick={() => onTabChange('ai')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
              ${activeTab === 'ai'
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {isSidebarOpen ? 'AI Bot' : '🤖'}
          </button>
        </div>

        {/* Sidebar content */}
        {activeTab === 'chat' ? (
          <ChatRoomsSidebar
            rooms={rooms}
            activeRoomId={activeRoom.id}
            isSidebarOpen={isSidebarOpen}
            onSelectRoom={onSelectRoom}
          />
        ) : (
          <ChatbotSidebar isSidebarOpen={isSidebarOpen} />
        )}

        {/* User info + logout */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-violet-300">
                {currUserEmail?.[0]?.toUpperCase()}
              </span>
            </div>
            {isSidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate">{currUserEmail}</p>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-[#13131a]/50 backdrop-blur-sm">
          {activeTab === 'chat' ? (
            <ChatRoomsHeader activeRoom={activeRoom} messageCount={messages.length} />
          ) : (
            <ChatbotHeader />
          )}
        </header>

        {/* Content */}
        {activeTab === 'chat' ? (
          <ChatRoomsMain
            activeRoom={activeRoom}
            messages={messages}
            msgLoading={msgLoading}
            currUserId={currUserId}
            bottomRef={bottomRef}
            filePreview={filePreview}
            fileInputRef={fileInputRef}
            onFileChange={onFileChange}
            onClearFilePreview={onClearFilePreview}
            inputText={inputText}
            onInputTextChange={onInputTextChange}
            onKeyDown={onKeyDown}
            onSend={onSend}
          />
        ) : (
          <ChatbotMain
            aiMessages={aiMessages}
            aiLoading={aiLoading}
            aiInput={aiInput}
            bottomRef={bottomRef}
            onAiInputChange={onAiInputChange}
            onAiKeyDown={onAiKeyDown}
            onAiSend={onAiSend}
          />
        )}
      </main>
    </div>
  )
}
