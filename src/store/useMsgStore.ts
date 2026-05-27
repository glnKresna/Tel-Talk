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
}

interface MsgStore {
  messages: Pesan[];
  isLoading: boolean;
  error: string | null;
  subscribeToRoom: (roomId: string) => () => void; 
  kirimPesan: (roomId: string, text: string, user: any) => Promise<void>; 
  kirimLampiran: (roomId: string, file: File, user: any, text?: string) => Promise<void>;
  togglePin: (roomId: string, messageId: string, nextPinned: boolean) => Promise<void>;
  editPesan: (roomId: string, messageId: string, nextText: string) => Promise<void>;
  hapusPesan: (roomId: string, messageId: string) => Promise<void>;
}

export const useMsgStore = create<MsgStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  subscribeToRoom: (roomId) => {
    set({ messages: [], isLoading: true, error: null });
    
    const messagesRef = collection(db, "rooms", roomId, "messages");
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

  kirimPesan: async (roomId, text, user) => {
    try {
      const messagesRef = collection(db, "rooms", roomId, "messages");
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

      const messagesRef = collection(db, "rooms", roomId, "messages");
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
      await updateDoc(doc(db, 'rooms', roomId, 'messages', messageId), { isPinned: nextPinned });
    } catch (error) {
      console.error("Error pin message:", error);
    }
  },

  editPesan: async (roomId, messageId, nextText) => {
    try {
      await updateDoc(doc(db, 'rooms', roomId, 'messages', messageId), {
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
      await deleteDoc(doc(db, 'rooms', roomId, 'messages', messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  },
}));
