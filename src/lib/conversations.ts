import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

export function getConversationId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_')
}

/** Buat dokumen conversation jika belum ada (persiapan DM). */
export async function ensureConversation(myUid: string, peerUid: string): Promise<string> {
  const conversationId = getConversationId(myUid, peerUid)
  const ref = doc(db, 'conversations', conversationId)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    const participants = [myUid, peerUid].sort()
    await setDoc(ref, {
      participants,
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })
  }

  return conversationId
}
