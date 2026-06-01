import { create } from 'zustand'
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Room } from '../types/dashboardTypes'

interface RoomStore {
  rooms: Room[]
  isLoading: boolean
  error: string | null
  subscribeRooms: () => () => void
  createRoom: (
    name: string,
    photoURL: string | null,
    creatorUid: string,
    description: string,
    status: 'public' | 'private',
    invitedMembers: string[]
  ) => Promise<string>
  promoteToAdmin: (roomId: string, targetUid: string) => Promise<void>
  demoteFromAdmin: (roomId: string, targetUid: string) => Promise<void>
  kickMember: (roomId: string, targetUid: string) => Promise<void>
  leaveRoom: (roomId: string, userUid: string) => Promise<void>
  clearRoomChat: (roomId: string, userId: string) => Promise<void>
  updateRoomPhoto: (roomId: string, photoURL: string | null) => Promise<void>
  updateRoomName: (roomId: string, name: string) => Promise<void>
  updateRoomDescription: (roomId: string, description: string) => Promise<void>
  addMembersToRoom: (roomId: string, memberUids: string[]) => Promise<void>
  updateRoomStatus: (roomId: string, status: 'public' | 'private') => Promise<void>
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
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
          description: doc.data().description || '',
          status: doc.data().status || 'public',
          admin: doc.data().admin || '',
          admins: doc.data().admins || (doc.data().admin ? [doc.data().admin] : []),
        })) as Room[]

        set({ rooms: dbRooms, isLoading: false })
      },
      (err) => {
        console.error('Error loading rooms:', err)
        set({ error: 'Gagal memuat daftar room.', isLoading: false })
      }
    )
    return unsubscribe
  },
  
  createRoom: async (name, photoURL, creatorUid, description, status, invitedMembers) => {
    const roomsRef = collection(db, 'rooms')
    const members = Array.from(new Set([creatorUid, ...invitedMembers]))
    const newRoomDoc = await addDoc(roomsRef, {
      name,
      photoURL,
      icon: '💬',
      createdAt: serverTimestamp(),
      members,
      description: description.trim(),
      status,
      admin: creatorUid,
      admins: [creatorUid],
    })
    return newRoomDoc.id
  },

  promoteToAdmin: async (roomId, targetUid) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, {
      admins: arrayUnion(targetUid)
    })
  },

  demoteFromAdmin: async (roomId, targetUid) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, {
      admins: arrayRemove(targetUid)
    })
  },

  kickMember: async (roomId, targetUid) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, {
      members: arrayRemove(targetUid),
      admins: arrayRemove(targetUid)
    })
  },

  leaveRoom: async (roomId, userUid) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, {
      members: arrayRemove(userUid),
      admins: arrayRemove(userUid)
    })
  },

  clearRoomChat: async (roomId, userId) => {
    await setDoc(doc(db, 'users', userId, 'clearedRooms', roomId), {
      clearedAt: serverTimestamp(),
    })
  },

  updateRoomPhoto: async (roomId, photoURL) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, { photoURL })
  },

  updateRoomName: async (roomId, name) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, { name: name.trim() })
  },

  updateRoomDescription: async (roomId, description) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, { description: description.trim() })
  },

  addMembersToRoom: async (roomId, memberUids) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, {
      members: arrayUnion(...memberUids)
    })
  },

  updateRoomStatus: async (roomId, status) => {
    const roomRef = doc(db, 'rooms', roomId)
    await updateDoc(roomRef, { status })
  },
}))
