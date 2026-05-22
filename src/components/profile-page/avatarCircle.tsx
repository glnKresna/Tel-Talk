import { Camera } from "lucide-react";

interface AvatarCircleProps {
    photoURL: string | null;
    displayName: string;
    size: "xs" | "sm" | "lg";
    status?: string;
    onEdit?: () => void;
}

export function getInitials(name: string): string {
    if (!name) return "";
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function AvatarCircle({ photoURL, displayName, size, status, onEdit }: AvatarCircleProps) {
    const dim = size === "lg" ? "w-[88px] h-[88px]" : size === "sm" ? "w-10 h-10" : "w-[34px] h-[34px]";
    const fs = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-xs";
    const dotSize = size === "lg" ? "w-3.5 h-3.5" : "w-2.5 h-2.5";
    const dotOff = size === "lg" ? "top-1 left-1" : "top-0 left-0";

    return (
        <div className="relative inline-block flex-shrink-0">
        <div className={`${dim} ${fs} rounded-full bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center font-bold text-white shadow-[0_0_0_3px_#1a1a24,0_0_0_4px_#2a2a3e,0_8px_28px_rgba(124,58,237,0.16)] overflow-hidden relative`}>
            {photoURL ? (
            <img src={photoURL} alt={displayName} className="w-full h-full object-cover absolute inset-0" />
            ) : (
            <span className="relative z-10">{getInitials(displayName)}</span>
            )}
        </div>
        {onEdit && (
            <button onClick={onEdit} className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#7c3aed] border-2 border-[#1a1a24] flex items-center justify-center cursor-pointer hover:bg-[#6d28d9] transition-colors">
            <Camera size={11} color="#fff" />
            </button>
        )}
        {status && (
            <span className={`absolute ${dotOff} ${dotSize} rounded-full border-2 border-[#1a1a24] ${status === "online" ? "bg-[#34d399]" : status === "away" ? "bg-amber-500" : "bg-zinc-500"}`} />
        )}
        </div>
    );
}