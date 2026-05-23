import { useEffect, useMemo, useRef, useState } from 'react'
import { updateProfile, type User } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../config/firebase'
import { uploadFileToCloudinary } from '../../../lib/cloudinaryUpload'

type Options = {
  currUser: User | null
  currUserEmail?: string | null
  isModalOpen: boolean
}

export function useOwnProfile({ currUser, currUserEmail, isModalOpen }: Options) {
  const [isLoading, setIsLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [savedDisplayName, setSavedDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [isSavingName, setIsSavingName] = useState(false)
  const [bio, setBio] = useState('')
  const [savedBio, setSavedBio] = useState('')
  const [isSavingBio, setIsSavingBio] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fallbackName = useMemo(() => {
    const email = currUserEmail ?? ''
    if (!email) return 'User'
    return email.split('@')[0] || 'User'
  }, [currUserEmail])

  const sidebarDisplayName = (
    displayName.trim() || currUser?.displayName || fallbackName
  ).trim()

  const isBusy = isLoading || isSavingName || isSavingBio || isUploadingPhoto

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg(null), 2500)
  }

  useEffect(() => {
    if (!currUser) return

    let cancelled = false
    const loadSidebarProfile = async () => {
      setDisplayName((prev) => prev || currUser.displayName || fallbackName)
      setSavedDisplayName((prev) => prev || currUser.displayName || fallbackName)
      setPhotoURL((prev) => prev ?? currUser.photoURL ?? null)

      try {
        const snap = await getDoc(doc(db, 'users', currUser.uid))
        const data = snap.exists() ? snap.data() : null
        if (cancelled) return

        const resolvedDisplayName =
          (typeof data?.nama === 'string' && data.nama.trim()) ||
          currUser.displayName ||
          fallbackName

        const resolvedPhotoURL =
          (typeof data?.photoURL === 'string' && data.photoURL) ||
          currUser.photoURL ||
          null

        setDisplayName(resolvedDisplayName)
        setSavedDisplayName(resolvedDisplayName)
        setPhotoURL(resolvedPhotoURL)
      } catch {
        // sidebar can use auth fallback
      }
    }

    void loadSidebarProfile()
    return () => {
      cancelled = true
    }
  }, [currUser, fallbackName])

  useEffect(() => {
    if (!isModalOpen || !currUser) return

    let cancelled = false
    const loadProfile = async () => {
      setIsLoading(true)
      setProfileError(null)
      try {
        const snap = await getDoc(doc(db, 'users', currUser.uid))
        const data = snap.exists() ? snap.data() : null

        if (cancelled) return
        const resolvedDisplayName =
          (typeof data?.nama === 'string' && data.nama.trim()) ||
          currUser.displayName ||
          fallbackName

        setDisplayName(resolvedDisplayName)
        setSavedDisplayName(resolvedDisplayName)
        setPhotoURL(
          (typeof data?.photoURL === 'string' && data.photoURL) ||
            currUser.photoURL ||
            null,
        )
        const resolvedBio = (typeof data?.bio === 'string' && data.bio) || ''
        setBio(resolvedBio)
        setSavedBio(resolvedBio)
      } catch {
        if (!cancelled) setProfileError('Gagal memuat profil. Coba lagi.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => {
      cancelled = true
    }
  }, [isModalOpen, currUser, fallbackName])

  const saveDisplayName = async () => {
    if (!currUser) return
    const nextName = displayName.trim()
    if (!nextName) {
      setProfileError('Nama tidak boleh kosong.')
      return
    }

    setIsSavingName(true)
    setProfileError(null)
    try {
      const prevName = savedDisplayName
      await updateDoc(doc(db, 'users', currUser.uid), { nama: nextName })
      try {
        await updateProfile(currUser, { displayName: nextName })
      } catch (e) {
        try {
          await updateDoc(doc(db, 'users', currUser.uid), { nama: prevName })
        } catch {
          // ignore rollback failure
        }
        throw e
      }
      setSavedDisplayName(nextName)
      triggerToast('Nama berhasil disimpan.')
    } catch {
      setProfileError('Gagal menyimpan nama. Coba lagi.')
    } finally {
      setIsSavingName(false)
    }
  }

  const saveBio = async () => {
    if (!currUser) return
    setIsSavingBio(true)
    setProfileError(null)
    try {
      const nextBio = bio.trim()
      await updateDoc(doc(db, 'users', currUser.uid), { bio: nextBio })
      setSavedBio(nextBio)
      triggerToast('Bio berhasil disimpan.')
    } catch {
      setProfileError('Gagal menyimpan bio. Coba lagi.')
    } finally {
      setIsSavingBio(false)
    }
  }

  const uploadPhoto = async (file: File) => {
    if (!currUser) return
    if (!file.type.startsWith('image/')) {
      setProfileError('File harus berupa gambar.')
      return
    }
    const maxBytes = 10 * 1024 * 1024
    if (file.size > maxBytes) {
      setProfileError('Ukuran gambar maksimal 10 MB.')
      return
    }

    setIsUploadingPhoto(true)
    setProfileError(null)
    try {
      const prevPhotoURL = photoURL
      const { url } = await uploadFileToCloudinary({
        file,
        folder: `avatars/${currUser.uid}`,
        maxBytes,
      })

      await updateDoc(doc(db, 'users', currUser.uid), { photoURL: url })
      try {
        await updateProfile(currUser, { photoURL: url })
      } catch (e) {
        try {
          await updateDoc(doc(db, 'users', currUser.uid), { photoURL: prevPhotoURL ?? null })
        } catch {
          // ignore rollback failure
        }
        throw e
      }
      setPhotoURL(url)
      triggerToast('Foto profil berhasil diubah.')
    } catch {
      setProfileError('Gagal upload foto profil. Coba lagi.')
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return {
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
    toastMsg,
    fallbackName,
    sidebarDisplayName,
    saveDisplayName,
    saveBio,
    uploadPhoto,
  }
}

export type OwnProfileState = ReturnType<typeof useOwnProfile>
