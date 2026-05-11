import { useState, type KeyboardEvent, type RefObject } from 'react';
import { IconButton } from '../../components/UI/IconButton';
import { AutoResizeTextarea } from '../../components/UI/AutoResizeTextarea';
import { useChatbotStore } from '../../store/useChatbotStore';

type SidebarProps = {
  isSidebarOpen: boolean
}

export function ChatbotSidebar({ isSidebarOpen }: SidebarProps) {
  if (!isSidebarOpen) return null

  return (
    <div className="flex-1 p-4">
      <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-3">
        <p className="text-xs text-violet-300 font-medium mb-1">Tel-Bot</p>
        <p className="text-xs text-zinc-500">Tanya apa saja, AI siap bantu kamu.</p>
      </div>
    </div>
  )
}

export function ChatbotHeader() {
  return (
    <>
      <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
        <span className="text-sm">🤖</span>
      </div>
      <div>
        <h2 className="font-semibold text-white text-sm">Tel-Bot AI</h2>
        <p className="text-[11px] text-zinc-500">Powered by Gemini</p>
      </div>
    </>
  )
}

type MainProps = {
  bottomRef: RefObject<HTMLDivElement | null>
}

export function ChatbotMain({ bottomRef }: MainProps) {
  const [aiInput, setAiInput] = useState('');
  const { pesan: aiMessages, isLoading: aiLoading, sendMsg: sendAiMsg } = useChatbotStore();

  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim();
    setAiInput(''); // Kosongkan input setelah dikirim
    await sendAiMsg(msg);
  }

  const handleAiKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSend();
    }
  }

  return (
    <>
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
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                ${msg.role === 'user'
                  ? 'bg-violet-600/30 border border-violet-500/30'
                  : 'bg-emerald-600/20 border border-emerald-500/30'}`}
            >
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

      {/* Bagian Input yang sudah diubah logic-nya */}
      <div className="px-6 pb-5 pt-2">
        <div className="flex items-end gap-2 bg-[#1e1e2a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-emerald-500/40 transition-colors">
          
          <AutoResizeTextarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)} 
            onKeyDown={handleAiKeyDown} 
            placeholder="Tanya Telbot..."
          />

          <IconButton
            variant="ai"
            onClick={handleAiSend} 
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