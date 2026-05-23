import type { Timestamp } from 'firebase/firestore'

export type ContactAddedVia = 'email' | 'name'

export interface PublicProfile {
  uid: string
  nama: string
  photoURL: string | null
  bio: string
  updatedAt?: Timestamp
}

export interface Contact {
  contactUid: string
  customName: string | null
  savedAt: Timestamp
  addedVia: ContactAddedVia
}

export interface ContactWithProfile extends Contact {
  profile: PublicProfile | null
}

export function getContactDisplayName(contact: ContactWithProfile): string {
  const custom = contact.customName?.trim()
  if (custom) return custom
  return contact.profile?.nama?.trim() || 'User'
}
