import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Message } from '../store/useMsgStore'

type Props = {
  message: Message
  isOwnMessage: boolean
}

export default function MessageBubble({ message, isOwnMessage }: Props) {
  const { text, senderEmail, createdAt, fileUrl, fileName, fileType } = message

  const formattedTime = createdAt ? format(createdAt.toDate(), 'HH:mm', { locale: id }) : ''

  const isImage = fileType?.startsWith('image/')
  const isVideo = fileType?.startsWith('video/')
  const isAudio = fileType?.startsWith('audio/')

  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwnMessage && (
        <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-[10px] font-bold text-violet-300">
            {senderEmail?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[72%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <span className="text-[10px] text-zinc-500 px-1">{senderEmail}</span>
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
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={fileUrl}
                    alt={fileName ?? 'attachment'}
                    className="max-w-[260px] max-h-[200px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </a>
              )}

              {isVideo && (
                <video src={fileUrl} controls className="max-w-[260px] rounded-xl" />
              )}

              {isAudio && (
                <audio src={fileUrl} controls className="w-full" />
              )}

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
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="truncate max-w-[180px]">{fileName ?? 'File'}</span>
                </a>
              )}
            </div>
          )}

          {text && <p className="break-words">{text}</p>}

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
