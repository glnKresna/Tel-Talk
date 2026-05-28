import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatbotStore } from '../store/useChatbotStore'
import { useMsgStore } from '../store/useMsgStore'
import { useContactStore } from '../store/useContactStore'
import { DashboardShell } from '../components/dashboard-page/layout/DashboardShell'
import { OwnProfileModal } from '../components/dashboard-page/profile/OwnProfileModal'
import { UserProfileModal } from '../components/dashboard-page/profile/UserProfileModal'
import { EditContactNameModal } from '../components/dashboard-page/contacts/EditContactNameModal'
import { AddContactModal } from '../components/dashboard-page/contacts/AddContactModal'
import { useOwnProfile } from '../components/dashboard-page/profile/useOwnProfile'
import { ProfileToast } from '../components/dashboard-page/ProfileToast'
import { ensureDiscoverabilityProfile } from '../lib/syncPublicProfile'
import { ensureConversation } from '../lib/conversations'
import type { ActiveTab, Room, ModalState } from '../types/dashboardTypes'
import type { ContactAddedVia, ContactWithProfile, PublicProfile } from '../types/contactTypes'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const updateUserPresence = async (uid: string, online: boolean) => {
  try {
    const userRef = doc(db, 'publicProfiles', uid)
    await setDoc(
      userRef,
      {
        isOnline: online,
        lastSeen: online ? null : serverTimestamp(),
      },
      { merge: true }
    )
  } catch (err) {
    console.error('Error updating presence:', err)
  }
}

const ROOMS: Room[] = [
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'random', name: 'Random', icon: '🎲' },
  { id: 'dev', name: 'Dev Talk', icon: '💻' },
]

