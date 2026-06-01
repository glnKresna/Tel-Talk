import { useEffect, useRef, useState, useMemo, type ChangeEvent } from 'react'
import { Search, ChevronRight, Globe, Lock, Check, Camera } from 'lucide-react'
import { ProfileModalShell } from '../../profile-page/profileModalShell'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { getContactDisplayName, type ContactWithProfile } from '../../../types/contactTypes'
import { uploadFileToCloudinary } from '../../../lib/cloudinaryUpload'

type Props = {
  open: boolean
  onClose: () => void
  contacts: ContactWithProfile[]
  onCreate: (
    name: string,
    photoURL: string | null,
    description: string,
    status: 'public' | 'private',
    invitedMembers: string[]
  ) => Promise<void>
}

export function CreateRoomModal({ open, onClose, contacts, onCreate }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [searchVal, setSearchVal] = useState('')

  // Form states untuk Step 2
  const [name, setName] = useState('')
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'public' | 'private'>('public')

  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setStep(1)
      setSelectedMembers([])
      setSearchVal('')
      setName('')
      setPhotoURL(null)
      setDescription('')
      setStatus('public')
      setError(null)
      setIsDropdownOpen(false)
    }
  }, [open])

  // Click outside listener untuk dropdown status custom
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter kontak berdasarkan pencarian
  const filteredContacts = useMemo(() => {
    const term = searchVal.trim().toLowerCase()
    if (!term) return contacts
    return contacts.filter((c) => {
      const displayName = getContactDisplayName(c).toLowerCase()
      const username = (c.profile?.username || '').toLowerCase()
      return displayName.includes(term) || username.includes(term)
    })
  }, [contacts, searchVal])

  const handleToggleMember = (uid: string) => {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    )
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validasi ekstensi berkas
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'heic']
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Format file tidak didukung. Harap unggah berkas .jpg, .jpeg, .png, atau .heic.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      setIsUploadingPhoto(true)
      const result = await uploadFileToCloudinary({ file, folder: 'room_photos' })
      setPhotoURL(result.url)
    } catch (err: any) {
      console.error('Cloudinary upload error:', err)
      setError(err?.message || 'Gagal mengunggah foto. Coba lagi.')
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
      await onCreate(trimmedName, photoURL, description, status, selectedMembers)
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal membuat room baru. Coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackToStep1 = () => {
    setError(null)
    setStep(1)
  }

  const handleGoToStep2 = () => {
    if (selectedMembers.length === 0) return
    setError(null)
    setStep(2)
  }

  return (
    <ProfileModalShell open={open} onClose={onClose} busy={isSaving || isUploadingPhoto}>
      {step === 1 ? (
        // STEP 1: PILIH ANGGOTA
        <>
          <div>
            <h3 className="text-sm font-semibold text-white">Pilih Anggota Room</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pilih kontak yang akan dimasukkan ke room baru ini.
            </p>
          </div>

          {/* Kolom Pencarian Kontak */}
          <div className="mt-4 relative flex items-center bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2.5 focus-within:border-violet-500/50 transition-colors">
            <Search size={14} className="text-zinc-500 mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Cari kontak tersimpan..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none"
            />
          </div>

          {/* Daftar Kontak Terpilih (Scrollable Wrapper dengan Border & BG tipis) */}
          <div className="mt-4 max-h-[260px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar border border-white/[0.04] bg-white/[0.01] rounded-xl p-2">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-xl mb-1.5">👤</span>
                <p className="text-zinc-500 text-xs font-medium">Kontak tidak ditemukan</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Pastikan nama kontak sudah terdaftar.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedMembers.includes(contact.contactUid)
                return (
                  <div
                    key={contact.contactUid}
                    onClick={() => handleToggleMember(contact.contactUid)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarCircle
                        photoURL={contact.profile?.photoURL || null}
                        displayName={getContactDisplayName(contact)}
                        size="sm"
                        variant="dashboard"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {getContactDisplayName(contact)}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {contact.profile?.username ? `@${contact.profile.username}` : ''}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-violet-600 border-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.3)] text-white'
                          : 'border-white/[0.15] bg-transparent hover:border-zinc-500'
                      }`}
                    >
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Rangkuman Pilihan */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 font-semibold px-1">
            <span>Terpilih: {selectedMembers.length} Kontak</span>
          </div>

          <div className="flex gap-2.5 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] text-sm font-semibold text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleGoToStep2}
              disabled={selectedMembers.length === 0}
              className="flex-1 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-sm font-semibold text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjutkan <ChevronRight size={14} />
            </button>
          </div>
        </>
      ) : (
        // STEP 2: DETAIL ROOM
        <>

          {/* Upload Foto Room secara Real-time via Cloudinary */}
          <div className="flex flex-col items-center gap-2.5 my-5 select-none relative">
            <div className="relative">
              {/* Pembungkus Avatar Klik & Hover Efek */}
              <button
                type="button"
                onClick={isUploadingPhoto ? undefined : () => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="relative rounded-full overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 group cursor-pointer disabled:cursor-not-allowed"
                aria-label="Unggah foto room"
              >
                <AvatarCircle
                  photoURL={photoURL}
                  displayName={name || 'Room'}
                  size="lg"
                  variant="dashboard"
                />
                
                {/* Efek Hover Redup & Visual Cue Kamera */}
                {!isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1">
                    <Camera size={20} className="text-white transform scale-75 group-hover:scale-100 transition-transform duration-300" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Ubah Foto</span>
                  </div>
                )}
              </button>

              {/* Loading overlay saat mengunggah */}
              {isUploadingPhoto && (
                <div className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center gap-1.5 border border-violet-500/30">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[8px] font-bold text-violet-200 uppercase tracking-widest">Uploading</span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              {isUploadingPhoto ? 'Mengunggah Foto...' : 'Ketuk Foto untuk Unggah'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploadingPhoto}
            />
          </div>

          {/* Input Nama Room */}
          <div className="mt-4">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Nama Room
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving || isUploadingPhoto}
              placeholder="e.g. Info Kampus"
              maxLength={25}
              className="mt-1.5 w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          {/* Input Deskripsi Room */}
          <div className="mt-4">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Deskripsi Room (Opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving || isUploadingPhoto}
              placeholder="Tulis deskripsi singkat tentang room ini..."
              maxLength={150}
              rows={2}
              className="mt-1.5 w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none custom-scrollbar"
            />
            <div className="flex justify-end text-[9px] text-zinc-600 mt-1">
              {description.length}/150
            </div>
          </div>

          {/* Custom Styled Dropdown Status Room */}
          <div className="mt-4 relative" ref={dropdownRef}>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Status Room
            </label>
            
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSaving || isUploadingPhoto}
              className="mt-1.5 w-full bg-[#13131a] border border-white/[0.08] hover:bg-[#181824] rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all flex items-center justify-between cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              <div className="flex items-center gap-2.5">
                {status === 'public' ? (
                  <>
                    <Globe size={16} className="text-emerald-400 shrink-0" />
                    <span className="font-semibold text-zinc-200">Publik</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} className="text-amber-400 shrink-0" />
                    <span className="font-semibold text-zinc-200">Privat</span>
                  </>
                )}
              </div>
              <span className="text-zinc-500 text-[10px] ml-2 select-none">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1.5 bg-[#181824] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-1.5">
                {/* Opsi Publik */}
                <div
                  onClick={() => {
                    setStatus('public')
                    setIsDropdownOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/[0.03] transition-colors cursor-pointer select-none ${
                    status === 'public' ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <Globe size={16} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-200">Publik</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Semua anggota bisa menambah anggota, masuk via link.</p>
                  </div>
                </div>

                {/* Opsi Privat */}
                <div
                  onClick={() => {
                    setStatus('private')
                    setIsDropdownOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/[0.03] transition-colors cursor-pointer border-t border-white/[0.04] select-none ${
                    status === 'private' ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <Lock size={16} className="text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-200">Privat</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Hanya admin yang bisa menambah anggota.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <p className="mt-3 text-xs text-red-400 font-medium">{error}</p>}

          <div className="flex gap-2.5 mt-6">
            <button
              type="button"
              onClick={handleBackToStep1}
              disabled={isSaving || isUploadingPhoto}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] text-sm font-semibold text-white transition-colors"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={isSaving || isUploadingPhoto || !name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-sm font-semibold text-white disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Buat Room'
              )}
            </button>
          </div>
        </>
      )}
    </ProfileModalShell>
  )
}
