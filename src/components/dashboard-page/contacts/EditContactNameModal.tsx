import { useEffect, useState } from 'react'
import { ProfileModalShell } from '../../profile-page/profileModalShell'
import type { ContactWithProfile } from '../../../types/contactTypes'

type Props = {
  open: boolean
  contact: ContactWithProfile | null
  onClose: () => void
  onSave: (customName: string | null) => Promise<void>
}

export function EditContactNameModal({ open, contact, onClose, onSave }: Props) {
  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !contact) return
    setDraft(contact.customName ?? '')
    setError(null)
  }, [open, contact])

  if (!contact) return null

  const legalName = contact.profile?.nama ?? 'User'

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const trimmed = draft.trim()
      const next = trimmed === '' || trimmed === legalName ? null : trimmed
      await onSave(next)
      onClose()
    } catch {
      setError('Gagal menyimpan nama kontak.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileModalShell open={open} onClose={onClose} busy={isSaving}>
      <h3 className="text-sm font-semibold text-white">Nama kontak</h3>
      <p className="text-xs text-zinc-500 mt-1">
        Nama asli: <span className="text-zinc-400">{legalName}</span>
      </p>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={isSaving}
        placeholder={legalName}
        className="mt-3 w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
      />
      <p className="text-[10px] text-zinc-600 mt-1">Kosongkan untuk pakai nama asli.</p>

      {error && (
        <p className="mt-2 text-xs text-red-300">{error}</p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-semibold text-white"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? '...' : 'Simpan'}
        </button>
      </div>
    </ProfileModalShell>
  )
}
