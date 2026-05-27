import { useState, useEffect, useRef } from 'react'
import { searchUsersByName } from '../../../lib/userDiscovery'
import type { ContactAddedVia, PublicProfile } from '../../../types/contactTypes'
import { UserSearchResultCard } from './UserSearchResultCard'
import { AvatarCircle } from '../../profile-page/avatarCircle'

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
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([])
  const [suggestions, setSuggestions] = useState<PublicProfile[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Tutup dropdown jika klik di luar komponen
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    window.addEventListener('mousedown', handleOutsideClick)
    return () => window.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Fungsi fetch saran (autocomplete) saat mengetik
  const handleInputChange = async (val: string) => {
    setQuery(val)
    const trimmed = val.trim()

    if (trimmed.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const results = await searchUsersByName(trimmed, currentUserId)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch (err) {
      console.error('Error fetching suggestions:', err)
    }
  }

  // Fungsi memproses pencarian utama
  const handleSearch = async (searchTerm?: string) => {
    const targetSearch = (searchTerm ?? query).trim()
    setSuggestions([])
    setShowSuggestions(false)
    setSearchResults([])
    setError(null)

    if (!targetSearch) return

    setIsSearching(true)
    try {
      const results = await searchUsersByName(targetSearch, currentUserId)
      if (results.length === 0) {
        setError('Pengguna tidak ditemukan.')
      } else {
        setSearchResults(results)
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

  const handleSelectSuggestion = (profile: PublicProfile) => {
    setQuery(profile.username)
    setShowSuggestions(false)
    void handleSearch(profile.username)
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="relative flex flex-col gap-2">
        <div className="flex gap-2 relative">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm select-none">
              @
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => void handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSearch()
              }}
              placeholder="username_teman"
              className="w-full bg-[#1e1e2a] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isSearching || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white disabled:opacity-50 transition-colors"
          >
            {isSearching ? '...' : 'Cari'}
          </button>
        </div>

        {/* Floating Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-48 overflow-y-auto rounded-xl bg-[#1c1c27] border border-white/[0.08] shadow-2xl py-1">
            {suggestions.map((profile) => (
              <button
                key={profile.uid}
                type="button"
                onClick={() => handleSelectSuggestion(profile)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/[0.04] transition-colors"
              >
                <AvatarCircle
                  photoURL={profile.photoURL}
                  displayName={`@${profile.username}`}
                  size="xs"
                  variant="dashboard"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-white truncate">@{profile.username}</p>
                  {profile.bio.trim() && (
                    <p className="text-[10px] text-zinc-500 truncate">{profile.bio}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
          {searchResults.map((profile) => (
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
