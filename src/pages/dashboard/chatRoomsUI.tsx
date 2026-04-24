import type { ChangeEvent, FormEvent, KeyboardEvent, RefObject } from 'react'
import type { Message } from '../../store/useMsgStore'
import type { FilePreviewState, Room } from './types'
import MessageBubble from '../../components/messageBubble'

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

type MainProps = {
  activeRoom: Room
  messages: Message[]
  msgLoading: boolean
  currUserId?: string
  bottomRef: RefObject<HTMLDivElement | null>

  filePreview: FilePreviewState | null
  fileInputRef: RefObject<HTMLInputElement | null>
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  onClearFilePreview: () => void

  inputText: string
  onInputTextChange: (text: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onSend: () => void
}

export function ChatRoomsMain({
  activeRoom,
  messages,
  msgLoading,
  currUserId,
  bottomRef,
  filePreview,
  fileInputRef,
  onFileChange,
  onClearFilePreview,
  inputText,
  onInputTextChange,
  onKeyDown,
  onSend,
}: MainProps) {
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
            isOwnMessage={msg.senderId === currUserId}
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
            onClick={onClearFilePreview}
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
          <input ref={fileInputRef} type="file" className="hidden" onChange={onFileChange} />

          {/* Textarea */}
          <textarea
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
            onKeyDown={onKeyDown}
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
            onClick={onSend}
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
  )
}
