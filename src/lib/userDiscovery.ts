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
import type { PublicProfile } from '../types/contactTypes'

function mapPublicProfile(uid: string, data: Record<string, unknown>): PublicProfile {
  return {
    uid,
    username:
      typeof data.username === 'string'
        ? data.username
        : typeof data.nama === 'string'
        ? data.nama
        : 'user',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    bio: typeof data.bio === 'string' ? data.bio : '',
  }
}

export async function fetchPublicProfile(uid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(db, 'publicProfiles', uid))
  if (!snap.exists()) return null
  return mapPublicProfile(uid, snap.data() as Record<string, unknown>)
}

export async function searchUsersByName(
  term: string,
  excludeUid: string,
  maxResults = 20,
): Promise<PublicProfile[]> {
  const trimmed = term.trim().toLowerCase()
  if (trimmed.length < 2) return []

  const q = query(
    collection(db, 'publicProfiles'),
    where('username_lowercase', '>=', trimmed),
    where('username_lowercase', '<=', trimmed + '\uf8ff'),
    orderBy('username_lowercase'),
    limit(maxResults),
  )

  const snap = await getDocs(q)
  return snap.docs
    .filter((d) => d.id !== excludeUid)
    .map((d) => mapPublicProfile(d.id, d.data() as Record<string, unknown>))
}
