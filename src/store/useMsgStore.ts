import { create } from 'zustand'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { uploadFileToCloudinary } from '../lib/cloudinaryUpload'

export interface Pesan {
  id?: string
  isiPesan: string
  waktuKirim?: Timestamp | null
  statusBaca: boolean
  senderId: string
  senderName: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  isPinned?: boolean
  isStarred?: boolean
  editedAt?: Timestamp | null
  parentId?: string
  parentType?: 'rooms' | 'conversations'
  starredAt?: Timestamp | null

  // Reply fields
  replyToId?: string | null
  replyToMsg?: {
    senderName: string
    isiPesan: string
    fileUrl?: string | null
    fileType?: string | null
  } | null
}

interface MsgStore {
  messages: Pesan[]
  starredMessages: Pesan[]
  isLoading: boolean
  error: string | null
  subscribeToRoom: (roomId: string, clearedAt?: Timestamp | null) => () => void
  subscribeToStarredMessages: (userId: string) => () => void
  kirimPesan: (roomId: string, text: string, user: any, replyTo?: Pesan | null) => Promise<void>
  kirimLampiran: (roomId: string, file: File, user: any, text?: string, replyTo?: Pesan | null) => Promise<void>
  toggleStar: (userId: string, roomId: string, message: Pesan, parentType: 'rooms' | 'conversations') => Promise<void>
  editPesan: (roomId: string, messageId: string, nextText: string) => Promise<void>
  hapusPesan: (roomId: string, messageId: string) => Promise<void>
}

export const useMsgStore = create<MsgStore>((set, get) => ({
  messages: [],
  starredMessages: [],
  isLoading: false,
  error: null,

  subscribeToRoom: (roomId, clearedAt) => {
    set({ messages: [], isLoading: true, error: null });
    
    const isDM = roomId.includes('_');
    const messagesRef = collection(db, isDM ? 'conversations' : 'rooms', roomId, "messages");
    const q = query(messagesRef, orderBy("waktuKirim", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let liveMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Pesan[];

        if (isDM && clearedAt) {
          const clearedAtMs = typeof clearedAt.toMillis === 'function' ? clearedAt.toMillis() : (clearedAt as any).seconds * 1000;
          liveMessages = liveMessages.filter((msg) => {
            if (!msg.waktuKirim) return true;
            const waktuKirimMs = typeof msg.waktuKirim.toMillis === 'function' ? msg.waktuKirim.toMillis() : (msg.waktuKirim as any).seconds * 1000;
            return waktuKirimMs > clearedAtMs;
          });
        }

        set({ messages: liveMessages, isLoading: false, error: null });
      },
      (err) => {
        console.error("Error loading messages:", err);
        set({
          messages: [],
          isLoading: false,
          error: 'Gagal memuat pesan. Coba lagi.',
        });
      },
    );

    return unsubscribe; 
  },

  subscribeToStarredMessages: (userId) => {
    if (!userId) return () => {}
    set({ isLoading: true, error: null });

    const starredRef = collection(db, 'users', userId, 'starredMessages')
    const q = query(starredRef, orderBy('starredAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const starredList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pesan[]

        set({ starredMessages: starredList, isLoading: false, error: null })
      },
      (err) => {
        console.error("Error loading starred messages:", err);
        set({
          starredMessages: [],
          isLoading: false,
          error: 'Gagal memuat pesan berbintang.',
        });
      }
    );

    return unsubscribe;
  },

  kirimPesan: async (roomId, text, user, replyTo = null) => {
    try {
      const isDM = roomId.includes('_');
      const messagesRef = collection(db, isDM ? 'conversations' : 'rooms', roomId, "messages");
      const senderName = (user.displayName || user.email?.split('@')[0]) ?? 'User';
      
      const payload: any = {
        isiPesan: text,
        senderId: user.uid,
        senderName,
        waktuKirim: serverTimestamp(),
        statusBaca: false
      };

      if (replyTo) {
        payload.replyToId = replyTo.id || null;
        payload.replyToMsg = {
          senderName: replyTo.senderName || 'User',
          isiPesan: replyTo.isiPesan || '',
          fileUrl: replyTo.fileUrl || null,
          fileType: replyTo.fileType || null,
        };
      }
      
      await addDoc(messagesRef, payload);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  kirimLampiran: async (roomId, file, user, text = "", replyTo = null) => {
    try {
      const { url: downloadUrl } = await uploadFileToCloudinary({
        file,
        folder: `chat-rooms/${roomId}`,
        maxBytes: 10 * 1024 * 1024,
      })

      const isDM = roomId.includes('_');
      const messagesRef = collection(db, isDM ? 'conversations' : 'rooms', roomId, "messages");
      const senderName = (user.displayName || user.email?.split('@')[0]) ?? 'User';
      
      const payload: any = {
        isiPesan: text,
        senderId: user.uid,
        senderName,
        waktuKirim: serverTimestamp(),
        statusBaca: false,
        fileUrl: downloadUrl,
        fileName: file.name,
        fileType: file.type
      };

      if (replyTo) {
        payload.replyToId = replyTo.id || null;
        payload.replyToMsg = {
          senderName: replyTo.senderName || 'User',
          isiPesan: replyTo.isiPesan || '',
          fileUrl: replyTo.fileUrl || null,
          fileType: replyTo.fileType || null,
        };
      }

      await addDoc(messagesRef, payload);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  toggleStar: async (userId, roomId, message, parentType) => {
    try {
      if (!userId || !message.id) return
      const starDocRef = doc(db, 'users', userId, 'starredMessages', message.id)
      const alreadyStarred = get().starredMessages.some((m) => m.id === message.id)

      if (alreadyStarred) {
        await deleteDoc(starDocRef)
      } else {
        await setDoc(starDocRef, {
          isiPesan: message.isiPesan || '',
          senderId: message.senderId,
          senderName: message.senderName,
          waktuKirim: message.waktuKirim || null,
          fileUrl: message.fileUrl || null,
          fileName: message.fileName || null,
          fileType: message.fileType || null,
          editedAt: message.editedAt || null,
          parentId: roomId,
          parentType,
          starredAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error toggling star:", error)
      throw error
    }
  },

  editPesan: async (roomId, messageId, nextText) => {
    try {
      const isDM = roomId.includes('_');
      await updateDoc(doc(db, isDM ? 'conversations' : 'rooms', roomId, 'messages', messageId), {
        isiPesan: nextText,
        editedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error editing message:", error);
      throw error;
    }
  },

  hapusPesan: async (roomId, messageId) => {
    try {
      const isDM = roomId.includes('_');
      await deleteDoc(doc(db, isDM ? 'conversations' : 'rooms', roomId, 'messages', messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  },
}));
