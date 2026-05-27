interface ToggleRowProps {
    label: string;
    sub: string;
    on: boolean;
    onToggle: () => void;
}

export function ToggleRow({ label, sub, on, onToggle }: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between py-2.5 border-t border-[#2a2a3e]">
        <div>
            <p className="text-xs font-medium text-[#f0f0f8]">{label}</p>
            <p className="text-[11px] text-[#4a4a6a] mt-0.5">{sub}</p>
        </div>
        <button onClick={onToggle} className={`w-[38px] h-5 rounded-full relative cursor-pointer transition-colors duration-200 flex-shrink-0 ${on ? "bg-[#7c3aed]" : "bg-[#252535] border border-[#2a2a3e]"}`}>
            <span className={`absolute top-[2px] w-3.5 h-3.5 rounded-full transition-all duration-200 ${on ? "left-[20px] bg-white" : "left-[2px] bg-[#4a4a6a]"}`} />
        </button>
        </div>
    );
}