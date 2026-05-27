import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ProfileModalShell } from '../../profile-page/profileModalShell'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { EditableField } from '../../profile-page/editableProfileField'
import { ConfirmModal } from '../../profile-page/confirmModal'
import type { OwnProfileState } from './useOwnProfile'

type Props = {
  open: boolean
  onClose: () => void
  currUserEmail?: string | null
  profile: OwnProfileState
  onLogout: () => void | Promise<void>
}

export function OwnProfileModal({
  open,
  onClose,
  currUserEmail,
  profile,
  onLogout,
}: Props) {
  const navigate = useNavigate()
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  const {
    fileInputRef,
    displayName,
    setDisplayName,
    savedDisplayName,
    bio,
    setBio,
    savedBio,
    photoURL,
    profileError,
    isLoading,
    isSavingName,
    isSavingBio,
    isUploadingPhoto,
    isBusy,
    fallbackName,
    saveDisplayName,
    saveBio,
    uploadPhoto,
  } = profile

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, isBusy, onClose])

  useEffect(() => {
    if (!open) setIsLogoutConfirmOpen(false)
  }, [open])

  return (
    <ProfileModalShell open={open} onClose={onClose} busy={isBusy}>
      <div className="flex items-center gap-3">
        <AvatarCircle
          photoURL={photoURL}
          displayName={displayName.trim() || fallbackName}
          size="md"
          variant="dashboard"
          onEdit={() => fileInputRef.current?.click()}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">
            {displayName.trim() ? `@${displayName.trim()}` : `@${fallbackName}`}
          </p>
          <p className="text-xs text-zinc-400 truncate">{currUserEmail}</p>
        </div>
        <button
          type="button"
          className="text-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (!isBusy) onClose()
          }}
          disabled={isBusy}
          aria-label="Tutup"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void uploadPhoto(file)
        }}
      />

      <div className="mt-4 space-y-3">
        {profileError && (
          <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {profileError}
          </div>
        )}

        <EditableField
          variant="dashboard"
          label="Username"
          value={displayName}
          savedValue={savedDisplayName}
          onChange={setDisplayName}
          onSave={() => void saveDisplayName()}
          disabled={isLoading}
          saving={isSavingName}
          placeholder="username"
          saveLabel="Simpan"
          saveVariant="primary"
        />

        <EditableField
          variant="dashboard"
          label="Bio"
          value={bio}
          savedValue={savedBio}
          onChange={setBio}
          onSave={() => void saveBio()}
          disabled={isLoading}
          saving={isSavingBio}
          placeholder="Tulis bio singkat..."
          multiline
          saveLabel="Simpan Bio"
          saveVariant="secondary"
        />

        <button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          disabled={isBusy}
          className="inline-flex items-center px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-colors disabled:opacity-50"
        >
          <p className="text-sm font-medium text-red-300">Logout</p>
        </button>

        {(isLoading || isUploadingPhoto) && (
          <p className="text-[11px] text-zinc-500 text-center">
            {isUploadingPhoto ? 'Mengupload foto...' : 'Memuat profil...'}
          </p>
        )}
      </div>

      <ConfirmModal
        show={isLogoutConfirmOpen}
        placement="nested"
        icon={LogOut}
        title="Apakah anda yakin untuk log out?"
        desc="Kamu akan kembali ke halaman landing."
        confirmLabel="Ya, Logout"
        busy={isBusy}
        onClose={() => {
          if (!isBusy) setIsLogoutConfirmOpen(false)
        }}
        onConfirm={async () => {
          setIsLogoutConfirmOpen(false)
          onClose()
          await onLogout()
          navigate('/landing')
        }}
      />
    </ProfileModalShell>
  )
}
