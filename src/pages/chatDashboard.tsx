// TODO: Import React hooks
// TODO: Import useChatStore, useAuthStore
// TODO: Import MessageBubble component
// TODO: Buat & export ChatDashboard component
// TODO: Return layout JSX (sidebar kiri buat daftar chat & navigasi, sebelah kanan buat active chat)
// TODO: Petakan semua daftar chat yang ada di sidebar
// TODO: Petakan chat yang aktif & render komponen <MessageBubble /> di area utama sebelah kanan
// TODO: Buat UI message box (textarea)

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useMsgStore } from '../store/useMsgStore'
import { useChatbotStore } from '../store/useChatbotStore'
import MessageBubble from '../components/messageBubble'

interface Room {
  id: string;
  name: string;
  icon: string;
}

interface FilePreviewState {
  file: File;
  previewUrl: string | null;
}

// Daftar room chat yang tersedia
const ROOMS = [
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'random', name: 'Random', icon: '🎲' },
  { id: 'dev', name: 'Dev Talk', icon: '💻' },
]

export default function ChatDashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'ai'> ('chat') // 'chat' | 'ai'
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0])
  const [inputText, setInputText] = useState('')
  const [aiInput, setAiInput] = useState('')
  const [filePreview, setFilePreview] = useState<FilePreviewState | null>(null) // { file, previewUrl }
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { currUser, logoutUser } = useAuthStore()
  const { messages, listenMessages, stopListening, sendMessage, sendFileMessage, isLoading: msgLoading } = useMsgStore()
  const { pesan: aiMessages, sendMsg: sendAiMsg, isLoading: aiLoading } = useChatbotStore()

  // Subscribe ke room yang aktif
  useEffect(() => {
    listenMessages(activeRoom.id)
    return () => stopListening()
  }, [activeRoom.id])

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiMessages])

  // Kirim pesan teks / file
  const handleSend = async () => {
    if (!currUser) return
    const senderEmail = currUser.email ?? ''

    if (filePreview) {
      await sendFileMessage(activeRoom.id, filePreview.file, currUser.uid, senderEmail, inputText)
      setFilePreview(null)
    } else if (inputText.trim()) {
      await sendMessage(activeRoom.id, inputText.trim(), currUser.uid, senderEmail)
    }
    setInputText('')
  }

  // Enter to send (Shift+Enter untuk newline)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle upload file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setFilePreview({ file, previewUrl })
  }

  // Kirim ke AI chatbot
  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return
    const msg = aiInput.trim()
    setAiInput('')
    await sendAiMsg(msg)
  }

  const handleAiKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAiSend()
    }
  }

  return (
    <div className="flex h-screen bg-[#0f0f14] text-white overflow-hidden">
      {/* ────────── SIDEBAR ────────── */}
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
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
              ${activeTab === 'chat'
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {isSidebarOpen ? 'Chat' : '💬'}
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
              ${activeTab === 'ai'
                ? 'bg-violet-600/20 text-violet-300'
                : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {isSidebarOpen ? 'AI Bot' : '🤖'}
          </button>
        </div>

        {/* Room list (hanya di tab chat) */}
        {activeTab === 'chat' && (
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {ROOMS.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${activeRoom.id === room.id
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
              >
                <span className="text-base">{room.icon}</span>
                {isSidebarOpen && <span className="font-medium">{room.name}</span>}
              </button>
            ))}
          </nav>
        )}

        {/* AI info */}
        {activeTab === 'ai' && isSidebarOpen && (
          <div className="flex-1 p-4">
            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-3">
              <p className="text-xs text-violet-300 font-medium mb-1">Gemini AI</p>
              <p className="text-xs text-zinc-500">Tanya apa saja, AI siap bantu kamu.</p>
            </div>
          </div>
        )}

        {/* User info + logout */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-violet-300">
                {currUser?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            {isSidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate">{currUser?.email}</p>
                </div>
                <button
                  onClick={logoutUser}
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

      {/* ────────── MAIN AREA ────────── */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-[#13131a]/50 backdrop-blur-sm">
          {activeTab === 'chat' ? (
            <>
              <span className="text-xl">{activeRoom.icon}</span>
              <div>
                <h2 className="font-semibold text-white text-sm">{activeRoom.name}</h2>
                <p className="text-[11px] text-zinc-500">{messages.length} pesan</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <h2 className="font-semibold text-white text-sm">Gemini AI</h2>
                <p className="text-[11px] text-zinc-500">Powered by Google</p>
              </div>
            </>
          )}
        </header>

        {/* ── CHAT TAB ── */}
        {activeTab === 'chat' && (
          <>
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
              {msgLoading && messages.length === 0 && (
                <div className="flex justify-center py-10">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {messages.length === 0 && !msgLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <span className="text-4xl mb-3">{activeRoom.icon}</span>
                  <p className="text-zinc-500 text-sm">Belum ada pesan di #{activeRoom.name}</p>
                  <p className="text-zinc-600 text-xs mt-1">Jadilah yang pertama ngobrol!</p>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwnMessage={msg.senderId === currUser?.uid}
                />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* File preview sebelum kirim */}
            {filePreview && (
              <div className="mx-6 mb-2 flex items-center gap-3 bg-[#1e1e2a] border border-white/[0.08] rounded-xl p-3">
                {filePreview.previewUrl ? (
                  <img src={filePreview.previewUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate">{filePreview.file.name}</p>
                  <p className="text-[10px] text-zinc-500">{(filePreview.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => setFilePreview(null)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Input bar */}
            <div className="px-6 pb-5 pt-2">
              <div className="flex items-end gap-2 bg-[#1e1e2a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-colors">
                {/* Attach file */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-500 hover:text-violet-400 transition-colors mb-0.5 flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

                {/* Textarea */}
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={filePreview ? 'Tambah caption (opsional)...' : 'Ketik pesan...'}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 resize-none outline-none max-h-32 leading-relaxed"
                  style={{ height: 'auto' }}
                  onInput={(e: FormEvent<HTMLTextAreaElement>) => {
                    const target = e.currentTarget
                    target.style.height = 'auto'
                    target.style.height = `${target.scrollHeight}px`
                  }}
                />

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() && !filePreview}
                  className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed
                    flex items-center justify-center transition-all flex-shrink-0 mb-0.5"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1.5 text-center">
                Enter to send · Shift+Enter for newline
              </p>
            </div>
          </>
        )}

        {/* ── AI TAB ── */}
        {activeTab === 'ai' && (
          <>
            {/* AI messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {aiMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <span className="text-4xl mb-3">🤖</span>
                  <p className="text-zinc-400 text-sm font-medium">Gemini AI siap membantu</p>
                  <p className="text-zinc-600 text-xs mt-1">Tanya apa saja, dalam bahasa apapun</p>
                </div>
              )}

              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                    ${msg.role === 'user'
                      ? 'bg-violet-600/30 border border-violet-500/30'
                      : 'bg-emerald-600/20 border border-emerald-500/30'}`}>
                    <span className="text-xs">{msg.role === 'user' ? '👤' : '🤖'}</span>
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-[#1e1e2a] border border-white/[0.06] text-zinc-200 rounded-bl-sm'}`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div className="bg-[#1e1e2a] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* AI Input */}
            <div className="px-6 pb-5 pt-2">
              <div className="flex items-end gap-2 bg-[#1e1e2a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-emerald-500/40 transition-colors">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={handleAiKeyDown}
                  placeholder="Tanya Gemini..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 resize-none outline-none max-h-32 leading-relaxed"
                  onInput={(e: FormEvent<HTMLTextAreaElement>) => {
                    const target = e.currentTarget
                    target.style.height = 'auto'
                    target.style.height = `${target.scrollHeight}px`
                  }}
                />
                <button
                  onClick={handleAiSend}
                  disabled={!aiInput.trim() || aiLoading}
                  className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed
                    flex items-center justify-center transition-all flex-shrink-0 mb-0.5"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
