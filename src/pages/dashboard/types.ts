export type ActiveTab = 'chat' | 'ai'

export interface UserProfile {
  userID: string
  nama: string
  email: string
  isOnline: boolean
}

export interface Room {
  id: string
  name: string
  icon: string
}

export interface FilePreviewState {
  file: File
  previewUrl: string | null
}

export type ChatbotMsg = {
  role: 'user' | 'model'
  content: string
}

