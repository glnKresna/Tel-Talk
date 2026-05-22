import React from "react";

interface ConfirmModalProps {
    show: boolean;
    icon: React.ElementType;
    title: string;
    desc: string;
    confirmLabel: string;
    onConfirm: () => void;
    onClose: () => void;
}

export function ConfirmModal({ show, icon: Icon, title, desc, confirmLabel, onConfirm, onClose }: ConfirmModalProps) {
    if (!show) return null;
    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1a24] border border-[#2a2a3e] rounded-2xl p-6 w-full max-w-[380px] animate-[modalIn_0.2s_ease]">
            <div className="w-12 h-12 bg-[#2d1515] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon size={24} className="text-[#f87171]" />
            </div>
            <h3 className="text-base font-bold text-center text-[#f0f0f8] mb-2">{title}</h3>
            <p className="text-xs text-[#8888a8] text-center leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
            <div className="flex gap-2.5 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-[#252535] border border-[#2a2a3e] text-[#8888a8] text-xs font-medium cursor-pointer hover:bg-[#1a1a24]">Batal</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-950 border border-red-800 text-[#f87171] text-xs font-bold cursor-pointer hover:bg-red-900">{confirmLabel}</button>
            </div>
        </div>
        </div>
    );
}