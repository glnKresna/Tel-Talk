import { useState, useRef, type ChangeEvent, type KeyboardEvent, type RefObject } from 'react';
import { useMsgStore } from '../../store/useMsgStore';
import { useAuthStore } from '../../store/useAuthStore';
import MessageBubble from '../../components/messageBubble';
import { IconButton } from '../../components/UI/IconButton';
import { AutoResizeTextarea } from '../../components/UI/AutoResizeTextarea';
import type { FilePreviewState, Room } from './types';

// ================= SIDEBAR =================
type SidebarProps = {
  rooms: Room[]
  activeRoomId: string
  isSidebarOpen: boolean
  onSelectRoom: (room: Room) => void
}

export function ChatRoomsSidebar({ rooms, activeRoomId, isSidebarOpen, onSelectRoom }: SidebarProps) {
  return (
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelectRoom(room)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
            ${activeRoomId === room.id
              ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
              : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
        >
          <span className="text-base">{room.icon}</span>
          {isSidebarOpen && <span className="font-medium">{room.name}</span>}
        </button>
      ))}
    </nav>
  )
}

// ================= HEADER =================
type HeaderProps = {
  activeRoom: Room
  messageCount: number
}

export function ChatRoomsHeader({ activeRoom, messageCount }: HeaderProps) {
  return (
    <>
      <span className="text-xl">{activeRoom.icon}</span>
      <div>
        <h2 className="font-semibold text-white text-sm">{activeRoom.name}</h2>
        <p className="text-[11px] text-zinc-500">{messageCount} pesan</p>
      </div>
    </>
  )
}

// ================= MAIN (CHAT AREA) =================
type MainProps = {
  activeRoom: Room
  bottomRef: RefObject<HTMLDivElement | null>
}

export function ChatRoomsMain({ activeRoom, bottomRef }: MainProps) {
  // Global store
  const { messages, isLoading: msgLoading, kirimPesan, kirimLampiran } = useMsgStore();
  const { currUser } = useAuthStore();

  const [inputText, setInputText] = useState('');
  const [filePreview, setFilePreview] = useState<FilePreviewState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler buat input file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreview({ file, previewUrl: URL.createObjectURL(file) });
    }
  }

  const handleClearFilePreview = () => {
    if (filePreview?.previewUrl) {
      URL.revokeObjectURL(filePreview.previewUrl);
    }
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const handleSendText = async () => {
    if (inputText.trim() === '' && !filePreview) return;
  
    if (filePreview) {
      await kirimLampiran(activeRoom.id, filePreview.file, currUser, inputText.trim());
      handleClearFilePreview();
    } else {
      await kirimPesan(activeRoom.id, inputText.trim(), currUser);
    }
    setInputText('');
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  }

  return (
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
              <span className="text-zinc-400">📄</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-300 truncate">{filePreview.file.name}</p>
            <p className="text-[10px] text-zinc-500">{(filePreview.file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={handleClearFilePreview}
            className="text-zinc-500 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-6 pb-5 pt-2">
        <div className="flex items-end gap-2 bg-[#1e1e2a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-colors">
          
          <IconButton
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            }
          />
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

          <AutoResizeTextarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={filePreview ? 'Tambah caption (opsional)...' : 'Ketik pesan...'}
          />

          <IconButton
            variant="primary"
            onClick={handleSendText}
            disabled={!inputText.trim() && !filePreview}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            }
          />
          
        </div>
        <p className="text-[10px] text-zinc-600 mt-1.5 text-center">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </>
  )
}