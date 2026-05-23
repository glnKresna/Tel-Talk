type Props = {
  contactCount: number
}

export function ContactsHeader({ contactCount }: Props) {
  return (
    <>
      <span className="text-xl">👥</span>
      <div>
        <h2 className="font-semibold text-white text-sm">Kontak</h2>
        <p className="text-[11px] text-zinc-500">{contactCount} kontak tersimpan</p>
      </div>
    </>
  )
}
