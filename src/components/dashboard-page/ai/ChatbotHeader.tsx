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