export default function Dashboard() {
  // Mengubah default tab ke 'dms' sesuai UI baru
  const [activeTab, setActiveTab] = useState<ActiveTab>('dms')
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0])
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [viewProfile, setViewProfile] = useState<PublicProfile | null>(null)
  const [renameContact, setRenameContact] = useState<ContactWithProfile | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  
  // State Baru untuk mengontrol Floating Window opsi '+'
  const [plusModal, setPlusModal] = useState<ModalState>({ isOpen: false, type: null })
  const [activeProfile, setActiveProfile] = useState<PublicProfile | null>(null)
  
  const bottomRef = useRef<HTMLDivElement>(null)

  const { currUser, logoutUser } = useAuthStore()
  const { subscribeToRoom, subscribeToStarredMessages, messages } = useMsgStore()
  const { pesan: aiMessages } = useChatbotStore()
  const {
    contacts,
    isLoading: contactsLoading,
    subscribeContacts,
    addContact,
    updateCustomName,
    removeContact,
    toggleBlockContact,
    clearContactChat,
    isContact,
  } = useContactStore()

  const profile = useOwnProfile({
    currUser,
    currUserEmail: currUser?.email,
    isModalOpen: isProfileOpen,
  })

  const selectedContact = useMemo(
    () => contacts.find((c) => c.contactUid === selectedContactId) ?? null,
    [contacts, selectedContactId],
  )

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    window.setTimeout(() => setToastMsg(null), 2500)
  }

  useEffect(() => {
    if (!currUser) return
    const fallback = currUser.email?.split('@')[0] || 'User'
    void ensureDiscoverabilityProfile(currUser.uid, currUser.email, fallback)
  }, [currUser])

  useEffect(() => {
    if (!currUser) return
    return subscribeContacts(currUser.uid)
  }, [currUser, subscribeContacts])

  useEffect(() => {
    if (!currUser) return
    if (activeTab === 'rooms') {
      const unsubscribe = subscribeToRoom(activeRoom.id)
      return () => unsubscribe()
    } else if (activeTab === 'dms' && selectedContactId) {
      const conversationId = [currUser.uid, selectedContactId].sort().join('_')
      const clearedAt = selectedContact?.clearedAt || null
      const unsubscribe = subscribeToRoom(conversationId, clearedAt)
      return () => unsubscribe()
    }
  }, [activeTab, activeRoom.id, selectedContactId, currUser, subscribeToRoom, selectedContact?.clearedAt])

  useEffect(() => {
    if (!currUser || activeTab !== 'dms' || !selectedContactId) return
    void ensureConversation(currUser.uid, selectedContactId)
  }, [currUser, activeTab, selectedContactId])

  useEffect(() => {
    if (!currUser) return
    const unsubscribe = subscribeToStarredMessages(currUser.uid)
    return () => unsubscribe()
  }, [currUser, subscribeToStarredMessages])

  // 1. Mengelola Status Online/Offline User Aktif
  useEffect(() => {
    if (!currUser) return

    // Set online saat aplikasi aktif/dimuat
    void updateUserPresence(currUser.uid, true)

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible'
      void updateUserPresence(currUser.uid, isVisible)
    }

    const handleBeforeUnload = () => {
      void updateUserPresence(currUser.uid, false)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // Set offline saat unmount/logout
      void updateUserPresence(currUser.uid, false)
    }
  }, [currUser])

  // 2. Berlangganan Real-Time Status Online/Offline Kontak yang Sedang Dipilih
  useEffect(() => {
    if (!currUser || !selectedContactId) {
      setActiveProfile(null)
      return
    }

    const docRef = doc(db, 'publicProfiles', selectedContactId)
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          setActiveProfile({
            uid: docSnap.id,
            username: data.username || 'user',
            photoURL: data.photoURL || null,
            bio: data.bio || '',
            isOnline: typeof data.isOnline === 'boolean' ? data.isOnline : false,
            lastSeen: data.lastSeen || null,
          } as PublicProfile)
        } else {
          setActiveProfile(null)
        }
      },
      (err) => {
        console.error('Error loading selected contact presence:', err)
        setActiveProfile(null)
      }
    )

    return () => unsubscribe()
  }, [currUser, selectedContactId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiMessages])

  const handleSaveContact = async (contactUid: string, via: ContactAddedVia) => {
    if (!currUser) return
    await addContact(currUser.uid, contactUid, via)
    setSelectedContactId(contactUid)
    setPlusModal({ isOpen: false, type: null })
    setActiveTab('dms')
  }

  const handleContactUser = async (peerUid: string) => {
    if (!currUser) return
    try {
      await ensureConversation(currUser.uid, peerUid)
      triggerToast('Percakapan dibuat. UI pesan pribadi menyusul.')
    } catch {
      triggerToast('Gagal membuat percakapan.')
    }
  }

  const handleRemoveContact = async (contact: ContactWithProfile) => {
    if (!currUser) return
    await removeContact(currUser.uid, contact.contactUid)
    if (selectedContactId === contact.contactUid) {
      setSelectedContactId(null)
    }
  }

  if (!currUser) return null

  return (
    <>
      <DashboardShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        rooms={ROOMS}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        messageCount={messages.length}
        bottomRef={bottomRef}
        profileDisplayName={profile.sidebarDisplayName}
        profilePhotoURL={profile.photoURL}
        onOpenProfile={() => setIsProfileOpen(true)}
        contacts={contacts}
        contactsLoading={contactsLoading}
        selectedContactId={selectedContactId}
        selectedContact={selectedContact}
        activeProfile={activeProfile}
        onSelectContact={setSelectedContactId}
        onRenameContact={setRenameContact}
        onRemoveContact={(c) => void handleRemoveContact(c)}
        plusModal={plusModal}
        setPlusModal={setPlusModal}
        currentUserId={currUser.uid}
        onViewContactProfile={() => {
          if (selectedContact?.profile) {
            setViewProfile(selectedContact.profile)
          }
        }}
        onClearChat={async () => {
          if (!selectedContactId) return
          const confirmClear = window.confirm(
            'Apakah Anda yakin ingin membersihkan riwayat obrolan ini?'
          )
          if (!confirmClear) return
          await clearContactChat(currUser.uid, selectedContactId)
          triggerToast('Riwayat chat berhasil dibersihkan.')
        }}
        onCloseChat={() => {
          setSelectedContactId(null)
        }}
        onBlockContact={async () => {
          if (!selectedContactId || !selectedContact) return
          const isBlocked = selectedContact.isBlocked || false
          const confirmBlock = window.confirm(
            isBlocked
              ? 'Apakah Anda ingin membuka blokir kontak ini?'
              : 'Apakah Anda ingin memblokir kontak ini? Anda tidak akan dapat mengirim pesan kepada mereka.'
          )
          if (!confirmBlock) return
          await toggleBlockContact(currUser.uid, selectedContactId, isBlocked)
          triggerToast(isBlocked ? 'Kontak dibuka blokirnya.' : 'Kontak berhasil diblokir.')
        }}
      />

      <OwnProfileModal
        open={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currUserEmail={currUser?.email}
        profile={profile}
        onLogout={logoutUser}
      />

      {viewProfile && (
        <UserProfileModal
          open
          profile={viewProfile}
          onClose={() => setViewProfile(null)}
        />
      )}

      <EditContactNameModal
        open={Boolean(renameContact)}
        contact={renameContact}
        onClose={() => setRenameContact(null)}
        onSave={async (customName) => {
          if (!currUser || !renameContact) return
          await updateCustomName(currUser.uid, renameContact.contactUid, customName)
          triggerToast('Nama kontak diperbarui.')
        }}
      />

      <AddContactModal
        open={plusModal.isOpen && plusModal.type === 'add_contact'}
        onClose={() => setPlusModal({ isOpen: false, type: null })}
        currentUserId={currUser.uid}
        isContact={isContact}
        onSaveContact={handleSaveContact}
        onViewProfile={setViewProfile}
        onContactUser={handleContactUser}
      />

      <ProfileToast message={toastMsg ?? profile.toastMsg} />
    </>
  )
}