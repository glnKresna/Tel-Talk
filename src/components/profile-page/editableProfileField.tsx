import { useState } from "react";
import { Edit3, Check } from "lucide-react";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
}

export function EditableField({ label, value, onSave, multiline = false, maxLength = 100 }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    if (draft.trim() && draft.trim() !== value) { onSave(draft.trim()); setEditing(false); }
    else cancel();
  };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className="relative group">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a6a] mb-1">{label}</p>
      {editing ? (
        <div>
          {multiline ? (
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={maxLength} rows={3} autoFocus className="w-full bg-[#252535] border border-[#7c3aed] rounded-xl p-2.5 text-sm text-[#f0f0f8] font-sans resize-none outline-none" />
          ) : (
            <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={maxLength} autoFocus className="w-full bg-[#252535] border border-[#7c3aed] rounded-xl px-3 py-2 text-sm text-[#f0f0f8] font-sans outline-none" />
          )}
          <p className="text-[11px] text-[#4a4a6a] text-right mt-1">{draft.length}/{maxLength}</p>
          <div className="flex gap-2 mt-1.5">
            <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
              <Check size={11} /> Simpan
            </button>
            <button onClick={cancel} className="px-3 py-1.5 bg-[#252535] text-[#8888a8] text-xs rounded-lg border border-[#2a2a3e] cursor-pointer">Batal</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-[#f0f0f8] flex-1 leading-relaxed whitespace-pre-wrap">{value}</p>
          <button onClick={() => { setDraft(value); setEditing(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-[#252535] border border-[#2a2a3e] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#7c3aed]">
            <Edit3 size={11} className="text-[#a78bfa]" />
          </button>
        </div>
      )}
    </div>
  );
}