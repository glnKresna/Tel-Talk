type UnreadBadgeProps = {
  count: number
}

export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null

  return (
    <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-violet-600 text-[9px] font-bold text-white px-1 shadow-md select-none shrink-0">
      {count}
    </span>
  )
}
