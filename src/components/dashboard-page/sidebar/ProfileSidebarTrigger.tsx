import { AvatarCircle } from '../../profile-page/avatarCircle'

type Props = {
  isSidebarOpen: boolean
  displayName: string
  photoURL: string | null
  isProfileOpen: boolean
  onOpenProfile: () => void
}

export function ProfileSidebarTrigger({
  isSidebarOpen,
  displayName,
  photoURL,
  isProfileOpen,
  onOpenProfile,
}: Props) {
  return (
    <div className="border-t border-white/[0.06] p-3">
      <button
        type="button"
        onClick={onOpenProfile}
        className="w-full flex items-center gap-2 rounded-xl hover:bg-white/[0.04] transition-colors px-2 py-1"
        aria-haspopup="dialog"
        aria-expanded={isProfileOpen}
      >
        <AvatarCircle
          photoURL={photoURL}
          displayName={displayName}
          size="xs"
          variant="dashboard"
        />
        {isSidebarOpen && (
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-200 font-semibold truncate text-left">{displayName}</p>
          </div>
        )}
      </button>
    </div>
  )
}
