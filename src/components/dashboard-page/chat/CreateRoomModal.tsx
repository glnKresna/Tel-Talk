import { useEffect, useState } from 'react'
import { ProfileModalShell } from '../../profile-page/profileModalShell'
import { AvatarCircle } from '../../profile-page/avatarCircle'

type Props = {
  open: boolean
  onClose: () => void
  onCreate: (name: string, photoURL: string | null) => Promise<void>
}

export function CreateRoomModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setPhotoURL('')
      setError(null)
    }
  }, [open])

  const handleCreate = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Nama room tidak boleh kosong.')
      return
    }
    if (trimmedName.length > 25) {
      setError('Nama room maksimal 25 karakter.')
      return
    }

    setIsSaving(true)
    setError(null)
    try {
      await onCreate(trimmedName, photoURL.trim() || null)
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal membuat room baru. Coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileModalShell open={open} onClose={onClose} busy={isSaving}>
      <h3 className="text-sm font-semibold text-white">Buat Room Baru</h3>
      <p className="text-xs text-zinc-500 mt-1">
        Buat saluran komunikasi baru untuk semua pengguna Tel-Talk.
      </p>

      {/* Pratinjau Foto Room secara Real-time */}
      <div className="flex flex-col items-center gap-2 my-5 select-none">
        <AvatarCircle
          photoURL={photoURL.trim() || null}
          displayName={name || 'Room'}
          size="md"
          variant="dashboard"
        />
        <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
          Pratinjau Foto Room
        </span>
      </div>

      {/* Input Nama Room */}
      <div className="mt-4">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Nama Room
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          placeholder="e.g. Info Kampus"
          maxLength={25}
          className="mt-1.5 w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
      </div>

      {/* Input URL Foto Room */}
      <div className="mt-4">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          URL Foto Room (Opsional)
        </label>
        <input
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
          disabled={isSaving}
          placeholder="e.g. https://domain.com/gambar.png"
          className="mt-1.5 w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
        <p className="text-[10px] text-zinc-500 mt-1.5">
          Kosongkan untuk otomatis menggunakan inisial nama room sebagai foto profil room.
        </p>
      </div>

      {error && <p className="mt-3 text-xs text-red-400 font-medium">{error}</p>}

      <div className="flex gap-2.5 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] text-sm font-semibold text-white transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={isSaving}
          className="flex-1 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-sm font-semibold text-white disabled:opacity-50 transition-all flex items-center justify-center"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Buat Room'
          )}
        </button>
      </div>
    </ProfileModalShell>
  )
}
