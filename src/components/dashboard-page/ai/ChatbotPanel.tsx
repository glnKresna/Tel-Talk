import { useState, useEffect, type KeyboardEvent, type RefObject } from 'react'
import { IconButton } from '../../UI/IconButton'
import { AutoResizeTextarea } from '../../UI/AutoResizeTextarea'
import { useChatbotStore } from '../../../store/useChatbotStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { MarkdownRenderer } from './MarkdownRenderer'

type Props = {
  bottomRef: RefObject<HTMLDivElement | null>
}

export function ChatbotPanel({ bottomRef }: Props) {
  const { currUser } = useAuthStore()
  const {
    activeSessionId,
    messages: aiMessages,
    isLoading: aiLoading,
    sendMsg: sendAiMsg,
    subscribeMessages,
    createSession,
    setActiveSessionId,
  } = useChatbotStore()

  const [aiInput, setAiInput] = useState('')

  // Subscribe to messages in active session
  useEffect(() => {
    if (!currUser?.uid || !activeSessionId) return
    return subscribeMessages(currUser.uid, activeSessionId)
  }, [currUser?.uid, activeSessionId, subscribeMessages])

  const handleAiSend = async () => {
    if (!currUser?.uid) return
    if (!aiInput.trim() || aiLoading) return
    const msg = aiInput.trim()
    setAiInput('')

    try {
      let targetSessionId = activeSessionId
      if (!targetSessionId) {
        targetSessionId = await createSession(currUser.uid)
        setActiveSessionId(targetSessionId)
      }
      await sendAiMsg(currUser.uid, targetSessionId, msg)
    } catch (err) {
      console.error('Failed to send AI message:', err)
    }
  }

  const handleAiKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleAiSend()
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

        {/* Message Feed */}
        {activeSessionId &&
          aiMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {msg.role !== 'user' && (
                <div
                  className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-1 select-none"
                >
                  <span className="text-xs">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed select-text
                  ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm shadow-md'
                      : 'bg-[#1e1e2a] border border-white/[0.06] text-zinc-200 rounded-bl-sm shadow-md'
                  }`}
              >
                {msg.role === 'model' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

        {/* AI Thinking Bounce States */}
        {activeSessionId && aiLoading && (
          <div className="flex gap-3 animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center select-none">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-[#1e1e2a] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((bounceIndex) => (
                  <div
                    key={bounceIndex}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                    style={{ animationDelay: `${bounceIndex * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Message Area */}
      <div className="px-6 pb-5 pt-2">
        <div
          className="flex items-end gap-2 border border-white/[0.08] rounded-2xl px-4 py-3 transition-colors bg-[#1e1e2a] focus-within:border-emerald-500/40"
        >
          <AutoResizeTextarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={handleAiKeyDown}
            disabled={aiLoading}
            placeholder="Tanya Tel-Bot..."
          />
          <IconButton
            variant="ai"
            onClick={() => void handleAiSend()}
            disabled={!aiInput.trim() || aiLoading}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            }
          />
        </div>
      </div>
    </>
  )
}
