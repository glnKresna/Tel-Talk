import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatbotStore } from '../store/useChatbotStore'
import { useMsgStore } from '../store/useMsgStore'
import ChatDashboardUI from './dashboard/dashboardUI'
import type { ActiveTab, FilePreviewState, Room } from './dashboard/types'

const ROOMS: Room[] = [
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'random', name: 'Random', icon: '🎲' },
  { id: 'dev', name: 'Dev Talk', icon: '💻' },
]

export default function ChatDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0])
  const [inputText, setInputText] = useState('')
  const [aiInput, setAiInput] = useState('')
  const [filePreview, setFilePreview] = useState<FilePreviewState | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { currUser, logoutUser } = useAuthStore()
  const { messages, listenMessages, stopListening, sendMessage, sendFileMessage, isLoading: msgLoading } = useMsgStore()
  const { pesan: aiMessages, sendMsg: sendAiMsg, isLoading: aiLoading } = useChatbotStore()

  useEffect(() => {
    listenMessages(activeRoom.id)
    return () => stopListening()
  }, [activeRoom.id, listenMessages, stopListening])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiMessages])

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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setFilePreview({ file, previewUrl })
  }

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
      messages={messages}
      msgLoading={msgLoading}
      currUserId={currUser?.uid}
      inputText={inputText}
      onInputTextChange={setInputText}
      onKeyDown={handleKeyDown}
      onSend={handleSend}
      filePreview={filePreview}
      fileInputRef={fileInputRef}
      onFileChange={handleFileChange}
      onClearFilePreview={() => setFilePreview(null)}
      bottomRef={bottomRef}
      aiMessages={aiMessages}
      aiLoading={aiLoading}
      aiInput={aiInput}
      onAiInputChange={setAiInput}
      onAiKeyDown={handleAiKeyDown}
      onAiSend={handleAiSend}
    />
  )
}

