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
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0]);
  const [inputText, setInputText] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { currUser, logoutUser } = useAuthStore();
  const { kirimPesan, kirimLampiran, subscribeToRoom, messages, isLoading: msgLoading } = useMsgStore();
  const { pesan: aiMessages, sendMsg: sendAiMsg, isLoading: aiLoading } = useChatbotStore();

  const [filePreview, setFilePreview] = useState<FilePreviewState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeRoom) {
      const unsubscribe = subscribeToRoom(activeRoom.id);

      return() => unsubscribe();
    }
  }, [activeRoom.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiMessages]);

  

  const handleSendText = async () => {
    if (inputText.trim() === '' && !filePreview) return;
  
    if (filePreview) {
      await kirimLampiran(activeRoom.id, filePreview.file, currUser, inputText.trim());
      
      if (filePreview.previewUrl) {
        URL.revokeObjectURL(filePreview.previewUrl);
      }
      
      setFilePreview(null);                        
      if (fileInputRef.current) {
        fileInputRef.current.value = '';           
      }
    } else {
      await kirimPesan(activeRoom.id, inputText.trim(), currUser);
    }

    setInputText('');
}

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFilePreview({
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  }

  const handleClearFilePreview = () => {
    if (filePreview?.previewUrl) {
      URL.revokeObjectURL(filePreview.previewUrl); // Prevent memory leaks!
    }
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the hidden HTML input
    }
  };

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
      onSend={handleSendText}
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

