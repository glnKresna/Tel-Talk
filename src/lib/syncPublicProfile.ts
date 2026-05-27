import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export type DiscoverabilityInput = {
  uid: string
  email: string | null | undefined
  username: string
  photoURL?: string | null
  bio?: string
}

/** Sinkronkan profil publik + lookup email (discoverability). */
export async function syncDiscoverabilityProfile(input: DiscoverabilityInput): Promise<void> {
  const { uid, email, username, photoURL = null, bio = '' } = input
  const trimmedUsername = username.trim() || 'user'

  await setDoc(
    doc(db, 'publicProfiles', uid),
    {
      uid,
      username: trimmedUsername,
      username_lowercase: trimmedUsername.toLowerCase(),
      photoURL,
      bio: bio.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  if (email) {
    await setDoc(
      doc(db, 'userLookup', normalizeEmail(email)),
      { uid, username: trimmedUsername },
      { merge: true },
    )
  }
}

/** Backfill untuk user lama yang belum punya publicProfiles / userLookup. */
export async function ensureDiscoverabilityProfile(
  uid: string,
  email: string | null | undefined,
  fallbackName: string,
): Promise<void> {
  const publicSnap = await getDoc(doc(db, 'publicProfiles', uid))
  if (publicSnap.exists() && email) {
    const lookupSnap = await getDoc(doc(db, 'userLookup', normalizeEmail(email)))
    if (lookupSnap.exists()) return
  }

  const userSnap = await getDoc(doc(db, 'users', uid))
  const data = userSnap.exists() ? userSnap.data() : null

  const username =
    (typeof data?.username === 'string' && data.username.trim()) ||
    (typeof data?.nama === 'string' && data.nama.trim()) ||
    fallbackName

  const photoURL =
    (typeof data?.photoURL === 'string' && data.photoURL) || null
  const bio = (typeof data?.bio === 'string' && data.bio) || ''

  await syncDiscoverabilityProfile({
    uid,
    email: email ?? (typeof data?.email === 'string' ? data.email : null),
    username,
    photoURL,
    bio,
  })
}
