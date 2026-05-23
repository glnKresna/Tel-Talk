import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from 'react'
import { useMsgStore } from '../../../store/useMsgStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { IconButton } from '../../UI/IconButton'
import { AutoResizeTextarea } from '../../UI/AutoResizeTextarea'
import type { FilePreviewState, Room } from '../../../types/dashboardTypes'
import { MessageList } from './MessageList'

type Props = {
  activeRoom: Room
  bottomRef: RefObject<HTMLDivElement | null>
}

export function ChatPanel({ activeRoom, bottomRef }: Props) {
  const { messages, isLoading: msgLoading, error: msgError, kirimPesan, kirimLampiran, hapusPesan } =
    useMsgStore()
  const { currUser } = useAuthStore()

  const [inputText, setInputText] = useState('')
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null)
  const [filePreview, setFilePreview] = useState<FilePreviewState | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const isSendingRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditingMessageId(null)
    setInputText('')
    setDeleteConfirmMessageId(null)
    setSendError(null)
    handleClearFilePreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom.id])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFilePreview({ file, previewUrl: URL.createObjectURL(file) })
    }
  }

  const handleClearFilePreview = () => {
    if (filePreview?.previewUrl) {
      URL.revokeObjectURL(filePreview.previewUrl)
    }
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendText = async () => {
    if (!currUser) return
    if (isSendingRef.current) return
    if (inputText.trim() === '' && !filePreview) return

    isSendingRef.current = true
    setIsSending(true)

    const trimmedText = inputText.trim()
    const pendingFile = filePreview?.file ?? null
    const pendingEditId = editingMessageId

    setSendError(null)

    try {
      if (pendingEditId) {
        await useMsgStore.getState().editPesan(activeRoom.id, pendingEditId, trimmedText)
      } else if (pendingFile) {
        await kirimLampiran(activeRoom.id, pendingFile, currUser, trimmedText)
      } else {
        await kirimPesan(activeRoom.id, trimmedText, currUser)
      }

      setInputText('')
      setEditingMessageId(null)
      if (filePreview) handleClearFilePreview()
    } catch {
      setSendError('Gagal mengirim pesan. Coba lagi.')
    } finally {
      isSendingRef.current = false
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isSendingRef.current) void handleSendText()
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirmMessageId) return
    setDeleteConfirmMessageId(null)
    await hapusPesan(activeRoom.id, deleteConfirmMessageId)
  }

  return (
    <>
      <MessageList
        activeRoom={activeRoom}
        messages={messages}
        msgLoading={msgLoading}
        msgError={msgError}
        bottomRef={bottomRef}
        currentUserId={currUser?.uid}
        onRequestEdit={(messageId, currentText) => {
          if (isSendingRef.current) return
          setEditingMessageId(messageId)
          setInputText(currentText)
        }}
        onRequestDelete={(messageId) => {
          if (isSendingRef.current) return
          setDeleteConfirmMessageId(messageId)
        }}
      />

      {deleteConfirmMessageId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setDeleteConfirmMessageId(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl bg-[#13131a] border border-white/[0.08] shadow-2xl p-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-white">Hapus pesan?</p>
            <p className="text-xs text-zinc-400 mt-1">Pesan akan dihapus permanen.</p>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-sm font-semibold text-white transition-colors"
                onClick={() => setDeleteConfirmMessageId(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/25 border border-red-500/30 text-sm font-semibold text-red-200 transition-colors"
                onClick={() => void handleConfirmDelete()}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
          <button type="button" onClick={handleClearFilePreview} className="text-zinc-500 hover:text-red-400 transition-colors">
            ✕
          </button>
        </div>
      )}

      <div className="px-6 pb-5 pt-2">
        {sendError && (
          <p className="mb-2 text-xs text-red-300 text-center" role="alert">
            {sendError}
          </p>
        )}
        {editingMessageId && (
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>Mengedit pesan</span>
            <button
              type="button"
              className="text-zinc-500 hover:text-zinc-200 transition-colors"
              onClick={() => {
                if (isSendingRef.current) return
                setEditingMessageId(null)
                setInputText('')
              }}
            >
              Batal
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-[#1e1e2a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-colors">
          <IconButton
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || Boolean(editingMessageId)}
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
            disabled={isSending}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessageId
                ? 'Mengedit pesan...'
                : filePreview
                  ? 'Tambah caption (opsional)...'
                  : 'Ketik pesan...'
            }
          />
          <IconButton
            variant="primary"
            onClick={() => void handleSendText()}
            disabled={isSending || (!inputText.trim() && !filePreview)}
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
