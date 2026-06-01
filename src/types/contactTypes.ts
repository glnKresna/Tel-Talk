import type { Timestamp } from 'firebase/firestore'

export type ContactAddedVia = 'email' | 'name'

export interface PublicProfile {
  uid: string
  username: string
  photoURL: string | null
  bio: string
  updatedAt?: Timestamp
  isOnline?: boolean
  lastSeen?: Timestamp | null
}

export interface Contact {
  contactUid: string
  customName: string | null
  savedAt: Timestamp
  addedVia: ContactAddedVia
  isBlocked?: boolean
  clearedAt?: Timestamp | null
}

export interface ContactWithProfile extends Contact {
  profile: PublicProfile | null
  lastMessage?: any
}

export function getContactDisplayName(contact: ContactWithProfile): string {
  const custom = contact.customName?.trim()
  if (custom) return custom
  const username = contact.profile?.username?.trim()
  if (username) return `@${username}`
  return 'User'
}
