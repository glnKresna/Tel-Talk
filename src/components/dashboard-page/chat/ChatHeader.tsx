import type { Room } from '../../../types/dashboardTypes'

type Props = {
  activeRoom: Room
  messageCount: number
}

export function ChatHeader({ activeRoom, messageCount }: Props) {
  return (
    <>
      <span className="text-xl">{activeRoom.icon}</span>
      <div>
        <h2 className="font-semibold text-white text-sm">{activeRoom.name}</h2>
        <p className="text-[11px] text-zinc-500">{messageCount} pesan</p>
      </div>
    </>
  )
}
