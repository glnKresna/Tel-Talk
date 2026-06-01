import { create } from 'zustand'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { fetchPublicProfile } from '../lib/userDiscovery'
import type { Contact, ContactAddedVia, ContactWithProfile } from '../types/contactTypes'

interface ContactStore {
  contacts: ContactWithProfile[]
  isLoading: boolean
  error: string | null
  subscribeContacts: (ownerUid: string) => () => void
  addContact: (
    ownerUid: string,
    contactUid: string,
    addedVia: ContactAddedVia,
  ) => Promise<void>
  updateCustomName: (ownerUid: string, contactUid: string, customName: string | null) => Promise<void>
  removeContact: (ownerUid: string, contactUid: string) => Promise<void>
  toggleBlockContact: (ownerUid: string, contactUid: string, currentBlockedStatus: boolean) => Promise<void>
  clearContactChat: (ownerUid: string, contactUid: string) => Promise<void>
  isContact: (contactUid: string) => boolean
}

let activeUnsubscribe: Unsubscribe | null = null

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,

  subscribeContacts: (ownerUid) => {
    if (activeUnsubscribe) {
      activeUnsubscribe()
      activeUnsubscribe = null
    }

    set({ isLoading: true, error: null })

    const lastMsgUnsubs = new Map<string, () => void>()

    const contactsRef = collection(db, 'users', ownerUid, 'contacts')
    const unsubscribeMain = onSnapshot(
      contactsRef,
      async (snapshot) => {
        const baseContacts: Contact[] = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            contactUid: d.id,
            customName:
              typeof data.customName === 'string' ? data.customName : null,
            savedAt: data.savedAt,
            addedVia: data.addedVia === 'name' ? 'name' : 'email',
            isBlocked: typeof data.isBlocked === 'boolean' ? data.isBlocked : false,
            clearedAt: data.clearedAt || null,
          }
        })

        // Clean up listeners for removed contacts
        const activeContactUids = new Set(baseContacts.map((c) => c.contactUid))
        for (const [contactUid, unsub] of lastMsgUnsubs.entries()) {
          if (!activeContactUids.has(contactUid)) {
            unsub()
            lastMsgUnsubs.delete(contactUid)
          }
        }

        const withProfiles = await Promise.all(
          baseContacts.map(async (contact) => {
            try {
              const profile = await fetchPublicProfile(contact.contactUid)
              return { ...contact, profile } satisfies ContactWithProfile
            } catch (e) {
              console.error(`Error fetching profile for ${contact.contactUid}:`, e)
              return { ...contact, profile: null } satisfies ContactWithProfile
            }
          }),
        )

        // Setup real-time last message listener for each contact
        withProfiles.forEach((c) => {
          if (!lastMsgUnsubs.has(c.contactUid)) {
            const conversationId = [ownerUid, c.contactUid].sort().join('_')
            const messagesRef = collection(db, 'conversations', conversationId, 'messages')
            const q = query(messagesRef, orderBy('waktuKirim', 'desc'), limit(1))

            const unsub = onSnapshot(
              q,
              (msgSnap) => {
                let lastMsg: any = null
                if (!msgSnap.empty) {
                  const docSnap = msgSnap.docs[0]
                  const msgData = docSnap.data()

                  // Filter out messages that were sent before clear chat timestamp
                  let isCleared = false
                  if (c.clearedAt && msgData.waktuKirim) {
                    const clearedAtMs =
                      typeof c.clearedAt.toMillis === 'function'
                        ? c.clearedAt.toMillis()
                        : (c.clearedAt as any).seconds * 1000
                    const waktuKirimMs =
                      typeof msgData.waktuKirim.toMillis === 'function'
                        ? msgData.waktuKirim.toMillis()
                        : (msgData.waktuKirim as any).seconds * 1000

                    if (waktuKirimMs <= clearedAtMs) {
                      isCleared = true
                    }
                  }

                  if (!isCleared) {
                    lastMsg = { id: docSnap.id, ...msgData }
                  }
                }

                // Update contact's lastMessage in store and sort
                const currentContacts = get().contacts
                const updatedContacts = currentContacts.map((item) => {
                  if (item.contactUid === c.contactUid) {
                    return { ...item, lastMessage: lastMsg } satisfies ContactWithProfile
                  }
                  return item
                })

                // Sort contacts dynamically: latest messages first
                updatedContacts.sort((a, b) => {
                  const timeA =
                    a.lastMessage?.waktuKirim?.toMillis?.() ||
                    a.savedAt?.toMillis?.() ||
                    0
                  const timeB =
                    b.lastMessage?.waktuKirim?.toMillis?.() ||
                    b.savedAt?.toMillis?.() ||
                    0

                  if (timeB !== timeA) {
                    return timeB - timeA
                  }
                  return (a.customName || a.profile?.username || '').localeCompare(
                    b.customName || b.profile?.username || '',
                  )
                })

                set({ contacts: updatedContacts })
              },
              (err) => {
                console.error(`Error loading last message inside store for ${c.contactUid}:`, err)
              }
            )

            lastMsgUnsubs.set(c.contactUid, unsub)
          }
        })

        // Initial sorting (by savedAt desc) before sub-listeners fire
        withProfiles.sort((a, b) => {
          const timeA = a.savedAt?.toMillis?.() || 0
          const timeB = b.savedAt?.toMillis?.() || 0
          return timeB - timeA
        })

        set({ contacts: withProfiles, isLoading: false, error: null })
      },
      (err) => {
        console.error('Error loading contacts:', err)
        set({
          contacts: [],
          isLoading: false,
          error: 'Gagal memuat kontak.',
        })
      },
    )

    activeUnsubscribe = () => {
      unsubscribeMain()
      for (const unsub of lastMsgUnsubs.values()) {
        unsub()
      }
      lastMsgUnsubs.clear()
    }

    return activeUnsubscribe
  },

  addContact: async (ownerUid, contactUid, addedVia) => {
    if (ownerUid === contactUid) {
      throw new Error('Tidak bisa menambahkan diri sendiri.')
    }

    await setDoc(doc(db, 'users', ownerUid, 'contacts', contactUid), {
      contactUid,
      customName: null,
      savedAt: serverTimestamp(),
      addedVia,
    })
  },

  updateCustomName: async (ownerUid, contactUid, customName) => {
    const next = customName?.trim() || null
    await updateDoc(doc(db, 'users', ownerUid, 'contacts', contactUid), {
      customName: next,
    })
  },

  removeContact: async (ownerUid, contactUid) => {
    await deleteDoc(doc(db, 'users', ownerUid, 'contacts', contactUid))
  },

  toggleBlockContact: async (ownerUid, contactUid, currentBlockedStatus) => {
    await updateDoc(doc(db, 'users', ownerUid, 'contacts', contactUid), {
      isBlocked: !currentBlockedStatus,
    })
  },

  clearContactChat: async (ownerUid, contactUid) => {
    await updateDoc(doc(db, 'users', ownerUid, 'contacts', contactUid), {
      clearedAt: serverTimestamp(),
    })
  },

  isContact: (contactUid) => {
    return get().contacts.some((c) => c.contactUid === contactUid)
  },
}))
