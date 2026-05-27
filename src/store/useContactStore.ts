import { create } from 'zustand'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
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

    set({ isLoading: true, error: null, contacts: [] })

    const contactsRef = collection(db, 'users', ownerUid, 'contacts')
    activeUnsubscribe = onSnapshot(
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

        withProfiles.sort((a, b) =>
          (a.customName || a.profile?.username || '').localeCompare(
            b.customName || b.profile?.username || '',
          ),
        )

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

    return () => {
      if (activeUnsubscribe) {
        activeUnsubscribe()
        activeUnsubscribe = null
      }
    }
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
