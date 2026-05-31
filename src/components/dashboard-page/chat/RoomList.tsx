import type { Room } from '../../../types/dashboardTypes'
import { AvatarCircle } from '../../profile-page/avatarCircle'

type Props = {
  rooms: Room[]
  activeRoomId: string
  isSidebarOpen: boolean
  onSelectRoom: (room: Room) => void
}

export function RoomList({ rooms, activeRoomId, isSidebarOpen, onSelectRoom }: Props) {
  return (
    <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {rooms.map((room) => (
        <button
          key={room.id}
          type="button"
          onClick={() => onSelectRoom(room)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
            ${activeRoomId === room.id
              ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
              : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'}`}
        >
          <AvatarCircle
            photoURL={room.photoURL || null}
            displayName={room.name}
            size="xs"
            variant="dashboard"
          />
          {isSidebarOpen && <span className="font-medium">{room.name}</span>}
        </button>
      ))}
    </nav>
  )
}
