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
  
  const bottomRef = useRef<HTMLDivElement>(null)

  const { currUser, logoutUser } = useAuthStore()
  const { subscribeToRoom, subscribeToPinnedMessages, messages } = useMsgStore()
  const { pesan: aiMessages } = useChatbotStore()
  const {
    contacts,
    isLoading: contactsLoading,
    subscribeContacts,
    addContact,
    updateCustomName,
    removeContact,
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
      const unsubscribe = subscribeToRoom(conversationId)
      return () => unsubscribe()
    }
  }, [activeTab, activeRoom.id, selectedContactId, currUser, subscribeToRoom])

  useEffect(() => {
    if (!currUser || activeTab !== 'dms' || !selectedContactId) return
    void ensureConversation(currUser.uid, selectedContactId)
  }, [currUser, activeTab, selectedContactId])

  useEffect(() => {
    if (activeTab !== 'pinned') return
    const unsubscribe = subscribeToPinnedMessages()
    return () => unsubscribe()
  }, [activeTab, subscribeToPinnedMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiMessages])

  const handleSaveContact = async (contactUid: string, via: ContactAddedVia) => {
    if (!currUser) return
    await addContact(currUser.uid, contactUid, via)
    setSelectedContactId(contactUid)
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
        onSelectContact={setSelectedContactId}
        onContactUser={handleContactUser}
        onRenameContact={setRenameContact}
        onRemoveContact={(c) => void handleRemoveContact(c)}
        plusModal={plusModal}
        setPlusModal={setPlusModal}
        currentUserId={currUser.uid}
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