// TODO: Buat & export the MessageBubble component
// TODO: Terima 'message' & 'isOwnMessage' sebagai props
// TODO: Import date-fns (buat ngeformatin timestamp default-nya Firestore)
// TODO: Tambah conditional logic buat nge-render preview suatu file (kalau pesan yang dikirim ada lampiran file)
// TODO: Return JSX (pake 'isOwnMessage' buat ngatur alignment ke kiri/kanan + ubah warna)

import { format } from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * MessageBubble
 * @param {object} message   - objek pesan dari Firestore
 * @param {boolean} isOwnMessage - apakah pesan ini milik user yang sedang login
 */
export default function MessageBubble({ message, isOwnMessage }) {
  const { text, senderEmail, createdAt, fileUrl, fileName, fileType } = message

  // Format timestamp dari Firestore Timestamp
  const formattedTime = createdAt
    ? format(createdAt.toDate(), 'HH:mm', { locale: id })
    : ''

  // Cek tipe file untuk preview yang sesuai
  const isImage = fileType?.startsWith('image/')
  const isVideo = fileType?.startsWith('video/')
  const isAudio = fileType?.startsWith('audio/')

  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar inisial */}
      {!isOwnMessage && (
        <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-[10px] font-bold text-violet-300">
            {senderEmail?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[72%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Nama pengirim (hanya untuk pesan orang lain) */}
        {!isOwnMessage && (
          <span className="text-[10px] text-zinc-500 px-1">{senderEmail}</span>
        )}

        {/* Bubble pesan */}
        <div
          className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md
            ${isOwnMessage
              ? 'bg-violet-600 text-white rounded-br-sm'
              : 'bg-[#1e1e2a] border border-white/[0.06] text-zinc-200 rounded-bl-sm'
            }`}
        >
          {/* ── Preview File ── */}
          {fileUrl && (
            <div className="mb-2">
              {isImage && (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={fileUrl}
                    alt={fileName}
                    className="max-w-[260px] max-h-[200px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </a>
              )}

              {isVideo && (
                <video
                  src={fileUrl}
                  controls
                  className="max-w-[260px] rounded-xl"
                />
              )}

              {isAudio && (
                <audio src={fileUrl} controls className="w-full" />
              )}

              {/* File lainnya (PDF, docx, dll) */}
              {!isImage && !isVideo && !isAudio && (
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
                  {/* File icon */}
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate max-w-[180px]">{fileName}</span>
                </a>
              )}
            </div>
          )}

          {/* Teks pesan */}
          {text && <p className="break-words">{text}</p>}

          {/* Timestamp */}
          <span
            className={`block text-right text-[10px] mt-1 select-none
              ${isOwnMessage ? 'text-violet-200/60' : 'text-zinc-500'}`}
          >
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  )
}