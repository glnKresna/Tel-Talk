import { useState } from 'react'
import { findUserByEmail, isValidEmail, searchUsersByName } from '../../../lib/userDiscovery'
import type { ContactAddedVia, PublicProfile } from '../../../types/contactTypes'
import { UserSearchResultCard } from './UserSearchResultCard'

type SearchMode = 'email' | 'name'

type Props = {
  currentUserId: string
  isContact: (uid: string) => boolean
  onSaveContact: (uid: string, via: ContactAddedVia) => Promise<void>
  onViewProfile: (profile: PublicProfile) => void
  onContactUser: (uid: string) => Promise<void>
}

export function ContactSearch({
  currentUserId,
  isContact,
  onSaveContact,
  onViewProfile,
  onContactUser,
}: Props) {
  const [mode, setMode] = useState<SearchMode>('email')
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailResult, setEmailResult] = useState<PublicProfile | null>(null)
  const [nameResults, setNameResults] = useState<PublicProfile[]>([])
  const [actionBusy, setActionBusy] = useState(false)

  const resetResults = () => {
    setEmailResult(null)
    setNameResults([])
    setError(null)
  }

  const handleSearch = async () => {
    resetResults()
    const trimmed = query.trim()
    if (!trimmed) return

    setIsSearching(true)
    try {
      if (mode === 'email') {
        if (!isValidEmail(trimmed)) {
          setError('Format email tidak valid.')
          return
        }
        const found = await findUserByEmail(trimmed)
        if (!found) {
          setError('User tidak ditemukan. Pastikan email sudah terdaftar & terverifikasi.')
          return
        }
        setEmailResult(found)
      } else {
        if (trimmed.length < 2) {
          setError('Nama minimal 2 karakter.')
          return
        }
        const results = await searchUsersByName(trimmed, currentUserId)
        if (results.length === 0) {
          setError('Tidak ada user dengan nama tersebut.')
          return
        }
        setNameResults(results)
      }
    } catch {
      setError('Gagal mencari user. Coba lagi.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSave = async (uid: string, via: ContactAddedVia) => {
    setActionBusy(true)
    try {
      await onSaveContact(uid, via)
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-xl bg-[#1e1e2a] border border-white/[0.08]">
        <button
          type="button"
          onClick={() => {
            setMode('email')
            resetResults()
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors
            ${mode === 'email' ? 'bg-violet-600/25 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('name')
            resetResults()
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors
            ${mode === 'name' ? 'bg-violet-600/25 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Nama
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type={mode === 'email' ? 'email' : 'search'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleSearch()
          }}
          placeholder={mode === 'email' ? 'email@contoh.com' : 'Cari nama...'}
          className="flex-1 bg-[#1e1e2a] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
        />
        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={isSearching || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSearching ? '...' : 'Cari'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
      )}

      {emailResult && (
        <UserSearchResultCard
          profile={emailResult}
          isSaved={isContact(emailResult.uid)}
          isSelf={emailResult.uid === currentUserId}
          isBusy={actionBusy}
          onSave={() => void handleSave(emailResult.uid, 'email')}
          onViewProfile={() => onViewProfile(emailResult)}
          onContact={() => void onContactUser(emailResult.uid)}
        />
      )}

      {nameResults.length > 0 && (
        <div className="space-y-2">
          {nameResults.map((profile) => (
            <UserSearchResultCard
              key={profile.uid}
              profile={profile}
              isSaved={isContact(profile.uid)}
              isSelf={profile.uid === currentUserId}
              isBusy={actionBusy}
              onSave={() => void handleSave(profile.uid, 'name')}
              onViewProfile={() => onViewProfile(profile)}
              onContact={() => void onContactUser(profile.uid)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
