import type { Room } from '../../../types/dashboardTypes'
import { RoomListItem } from './RoomListItem'

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
        <RoomListItem
          key={room.id}
          room={room}
          isActive={activeRoomId === room.id}
          isSidebarOpen={isSidebarOpen}
          onSelect={() => onSelectRoom(room)}
        />
      ))}
    </nav>
  )
}
