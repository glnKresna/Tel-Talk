import { AvatarCircle } from '../../profile-page/avatarCircle'
import type { PublicProfile } from '../../../types/contactTypes'

type Props = {
  profile: PublicProfile
  isSaved: boolean
  isSelf: boolean
  isBusy: boolean
  onSave: () => void
  onViewProfile: () => void
  onContact: () => void
}

export function UserSearchResultCard({
  profile,
  isSaved,
  isSelf,
  isBusy,
  onSave,
  onViewProfile,
  onContact,
}: Props) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1e2a] border border-white/[0.08]">
      <AvatarCircle
        photoURL={profile.photoURL}
        displayName={profile.nama}
        size="sm"
        variant="dashboard"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{profile.nama}</p>
        {profile.bio.trim() && (
          <p className="text-xs text-zinc-500 truncate">{profile.bio}</p>
        )}
        {isSelf && <p className="text-[10px] text-amber-400/90 mt-0.5">Ini akun kamu</p>}
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={onViewProfile}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]"
        >
          Lihat
        </button>
        {!isSelf && (
          <>
            {isSaved ? (
              <span className="px-2.5 py-1.5 text-center text-[11px] text-emerald-400/90">Tersimpan</span>
            ) : (
              <button
                type="button"
                disabled={isBusy}
                onClick={onSave}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
              >
                Simpan
              </button>
            )}
            {isSaved && (
              <button
                type="button"
                disabled={isBusy}
                onClick={onContact}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-violet-200 bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 disabled:opacity-50"
              >
                Hubungi
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
