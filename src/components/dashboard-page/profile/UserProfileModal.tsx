import { ProfileModalShell } from '../../profile-page/profileModalShell'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import type { PublicProfile } from '../../../types/contactTypes'

type Props = {
  open: boolean
  onClose: () => void
  profile: PublicProfile
}

export function UserProfileModal({ open, onClose, profile }: Props) {
  return (
    <ProfileModalShell open={open} onClose={onClose}>
      <div className="flex items-center gap-3">
        <AvatarCircle
          photoURL={profile.photoURL}
          displayName={`@${profile.username}`}
          size="md"
          variant="dashboard"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{`@${profile.username}`}</p>
          <p className="text-xs text-zinc-500">Profil Tel-Talk</p>
        </div>
        <button
          type="button"
          className="text-zinc-500 hover:text-zinc-200 transition-colors"
          onClick={onClose}
          aria-label="Tutup"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {profile.bio.trim() ? (
        <p className="mt-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
      ) : (
        <p className="mt-4 text-sm text-zinc-500 italic">Belum ada bio.</p>
      )}
    </ProfileModalShell>
  )
}
