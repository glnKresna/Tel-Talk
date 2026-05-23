import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatbotStore } from '../store/useChatbotStore'
import { useMsgStore } from '../store/useMsgStore'
import { useContactStore } from '../store/useContactStore'
import { DashboardShell } from '../components/dashboard-page/layout/DashboardShell'
import { OwnProfileModal } from '../components/dashboard-page/profile/OwnProfileModal'
import { UserProfileModal } from '../components/dashboard-page/profile/UserProfileModal'
import { EditContactNameModal } from '../components/dashboard-page/contacts/EditContactNameModal'
import { useOwnProfile } from '../components/dashboard-page/profile/useOwnProfile'
import { ProfileToast } from '../components/dashboard-page/ProfileToast'
import { ensureDiscoverabilityProfile } from '../lib/syncPublicProfile'
import { ensureConversation } from '../lib/conversations'
import type { ActiveTab, Room } from '../types/dashboardTypes'
import type { ContactAddedVia, ContactWithProfile, PublicProfile } from '../types/contactTypes'

const ROOMS: Room[] = [
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'random', name: 'Random', icon: '🎲' },
  { id: 'dev', name: 'Dev Talk', icon: '💻' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [viewProfile, setViewProfile] = useState<PublicProfile | null>(null)
  const [renameContact, setRenameContact] = useState<ContactWithProfile | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { currUser, logoutUser } = useAuthStore()
  const { subscribeToRoom, messages } = useMsgStore()
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
    if (activeTab !== 'chat') return
    const unsubscribe = subscribeToRoom(activeRoom.id)
    return () => unsubscribe()
  }, [activeRoom.id, subscribeToRoom, activeTab])

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
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        messageCount={messages.length}
        bottomRef={bottomRef}
        profileDisplayName={profile.sidebarDisplayName}
        profilePhotoURL={profile.photoURL}
        isProfileOpen={isProfileOpen}
        onOpenProfile={() => setIsProfileOpen(true)}
        currentUserId={currUser.uid}
        contacts={contacts}
        contactsLoading={contactsLoading}
        selectedContactId={selectedContactId}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContactId}
        isContact={isContact}
        onSaveContact={handleSaveContact}
        onViewUserProfile={setViewProfile}
        onContactUser={handleContactUser}
        onRenameContact={setRenameContact}
        onRemoveContact={(c) => void handleRemoveContact(c)}
        onContactsToast={triggerToast}
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

      <ProfileToast message={toastMsg ?? profile.toastMsg} />
    </>
  )
}
