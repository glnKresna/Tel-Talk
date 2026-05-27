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
  collectionGroup,
  where,
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
  editedAt?: Timestamp | null
  parentId?: string
  parentType?: 'rooms' | 'conversations'
}

interface MsgStore {
  messages: Pesan[]
  pinnedMessages: Pesan[]
  isLoading: boolean
  error: string | null
  subscribeToRoom: (roomId: string) => () => void
  subscribeToPinnedMessages: () => () => void
  kirimPesan: (roomId: string, text: string, user: any) => Promise<void>
  kirimLampiran: (roomId: string, file: File, user: any, text?: string) => Promise<void>
  togglePin: (roomId: string, messageId: string, nextPinned: boolean) => Promise<void>
  editPesan: (roomId: string, messageId: string, nextText: string) => Promise<void>
  hapusPesan: (roomId: string, messageId: string) => Promise<void>
}

export const useMsgStore = create<MsgStore>((set) => ({
  messages: [],
  pinnedMessages: [],
  isLoading: false,
  error: null,

  subscribeToRoom: (roomId) => {
    set({ messages: [], isLoading: true, error: null });
    
    const isDM = roomId.includes('_');
    const messagesRef = collection(db, isDM ? 'conversations' : 'rooms', roomId, "messages");
    const q = query(messagesRef, orderBy("waktuKirim", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const liveMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Pesan[];

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

  subscribeToPinnedMessages: () => {
    set({ isLoading: true, error: null });

    const q = query(
      collectionGroup(db, 'messages'),
      where('isPinned', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pinnedList = snapshot.docs.map((doc) => {
          const pathParts = doc.ref.path.split('/');
          const parentType = pathParts[0] as 'rooms' | 'conversations';
          const parentId = pathParts[1];
          return {
            id: doc.id,
            parentId,
            parentType,
            ...doc.data(),
          } as Pesan;
        });

        set({ pinnedMessages: pinnedList, isLoading: false, error: null });
      },
      (err) => {
        console.error("Error loading pinned messages:", err);
        set({
          pinnedMessages: [],
          isLoading: false,
          error: 'Gagal memuat pesan tersemat.',
        });
      }
    );

    return unsubscribe;
  },

  kirimPesan: async (roomId, text, user) => {
    try {
      const isDM = roomId.includes('_');
      const messagesRef = collection(db, isDM ? 'conversations' : 'rooms', roomId, "messages");
      const senderName = user.email?.split('@')[0] ?? 'User';
      
      await addDoc(messagesRef, {
        isiPesan: text,
        senderId: user.uid,
        senderName,
        waktuKirim: serverTimestamp(),
        statusBaca: false
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  kirimLampiran: async (roomId, file, user, text = "") => {
    try {
      const { url: downloadUrl } = await uploadFileToCloudinary({
        file,
        folder: `chat-rooms/${roomId}`,
        maxBytes: 10 * 1024 * 1024,
      })

      const isDM = roomId.includes('_');
      const messagesRef = collection(db, isDM ? 'conversations' : 'rooms', roomId, "messages");
      const senderName = user.email?.split('@')[0] ?? 'User';
      await addDoc(messagesRef, {
        isiPesan: text,
        senderId: user.uid,
        senderName,
        waktuKirim: serverTimestamp(),
        statusBaca: false,
        fileUrl: downloadUrl,
        fileName: file.name,
        fileType: file.type
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  togglePin: async (roomId, messageId, nextPinned) => {
    try {
      const isDM = roomId.includes('_');
      await updateDoc(doc(db, isDM ? 'conversations' : 'rooms', roomId, 'messages', messageId), { isPinned: nextPinned });
    } catch (error) {
      console.error("Error pin message:", error);
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
