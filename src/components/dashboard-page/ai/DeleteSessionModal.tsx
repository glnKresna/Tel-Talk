type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteSessionModal({ isOpen, onClose, onConfirm }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click Outside to Close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-[#111116] border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left select-none">
        
        {/* Heading */}
        <h3 className="text-base font-semibold text-white/95 leading-tight mb-2">
          Hapus Percakapan?
        </h3>

        {/* Content */}
        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          Seluruh prompt, respon, dan riwayat percakapan dalam sesi ini akan dihapus secara permanen.
        </p>

        {/* Actions Button */}
        <div className="flex gap-2 justify-end text-xs font-semibold">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg active:scale-[0.98] transition-all"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
