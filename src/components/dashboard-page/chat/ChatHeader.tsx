import type { Room } from '../../../types/dashboardTypes'
import { AvatarCircle } from '../../profile-page/avatarCircle'

type Props = {
  activeRoom: Room
  messageCount: number
}

export function ChatHeader({ activeRoom, messageCount }: Props) {
  return (
    <>
      <AvatarCircle
        photoURL={activeRoom.photoURL || null}
        displayName={activeRoom.name}
        size="xs"
        variant="dashboard"
      />
      <div>
        <h2 className="font-semibold text-white text-sm">{activeRoom.name}</h2>
        <p className="text-[11px] text-zinc-500">{messageCount} pesan</p>
      </div>
    </>
  )
}
