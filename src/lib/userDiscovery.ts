import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { normalizeEmail } from './syncPublicProfile'
import type { PublicProfile } from '../types/contactTypes'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

function mapPublicProfile(uid: string, data: Record<string, unknown>): PublicProfile {
  return {
    uid,
    nama: typeof data.nama === 'string' ? data.nama : 'User',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    bio: typeof data.bio === 'string' ? data.bio : '',
  }
}

export async function fetchPublicProfile(uid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(db, 'publicProfiles', uid))
  if (!snap.exists()) return null
  return mapPublicProfile(uid, snap.data() as Record<string, unknown>)
}

export async function findUserByEmail(email: string): Promise<PublicProfile | null> {
  const normalized = normalizeEmail(email)
  if (!isValidEmail(normalized)) return null

  const lookupSnap = await getDoc(doc(db, 'userLookup', normalized))
  if (!lookupSnap.exists()) return null

  const uid = lookupSnap.data().uid as string
  if (!uid) return null

  return fetchPublicProfile(uid)
}

export async function searchUsersByName(
  term: string,
  excludeUid: string,
  maxResults = 20,
): Promise<PublicProfile[]> {
  const trimmed = term.trim()
  if (trimmed.length < 2) return []

  const q = query(
    collection(db, 'publicProfiles'),
    where('nama', '>=', trimmed),
    where('nama', '<=', trimmed + '\uf8ff'),
    orderBy('nama'),
    limit(maxResults),
  )

  const snap = await getDocs(q)
  return snap.docs
    .filter((d) => d.id !== excludeUid)
    .map((d) => mapPublicProfile(d.id, d.data() as Record<string, unknown>))
}
