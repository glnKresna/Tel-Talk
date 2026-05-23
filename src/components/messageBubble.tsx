import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Download, ExternalLink, Pin, X } from 'lucide-react'
import { Edit3, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import type { Pesan } from '../store/useMsgStore'
import { useMsgStore } from '../store/useMsgStore'

type Props = {
  roomId: string
  message: Pesan
  isOwnMessage: boolean
  onRequestEdit: (messageId: string, currentText: string) => void
  onRequestDelete: (messageId: string) => void
}

export default function MessageBubble({
  roomId,
  message,
  isOwnMessage,
  onRequestEdit,
  onRequestDelete,
}: Props) {
  const { isiPesan, senderName, waktuKirim, fileUrl, fileName, fileType } = message
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [menu, setMenu] = useState<{ open: boolean; x: number; y: number }>({
    open: false,
    x: 0,
    y: 0,
  })

  const { togglePin } = useMsgStore()

  const formattedTime = waktuKirim?.toDate ? format(waktuKirim.toDate(), 'HH:mm', { locale: id }) : ''

  const isImage = fileType?.startsWith('image/')
  const isVideo = fileType?.startsWith('video/')
  const isAudio = fileType?.startsWith('audio/')

  const prettyFileName = useMemo(() => {
    if (!fileName) return 'File'
    return fileName
  }, [fileName])

  const handleDownload = async () => {
    if (!fileUrl) return

    try {
      const res = await fetch(fileUrl)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = objectUrl
      a.download = prettyFileName
      document.body.appendChild(a)
      a.click()
      a.remove()

      URL.revokeObjectURL(objectUrl)
    } catch {
      // Fallback: let browser handle it
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleOpenWith = async () => {
    if (!fileUrl) return

    const nav: any = navigator
    if (nav?.share) {
      try {
        await nav.share({ title: prettyFileName, url: fileUrl })
        return
      } catch {

      }
    }

    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (!menu.open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu((m) => ({ ...m, open: false }))
    }
    const onMouseDown = () => setMenu((m) => ({ ...m, open: false }))
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [menu.open])

  const openContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const menuWidth = 200
    const menuHeight = isOwnMessage ? 132 : 88
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8)

    setMenu({ open: true, x, y })
  }

  const onPinClick = async () => {
    setMenu((m) => ({ ...m, open: false }))
    if (!message.id) return
    const nextPinned = !Boolean(message.isPinned)
    await togglePin(roomId, message.id, nextPinned)
  }

  const onEditClick = async () => {
    setMenu((m) => ({ ...m, open: false }))
    if (!message.id) return
    onRequestEdit(message.id, isiPesan ?? '')
  }

  const onDeleteClick = async () => {
    setMenu((m) => ({ ...m, open: false }))
    if (!message.id) return
    onRequestDelete(message.id)
  }

  return (
    <>
      <div
        className={`flex items-end gap-2 mb-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
        onContextMenu={openContextMenu}
      >
      {!isOwnMessage && (
        <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-[10px] font-bold text-violet-300">
            {senderName?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[72%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <span className="text-[10px] text-zinc-500 px-1">{senderName}</span>
        )}

        <div
          className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md
            ${isOwnMessage
              ? 'bg-violet-600 text-white rounded-br-sm'
              : 'bg-[#1e1e2a] border border-white/[0.06] text-zinc-200 rounded-bl-sm'
            }`}
        >
          {fileUrl && (
            <div className="mb-2">
              {isImage && (
                <button type="button" onClick={() => setIsPreviewOpen(true)} className="block">
                  <img
                    src={fileUrl}
                    alt={prettyFileName}
                    className="max-w-[260px] max-h-[200px] rounded-xl object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
                  />
                </button>
              )}

              {isVideo && (
                <button type="button" onClick={() => setIsPreviewOpen(true)} className="block">
                  <video src={fileUrl} className="max-w-[260px] rounded-xl cursor-zoom-in" />
                </button>
              )}

              {isAudio && (
                <audio src={fileUrl} controls className="w-full" />
              )}

              {!isImage && !isVideo && !isAudio && (
                <div className="space-y-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                      ${isOwnMessage
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                      } transition-colors`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="truncate max-w-[180px]">{prettyFileName}</span>
                  </a>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors
                        ${isOwnMessage
                          ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                        }`}
                    >
                      Unduh
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenWith}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors
                        ${isOwnMessage
                          ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                        }`}
                    >
                      Buka dengan...
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isiPesan && <p className="break-words">{isiPesan}</p>}

          <span
            className={`block text-right text-[10px] mt-1 select-none
              ${isOwnMessage ? 'text-violet-200/60' : 'text-zinc-500'}`}
          >
            {message.isPinned && <span className="mr-1">📌</span>}
            {message.editedAt && <span className="mr-1">(diedit)</span>}
            {formattedTime}
          </span>
        </div>
      </div>
      </div>

      {menu.open && (
        <div
          className="fixed z-[70]"
          style={{ left: menu.x, top: menu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="w-[200px] rounded-xl bg-[#13131a] border border-white/[0.08] shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => void onPinClick()}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-200 hover:bg-white/[0.06] transition-colors"
            >
              <Pin size={16} className="text-zinc-300" />
              <span>{message.isPinned ? 'Unpin pesan' : 'Pin pesan'}</span>
            </button>

            {isOwnMessage && (
              <>
                <button
                  type="button"
                  onClick={() => void onEditClick()}
                  disabled={Boolean(fileUrl)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-zinc-200 hover:bg-white/[0.06]"
                >
                  <Edit3 size={16} className="text-zinc-300" />
                  <span>Edit pesan</span>
                </button>
                <button
                  type="button"
                  onClick={() => void onDeleteClick()}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-200 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} className="text-red-200" />
                  <span>Hapus pesan</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isPreviewOpen && fileUrl && (isImage || isVideo) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setIsPreviewOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl bg-[#0f0f14] border border-white/[0.08] shadow-2xl overflow-hidden group"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => void onPinClick()}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors
                  ${message.isPinned ? 'bg-violet-600/20 border-violet-500/30 text-violet-200' : 'bg-white/[0.06] border-white/[0.08] text-white/80 hover:bg-white/[0.10]'}`}
                title="Pin"
              >
                <Pin size={18} />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/80 hover:bg-white/[0.10] flex items-center justify-center transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                type="button"
                onClick={handleOpenWith}
                className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/80 hover:bg-white/[0.10] flex items-center justify-center transition-colors"
                title="Buka di tab baru"
              >
                <ExternalLink size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/80 hover:bg-white/[0.10] flex items-center justify-center transition-colors"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="w-full h-full flex items-center justify-center bg-black">
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={prettyFileName}
                  className="max-h-[85vh] w-auto object-contain"
                />
              ) : (
                <video
                  src={fileUrl}
                  controls
                  autoPlay
                  className="max-h-[85vh] w-full object-contain bg-black"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
