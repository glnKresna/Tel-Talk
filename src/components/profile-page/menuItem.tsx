import React from "react";
import { ChevronRight } from "lucide-react";

interface MenuItemProps {
    icon: React.ElementType;
    label: string;
    sub?: string;
    onClick: () => void;
    danger?: boolean;
}

export function MenuItem({ icon: Icon, label, sub, onClick, danger = false }: MenuItemProps) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-[11px] text-left cursor-pointer transition-colors duration-150 ${danger ? "hover:bg-[#2d1515]/30" : "hover:bg-[#1e1e2c]"}`}>
        <div className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? "bg-[#2d1515]" : "bg-[#3b1f6e]"}`}>
            <Icon size={15} className={danger ? "text-[#f87171]" : "text-[#a78bfa]"} />
        </div>
        <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium ${danger ? "text-[#f87171]" : "text-[#f0f0f8]"}`}>{label}</p>
            {sub && <p className="text-[11px] text-[#4a4a6a] mt-0.5 truncate">{sub}</p>}
        </div>
        {!danger && <ChevronRight size={13} className="text-[#4a4a6a]" />}
        </button>
    );
}