import { create } from 'zustand'
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Room } from '../types/dashboardTypes'

interface RoomStore {
  rooms: Room[]
  isLoading: boolean
  error: string | null
  subscribeRooms: () => () => void
  createRoom: (name: string, photoURL: string | null, creatorUid: string) => Promise<string>
}

const defaultRoomsList: Room[] = [
  { id: 'general', name: 'General', icon: '💬', photoURL: null },
  { id: 'random', name: 'Random', icon: '🎲', photoURL: null },
  { id: 'dev', name: 'Dev Talk', icon: '💻', photoURL: null },
]

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: defaultRoomsList,
  isLoading: false,
  error: null,
  subscribeRooms: () => {
    set({ isLoading: true, error: null })
    const roomsRef = collection(db, 'rooms')
    const q = query(roomsRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dbRooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || '',
          icon: doc.data().icon || '💬',
          photoURL: doc.data().photoURL || null,
          members: doc.data().members || [],
        })) as Room[]

        const uniqueDbRooms = dbRooms.filter(
          (r) => !defaultRoomsList.some((dr) => dr.id === r.id)
        )

        set({ rooms: [...defaultRoomsList, ...uniqueDbRooms], isLoading: false })
      },
      (err) => {
        console.error('Error loading rooms:', err)
        set({ error: 'Gagal memuat daftar room.', isLoading: false })
      }
    )
    return unsubscribe
  },
  
  createRoom: async (name, photoURL, creatorUid) => {
    const roomsRef = collection(db, 'rooms')
    const newRoomDoc = await addDoc(roomsRef, {
      name,
      photoURL,
      icon: '💬',
      createdAt: serverTimestamp(),
      members: [creatorUid]
    })
    return newRoomDoc.id
  },
}))
