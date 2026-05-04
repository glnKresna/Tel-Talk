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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'

export interface Pesan {
  id?: string
  isiPesan: string;
  waktuKirim: any;
  statusBaca: boolean;
  senderId: string;
  senderName: string;
  fileUrl?: string
  fileName?: string
  fileType?: string
}

interface MsgStore {
  messages: Pesan[];
  isLoading: boolean;
  subscribeToRoom: (roomId: string) => () => void; 
  kirimPesan: (roomId: string, text: string, user: any) => Promise<void>; 
  kirimLampiran: (roomId: string, file: File, user: any, text?: string) => Promise<void>;
}

interface MsgState {
  messages: Pesan[]
  isLoading: boolean
  error: string | null

  unsubscribe: (() => void) | null
  subscribeToRoom: (roomId: string) => () => void; 
  
  kirimPesan: (roomId: string, text: string, user: any) => Promise<void>;

  // Kirim pesan dengan lampiran file
  sendFileMessage: (
    roomId: string,
    file: File,
    senderId: string,
    senderEmail: string,
    caption?: string
  ) => Promise<void>
}

export const useMsgStore = create<MsgStore>((set) => ({
  messages: [],
  isLoading: false,

  subscribeToRoom: (roomId) => {
    set({ isLoading: true });
    
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("waktuKirim", "asc"));

    // Buat buka koneksi realtime ke Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pesan[];

      // Update UI tiap ada perubahan di Firestore
      set({ messages: liveMessages, isLoading: false });
    });

    // Matiin listener kalau user ganti/keluar room
    return unsubscribe; 
  },

  kirimPesan: async (roomId, text, user) => {
    try {
      const messagesRef = collection(db, "rooms", roomId, "messages");
      
      await addDoc(messagesRef, {
        isiPesan: text,
        senderId: user.uid,
        senderName: user.email.split('@')[0],
        waktuKirim: serverTimestamp(),
        statusBaca: false
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  kirimLampiran: async (roomId, file, user, text = "") => {
    try {
      set({ isLoading: true });

      // 1. Create a specific folder path in Storage: chat-rooms/roomID/timestamp_filename
      const fileRef = ref(storage, `chat-rooms/${roomId}/${Date.now()}_${file.name}`);

      // 2. Upload the raw file to that path
      await uploadBytes(fileRef, file);

      // 3. Get the public, clickable URL from Firebase Storage
      const downloadUrl = await getDownloadURL(fileRef);

      // 4. Save the message to Firestore with the attached URL
      const messagesRef = collection(db, "rooms", roomId, "messages");
      await addDoc(messagesRef, {
        isiPesan: text, // Optional caption
        senderId: user.uid,
        senderName: user.email.split('@')[0],
        waktuKirim: serverTimestamp(),
        statusBaca: false,
        fileUrl: downloadUrl,
        fileName: file.name,
        fileType: file.type
      });

      set({ isLoading: false });
    } catch (error) {
      console.error("Error uploading file:", error);
      set({ isLoading: false });
    }
  }
}));