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

export interface chatbotMsg {
  role: "user" | "model"
  content: string
  timestamp?: Timestamp | null
}

export interface ChatbotSession {
  id: string
  title: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

interface ChatbotStore {
  sessions: ChatbotSession[]
  activeSessionId: string | null
  messages: chatbotMsg[]
  isLoading: boolean
  subscribeSessions: (userId: string) => () => void
  subscribeMessages: (userId: string, sessionId: string) => () => void
  createSession: (userId: string, title?: string) => Promise<string>
  sendMsg: (userId: string, sessionId: string, prompt: string) => Promise<void>
  renameSession: (userId: string, sessionId: string, nextTitle: string) => Promise<void>
  deleteSession: (userId: string, sessionId: string) => Promise<void>
  setActiveSessionId: (id: string | null) => void
}

export const useChatbotStore = create<ChatbotStore>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isLoading: false,

  setActiveSessionId: (id) => {
    set({ activeSessionId: id, messages: [], isLoading: false })
  },

  subscribeSessions: (userId) => {
    const sessionsRef = collection(db, 'users', userId, 'chatbotSessions')
    const q = query(sessionsRef, orderBy('updatedAt', 'desc'))

    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            title: data.title || 'Percakapan Baru',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as ChatbotSession
        })
        set({ sessions: list })
      },
      (err) => {
        console.error('Error loading chatbot sessions:', err)
      }
    )
  },

  subscribeMessages: (userId, sessionId) => {
    const messagesRef = collection(db, 'users', userId, 'chatbotSessions', sessionId, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            role: data.role,
            content: data.content,
            timestamp: data.timestamp,
          } as chatbotMsg
        })
        set({ messages: list })
      },
      (err) => {
        console.error('Error loading chatbot messages:', err)
      }
    )
  },

  createSession: async (userId, title = 'Percakapan Baru') => {
    const sessionsRef = collection(db, 'users', userId, 'chatbotSessions')
    const docRef = doc(sessionsRef)
    await setDoc(docRef, {
      id: docRef.id,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  sendMsg: async (userId, sessionId, prompt) => {
    const isFirstMessage = get().messages.length === 0
    const userMsgPayload = {
      role: 'user',
      content: prompt,
      timestamp: serverTimestamp(),
    }

    set({ isLoading: true })

    try {
      const messagesRef = collection(db, 'users', userId, 'chatbotSessions', sessionId, 'messages')
      // Save user message to Firestore
      await addDoc(messagesRef, userMsgPayload)

      // Update session updatedAt
      const sessionDocRef = doc(db, 'users', userId, 'chatbotSessions', sessionId)
      const updateData: any = {
        updatedAt: serverTimestamp(),
      }

      if (isFirstMessage) {
        const titleText = prompt.slice(0, 35) + (prompt.length > 35 ? '...' : '')
        updateData.title = titleText
      }

      await updateDoc(sessionDocRef, updateData)

      const currentHistory = get().messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))
      currentHistory.push({ role: 'user', content: prompt })

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, history: currentHistory }),
      })

      const data = await response.json()
      if (data.reply) {
        const botMsgPayload = {
          role: 'model',
          content: data.reply,
          timestamp: serverTimestamp(),
        }
        // Save bot reply to Firestore
        await addDoc(messagesRef, botMsgPayload)
        // Update session updatedAt again
        await updateDoc(sessionDocRef, {
          updatedAt: serverTimestamp(),
        })
        set({ isLoading: false })
      } else {
        throw new Error('Bot response is empty')
      }
    } catch (err) {
      console.error('Chatbot sendMsg error:', err)
      const messagesRef = collection(db, 'users', userId, 'chatbotSessions', sessionId, 'messages')
      await addDoc(messagesRef, {
        role: 'model',
        content: 'Maaf, Tel-Bot sedang tidak dapat merespon saat ini. Pastikan kunci API Gemini Anda sudah terpasang dengan benar di .env/Vercel.',
        timestamp: serverTimestamp(),
      })
      set({ isLoading: false })
    }
  },

  renameSession: async (userId, sessionId, nextTitle) => {
    const titleText = nextTitle.trim() || 'Percakapan Baru'
    const docRef = doc(db, 'users', userId, 'chatbotSessions', sessionId)
    await updateDoc(docRef, {
      title: titleText,
      updatedAt: serverTimestamp(),
    })
  },

  deleteSession: async (userId, sessionId) => {
    const docRef = doc(db, 'users', userId, 'chatbotSessions', sessionId)
    await deleteDoc(docRef)

    if (get().activeSessionId === sessionId) {
      set({ activeSessionId: null, messages: [] })
    }
  },
}))