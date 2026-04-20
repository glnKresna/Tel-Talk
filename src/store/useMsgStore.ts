import { create } from 'zustand'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import { db, storage } from '../config/firebase'

export interface Message {
  id: string
  text: string
  senderId: string
  senderEmail: string
  createdAt: Timestamp | null
  fileUrl?: string
  fileName?: string
  fileType?: string
}

interface MsgState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  unsubscribe: (() => void) | null

  // Subscribe ke real-time messages di room tertentu
  listenMessages: (roomId: string) => void

  // Berhenti listen (penting saat ganti room / unmount)
  stopListening: () => void

  // Kirim pesan teks biasa
  sendMessage: (roomId: string, text: string, senderId: string, senderEmail: string) => Promise<void>

  // Kirim pesan dengan lampiran file
  sendFileMessage: (
    roomId: string,
    file: File,
    senderId: string,
    senderEmail: string,
    caption?: string
  ) => Promise<void>
}

export const useMsgStore = create<MsgState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  listenMessages: (roomId: string) => {
    // Hentikan listener sebelumnya kalau ada
    get().stopListening()

    set({ isLoading: true, messages: [], error: null })

    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const msgs: Message[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Message, 'id'>),
        }))
        set({ messages: msgs, isLoading: false })
      },
      (err) => {
        console.error('listenMessages error:', err)
        set({ error: err.message, isLoading: false })
      }
    )

    set({ unsubscribe: unsub })
  },

  stopListening: () => {
    const { unsubscribe } = get()
    if (unsubscribe) {
      unsubscribe()
      set({ unsubscribe: null })
    }
  },

  sendMessage: async (roomId, text, senderId, senderEmail) => {
    if (!text.trim()) return

    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text,
        senderId,
        senderEmail,
        createdAt: serverTimestamp(),
      })
    } catch (err: any) {
      console.error('sendMessage error:', err)
      set({ error: err.message })
    }
  },

  sendFileMessage: async (roomId, file, senderId, senderEmail, caption = '') => {
    set({ isLoading: true })

    try {
      // Upload file ke Firebase Storage
      const fileRef = ref(storage, `rooms/${roomId}/${Date.now()}_${file.name}`)
      await uploadBytes(fileRef, file)
      const fileUrl = await getDownloadURL(fileRef)

      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: caption,
        senderId,
        senderEmail,
        createdAt: serverTimestamp(),
        fileUrl,
        fileName: file.name,
        fileType: file.type,
      })

      set({ isLoading: false })
    } catch (err: any) {
      console.error('sendFileMessage error:', err)
      set({ error: err.message, isLoading: false })
    }
  },
}))