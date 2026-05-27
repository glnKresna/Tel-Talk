import React from "react";

interface ConfirmModalProps {
    show: boolean;
    icon: React.ElementType;
    title: string;
    desc: string;
    confirmLabel: string;
    onConfirm: () => void;
    onClose: () => void;
    placement?: "fullscreen" | "nested";
    busy?: boolean;
}

export function ConfirmModal({
    show,
    icon: Icon,
    title,
    desc,
    confirmLabel,
    onConfirm,
    onClose,
    placement = "fullscreen",
    busy = false,
}: ConfirmModalProps) {
    if (!show) return null;

    const isNested = placement === "nested";

    const overlayClass = isNested
        ? "absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center p-4 z-10"
        : "fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4";

    const panelClass = isNested
        ? "w-full max-w-sm rounded-2xl bg-[#13131a] border border-white/[0.08] shadow-2xl p-4"
        : "bg-[#1a1a24] border border-[#2a2a3e] rounded-2xl p-6 w-full max-w-[380px] animate-[modalIn_0.2s_ease]";

    return (
        <div
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => {
                if (!busy && e.target === e.currentTarget) onClose();
            }}
            className={overlayClass}
        >
            <div
                className={panelClass}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {!isNested && (
                    <div className="w-12 h-12 bg-[#2d1515] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon size={24} className="text-[#f87171]" />
                    </div>
                )}
                <h3
                    className={
                        isNested
                            ? "text-sm font-semibold text-white"
                            : "text-base font-bold text-center text-[#f0f0f8] mb-2"
                    }
                >
                    {title}
                </h3>
                <p
                    className={`text-xs leading-relaxed ${isNested ? "text-zinc-400 mt-1" : "text-[#8888a8] text-center"}`}
                    dangerouslySetInnerHTML={{ __html: desc }}
                />
                <div className={`flex gap-2 ${isNested ? "mt-4" : "gap-2.5 mt-5"}`}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                            isNested
                                ? "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white"
                                : "bg-[#252535] border border-[#2a2a3e] text-[#8888a8] text-xs font-medium hover:bg-[#1a1a24]"
                        }`}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                            isNested
                                ? "bg-red-500/20 hover:bg-red-500/25 border border-red-500/30 text-red-200"
                                : "bg-red-950 border border-red-800 text-[#f87171] text-xs font-bold hover:bg-red-900"
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
