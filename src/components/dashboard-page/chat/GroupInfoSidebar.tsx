import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { collection, getDocs, query, where, documentId } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { AvatarCircle } from '../../profile-page/avatarCircle'
import { Users, Calendar, Pencil, Camera, MoreVertical } from 'lucide-react'
import { RightSidebar } from '../../UI/RightSidebar'
import type { Room } from '../../../types/dashboardTypes'
import type { PublicProfile } from '../../../types/contactTypes'
import { useRoomStore } from '../../../store/useRoomStore'
import { uploadFileToCloudinary } from '../../../lib/cloudinaryUpload'

type Props = {
  activeRoom: Room
  onClose: () => void
  currentUserId: string
  onViewProfile?: (profile: PublicProfile) => void
}

export function GroupInfoSidebar({ activeRoom, onClose, currentUserId, onViewProfile }: Props) {
  const [members, setMembers] = useState<PublicProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Edit states untuk data metadata grup
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameVal, setEditNameVal] = useState('')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [editDescVal, setEditDescVal] = useState('')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // State menu tiga titik anggota
  const [activeMenuUid, setActiveMenuUid] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeRoom.members || activeRoom.members.length === 0) {
        setMembers([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const q = query(
          collection(db, 'publicProfiles'), 
          where(documentId(), 'in', activeRoom.members)
        )

        const snap = await getDocs(q)
        const list = snap.docs.map((doc) => {
          const data = doc.data()
          return {
            uid: doc.id,
            username: typeof data.username === 'string' ? data.username : 'user',
            photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
            bio: typeof data.bio === 'string' ? data.bio : '',
          } as PublicProfile
        })
        
        // Sort alphabetically by username
        list.sort((a, b) => a.username.localeCompare(b.username))
        setMembers(list)
      } catch (err) {
        console.error('Error fetching group members:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMembers()
  }, [activeRoom])

  // Click outside listener untuk menu dropdown tiga titik anggota
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.member-menu-container')) {
        setActiveMenuUid(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handlePromote = async (targetUid: string) => {
    const confirmPromote = window.confirm('Apakah Anda yakin ingin menjadikan anggota ini sebagai Admin?')
    if (!confirmPromote) return
    try {
      await useRoomStore.getState().promoteToAdmin(activeRoom.id, targetUid)
    } catch (err) {
      console.error(err)
      alert('Gagal mengangkat admin.')
    }
  }

  const handleDemote = async (targetUid: string) => {
    const confirmDemote = window.confirm('Apakah Anda yakin ingin menurunkan jabatan Admin dari anggota ini?')
    if (!confirmDemote) return
    try {
      await useRoomStore.getState().demoteFromAdmin(activeRoom.id, targetUid)
    } catch (err) {
      console.error(err)
      alert('Gagal menurunkan admin.')
    }
  }

  const handleKick = async (targetUid: string) => {
    const confirmKick = window.confirm('Apakah Anda yakin ingin mengeluarkan anggota ini dari Room?')
    if (!confirmKick) return
    try {
      await useRoomStore.getState().kickMember(activeRoom.id, targetUid)
    } catch (err) {
      console.error(err)
      alert('Gagal mengeluarkan anggota.')
    }
  }

  const handleClearRoomChat = async () => {
    const confirmClear = window.confirm('Apakah Anda yakin ingin membersihkan seluruh percakapan Room ini dari layar Anda?')
    if (!confirmClear) return
    try {
      await useRoomStore.getState().clearRoomChat(activeRoom.id, currentUserId)
      alert('Percakapan room berhasil dibersihkan di layar Anda.')
    } catch (err) {
      console.error(err)
      alert('Gagal membersihkan percakapan.')
    }
  }

  const handleLeaveRoom = async () => {
    if (activeRoom.admin === currentUserId) {
      alert('Sebagai Pembuat Room Utama, Anda tidak bisa keluar dari Room demi kelangsungan grup.')
      return
    }

    const confirmLeave = window.confirm('Apakah Anda yakin ingin keluar dari Room ini?')
    if (!confirmLeave) return
    try {
      await useRoomStore.getState().leaveRoom(activeRoom.id, currentUserId)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Gagal keluar dari room.')
    }
  }

  // Edit metadata handlers
  const handleSaveName = async () => {
    const trimmed = editNameVal.trim()
    if (!trimmed) {
      alert('Nama room tidak boleh kosong.')
      return
    }
    if (trimmed.length > 25) {
      alert('Nama room maksimal 25 karakter.')
      return
    }
    try {
      await useRoomStore.getState().updateRoomName(activeRoom.id, trimmed)
      setIsEditingName(false)
    } catch (err) {
      console.error(err)
      alert('Gagal memperbarui nama room.')
    }
  }

  const handleSaveDesc = async () => {
    try {
      await useRoomStore.getState().updateRoomDescription(activeRoom.id, editDescVal)
      setIsEditingDesc(false)
    } catch (err) {
      console.error(err)
      alert('Gagal memperbarui deskripsi room.')
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'heic']
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    if (!allowedExtensions.includes(fileExtension)) {
      alert('Format file tidak didukung. Harap unggah berkas .jpg, .jpeg, .png, atau .heic.')
      return
    }

    try {
      setIsUploadingPhoto(true)
      const result = await uploadFileToCloudinary({ file, folder: 'room_photos' })
      await useRoomStore.getState().updateRoomPhoto(activeRoom.id, result.url)
    } catch (err: any) {
      console.error('Cloudinary photo edit error:', err)
      alert(err?.message || 'Gagal mengunggah foto. Coba lagi.')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const isDefaultRoom = ['general', 'random', 'dev'].includes(activeRoom.id)
  
  // Deteksi wewenang pengguna aktif
  const isCurrentUserAdmin = 
    activeRoom.admin === currentUserId || activeRoom.admins?.includes(currentUserId)

  return (
    <RightSidebar
      title="Info Grup"
      icon={<Users size={16} className="text-violet-400" />}
      onClose={onClose}
    >
      {/* Large Group Photo & Name */}
      <div className="flex flex-col items-center text-center space-y-3 py-2 border-b border-white/[0.03] pb-6">
        <div className="relative">
          {/* Edit photo upload (hanya jika admin & bukan room bawaan) */}
          <button
            type="button"
            onClick={isCurrentUserAdmin && !isDefaultRoom && !isUploadingPhoto ? () => fileInputRef.current?.click() : undefined}
            disabled={!isCurrentUserAdmin || isDefaultRoom || isUploadingPhoto}
            className={`relative rounded-full overflow-hidden transition-all duration-300 focus:outline-none ${
              isCurrentUserAdmin && !isDefaultRoom ? 'cursor-pointer group' : 'cursor-default'
            }`}
            aria-label="Ubah foto grup"
          >
            <AvatarCircle
              photoURL={activeRoom.photoURL || null}
              displayName={activeRoom.name}
              size="lg"
              variant="dashboard"
            />
            {isCurrentUserAdmin && !isDefaultRoom && !isUploadingPhoto && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1">
                <Camera size={20} className="text-white transform scale-75 group-hover:scale-100 transition-transform duration-300" />
                <span className="text-[8px] font-bold text-white uppercase tracking-wider">Ubah Foto</span>
              </div>
            )}
          </button>
          
          {isUploadingPhoto && (
            <div className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center gap-1.5 border border-violet-500/30">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[8px] font-bold text-violet-200 uppercase tracking-widest">Uploading</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.heic"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploadingPhoto}
          />
        </div>

        <div className="space-y-1 select-text w-full px-2">
          {isEditingName ? (
            <div className="flex items-center gap-1.5 justify-center max-w-xs mx-auto">
              <input
                value={editNameVal}
                onChange={(e) => setEditNameVal(e.target.value)}
                maxLength={25}
                className="bg-[#181824] border border-white/[0.08] focus:border-violet-500/50 rounded-lg px-2 py-1 text-xs text-white focus:outline-none font-semibold text-center flex-1"
              />
              <button 
                onClick={() => void handleSaveName()} 
                className="text-emerald-400 hover:text-emerald-300 font-bold text-xs p-1"
              >
                ✓
              </button>
              <button 
                onClick={() => setIsEditingName(false)} 
                className="text-red-400 hover:text-red-300 font-bold text-xs p-1"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 justify-center">
              <h4 className="text-base font-bold text-white tracking-wide truncate max-w-[200px]">{activeRoom.name}</h4>
              {isCurrentUserAdmin && !isDefaultRoom && (
                <button
                  onClick={() => {
                    setEditNameVal(activeRoom.name)
                    setIsEditingName(true)
                  }}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
                  title="Edit nama grup"
                >
                  <Pencil size={11} />
                </button>
              )}
            </div>
          )}
          <p className="text-[11px] text-violet-400 font-medium tracking-wide uppercase mt-0.5">
            {isDefaultRoom ? 'Saluran Bawaan' : 'Grup Tel-Talk'}
          </p>
        </div>
      </div>

      {/* Group Description / Metadata */}
      <div className="space-y-3 select-text bg-[#161622]/40 rounded-xl p-3 border border-white/[0.03]">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Deskripsi Grup</h5>
          {isCurrentUserAdmin && !isDefaultRoom && !isEditingDesc && (
            <button
              onClick={() => {
                setEditDescVal(activeRoom.description || '')
                setIsEditingDesc(true)
              }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
              title="Edit deskripsi grup"
            >
              <Pencil size={10} />
            </button>
          )}
        </div>

        {isEditingDesc ? (
          <div className="space-y-2">
            <textarea
              value={editDescVal}
              onChange={(e) => setEditDescVal(e.target.value)}
              maxLength={150}
              rows={3}
              className="w-full bg-[#181824] border border-white/[0.08] focus:border-violet-500/50 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none resize-none custom-scrollbar"
            />
            <div className="flex justify-end gap-2 text-[10px]">
              <button 
                onClick={() => setIsEditingDesc(false)} 
                className="text-zinc-400 hover:text-white font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={() => void handleSaveDesc()} 
                className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-300 leading-relaxed font-light font-sans">
            {activeRoom.description
              ? activeRoom.description
              : isDefaultRoom
              ? `Ini adalah saluran bawaan Tel-Talk untuk berdiskusi tentang topik "${activeRoom.name}" bersama seluruh anggota komunitas.`
              : `Grup percakapan dinamis yang dibuat oleh pengguna Tel-Talk untuk koordinasi dan komunikasi interaktif.`}
          </p>
        )}
        
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.02] text-[10px] text-zinc-500 font-medium select-none">
          <Calendar size={12} className="text-zinc-600" />
          <span>Tipe Grup: {activeRoom.status === 'private' ? 'Grup Privat (Tertutup)' : 'Grup Publik (Terbuka)'}</span>
        </div>
      </div>

      {/* Group Members List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between select-none">
          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Anggota Grup ({members.length})
          </h5>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
            {members.map((member) => {
              const isCreator = member.uid === activeRoom.admin
              const isAdmin = activeRoom.admins?.includes(member.uid) || isCreator
              const isSelf = member.uid === currentUserId

              return (
                <div
                  key={member.uid}
                  className="relative flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default member-menu-container"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarCircle
                      photoURL={member.photoURL}
                      displayName={member.username}
                      size="xs"
                      variant="dashboard"
                    />
                    <div className="min-w-0 select-text">
                      <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                        {member.username} {isSelf && <span className="text-zinc-500 font-normal">(Anda)</span>}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {member.bio || 'Available'}
                      </p>
                    </div>
                  </div>

                  {/* Peran & Aksi Swap Menu Titik Tiga */}
                  <div className="flex items-center gap-1.5 shrink-0 select-none">
                    {/* Badge Peran (Tampil secara default, disembunyikan saat di-hover / menu terbuka) */}
                    <div className={`flex items-center gap-1.5 group-hover:hidden transition-all duration-200 ${activeMenuUid === member.uid ? 'hidden' : ''}`}>
                      {isAdmin && (
                        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Tombol menu titik tiga (Hanya muncul saat baris di-hover atau menu sedang terbuka) */}
                    <div className={`hidden group-hover:block transition-all duration-150 ${activeMenuUid === member.uid ? '!block' : ''}`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuUid(activeMenuUid === member.uid ? null : member.uid)
                        }}
                        className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Opsi anggota"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>

                    {/* Floating Menu Popover (Absolut terhadap baris anggota) */}
                    {activeMenuUid === member.uid && (
                      <div className="absolute right-2 top-8 z-50 w-40 rounded-xl bg-[#13131a] border border-white/[0.08] shadow-2xl overflow-hidden py-1 backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-1.5 text-[11px] font-semibold text-zinc-200">
                        {/* Opsi 1: Lihat Profil */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuUid(null)
                            if (onViewProfile) onViewProfile(member)
                          }}
                          className="w-full flex items-center px-4 py-2.5 hover:bg-white/[0.04] text-left transition-colors cursor-pointer text-zinc-200"
                        >
                          Lihat profil
                        </button>

                        {/* Opsi 2 & 3: Hanya untuk Admin, bukan target pembuat, bukan target diri sendiri */}
                        {isCurrentUserAdmin && !isSelf && !isCreator && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuUid(null)
                                if (isAdmin) {
                                  handleDemote(member.uid)
                                } else {
                                  handlePromote(member.uid)
                                }
                              }}
                              className="w-full flex items-center px-4 py-2.5 hover:bg-white/[0.04] text-left border-t border-white/[0.04] transition-colors cursor-pointer text-zinc-200"
                            >
                              {isAdmin ? 'Hentikan sebagai admin' : 'Jadikan admin'}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuUid(null)
                                handleKick(member.uid)
                              }}
                              className="w-full flex items-center px-4 py-2.5 hover:bg-red-500/10 text-left border-t border-white/[0.04] text-red-300 transition-colors cursor-pointer"
                            >
                              Keluarkan
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Kelola Room Section */}
      {!isDefaultRoom && (
        <div className="space-y-3 border-t border-white/[0.03] pt-6 bg-white/[0.01] -mx-5 px-5 pb-4">
          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none">Kelola Room</h5>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => void handleClearRoomChat()}
              className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.08] transition-colors text-xs text-zinc-300 font-semibold cursor-pointer"
            >
              Bersihkan Percakapan
            </button>
            <button
              type="button"
              onClick={() => void handleLeaveRoom()}
              className="w-full text-left px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-colors text-xs text-red-300 font-semibold cursor-pointer"
            >
              Keluar dari Room
            </button>
          </div>
        </div>
      )}
    </RightSidebar>
  )
}
