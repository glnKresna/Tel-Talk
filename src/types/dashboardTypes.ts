import type { ContactWithProfile } from './contactTypes'

export type ActiveTab = 'dms' | 'rooms' | 'pinned' | 'ai'

export interface Room {
  id: string
  name: string
  icon: string
  photoURL?: string | null
  members?: string[]
  description?: string
  status?: 'public' | 'private'
  admin?: string
  admins?: string[]
}

export interface FilePreviewState {
  file: File
  previewUrl: string | null
}

export type ChatbotMsg = {
  role: 'user' | 'model'
  content: string
}

export interface ModalState {
  isOpen: boolean
  type: 'add_contact' | 'create_room' | null
}

export interface DashboardSubPanelProps {
  activeTab: ActiveTab
  searchVal: string
  setSearchVal: (val: string) => void
  
  // Props daftar kontak
  contactLoading: boolean
  contacts: ContactWithProfile[]
  activeContactId: string | null
  onSelectContact: (uid: string) => void
  
  // Props daftar room
  rooms: Room[]
  activeRoomId: string
  onSelectRoom: (room: Room) => void
}