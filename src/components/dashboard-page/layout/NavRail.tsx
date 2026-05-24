import { MessageSquare, Layers, Pin, Bot } from 'lucide-react'
import type { ActiveTab } from '../../../types/dashboardTypes'

type NavRailProps = {
    activeTab: ActiveTab
    onTabChange: (tab: ActiveTab) => void
    profilePhotoURL: string | null
    profileDisplayName: string
    onOpenProfile: () => void
}

export function NavRail({
    activeTab,
    onTabChange,
    profilePhotoURL,
    profileDisplayName,
    onOpenProfile,
    }: NavRailProps) {
    
    const menuItems = [
        { id: 'dms', label: 'DMs', icon: MessageSquare },
        { id: 'rooms', label: 'Rooms', icon: Layers },
        { id: 'pinned', label: 'Pinned', icon: Pin },
        { id: 'ai', label: 'AI Bot', icon: Bot },
    ] as const

    return (
        <div className="w-[76px] bg-[#13131a] border-r border-white/[0.06] flex flex-col items-center justify-between py-4 relative z-30">
        
        {/* Grup Atas: Menu Utama */}
        <div className="flex flex-col gap-4 w-full px-2">
            {menuItems.map((item) => {
            const isActive = activeTab === item.id
            const Icon = item.icon
            return (
                <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                className={`group flex flex-col items-center justify-center py-2.5 rounded-xl transition-all relative ${
                    isActive 
                    ? 'bg-violet-500/10 text-violet-400' 
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white'
                }`}
                >
                {isActive && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-violet-500 rounded-r-md" />
                )}
                <Icon className="w-[22px] h-[22px]" />
                <span className="text-[10px] font-medium mt-1 scale-90">{item.label}</span>
                </button>
            )
            })}
        </div>

        {/* Grup Bawah: Hanya Avatar Profile */}
        <div className="flex flex-col items-center gap-4 relative pb-2">
            <button 
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-violet-400 transition-colors bg-[#20202c]"
            title={profileDisplayName}
            >
            {profilePhotoURL ? (
                <img src={profilePhotoURL} alt={profileDisplayName} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-white/70">
                {profileDisplayName.slice(0, 2).toUpperCase()}
                </div>
            )}
            </button>
        </div>
        </div>
    )
}