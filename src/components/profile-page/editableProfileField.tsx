import { useState } from "react";
import { Edit3, Check } from "lucide-react";

type CardProps = {
  variant?: "card";
  label: string;
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
};

type DashboardProps = {
  variant: "dashboard";
  label: string;
  value: string;
  savedValue: string;
  onChange: (v: string) => void;
  onSave: () => void;
  disabled?: boolean;
  saving?: boolean;
  multiline?: boolean;
  placeholder?: string;
  saveLabel?: string;
  saveVariant?: "primary" | "secondary";
};

export type EditableFieldProps = CardProps | DashboardProps;

export function EditableField(props: EditableFieldProps) {
  if (props.variant === "dashboard") {
    const {
      label,
      value,
      savedValue,
      onChange,
      onSave,
      disabled = false,
      saving = false,
      multiline = false,
      placeholder,
      saveLabel = "Simpan",
      saveVariant = "primary",
    } = props;

    const isDirty = value.trim() !== savedValue.trim();
    const showSave = multiline ? value.trim().length > 0 && isDirty : value.trim().length > 0 && isDirty;

    const inputClass =
      "w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 disabled:opacity-50";

    const saveButtonClass =
      saveVariant === "primary"
        ? "px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors"
        : "px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors";

    return (
      <div className="space-y-1.5">
        <label className="block text-[11px] text-zinc-500">{label}</label>
        {multiline ? (
          <textarea
            value={value}
            disabled={disabled || saving}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        ) : (
          <input
            value={value}
            disabled={disabled || saving}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
        )}
        {showSave && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onSave}
              disabled={disabled || saving}
              className={saveButtonClass}
            >
              {saving ? "..." : saveLabel}
            </button>
          </div>
        )}
      </div>
    );
  }

  const { label, value, onSave, multiline = false, maxLength = 100 } = props;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    if (draft.trim() && draft.trim() !== value) {
      onSave(draft.trim());
      setEditing(false);
    } else cancel();
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="relative group">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a6a] mb-1">{label}</p>
      {editing ? (
        <div>
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={maxLength}
              rows={3}
              autoFocus
              className="w-full bg-[#252535] border border-[#7c3aed] rounded-xl p-2.5 text-sm text-[#f0f0f8] font-sans resize-none outline-none"
            />
          ) : (
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={maxLength}
              autoFocus
              className="w-full bg-[#252535] border border-[#7c3aed] rounded-xl px-3 py-2 text-sm text-[#f0f0f8] font-sans outline-none"
            />
          )}
          <p className="text-[11px] text-[#4a4a6a] text-right mt-1">
            {draft.length}/{maxLength}
          </p>
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={save}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              <Check size={11} /> Simpan
            </button>
            <button
              onClick={cancel}
              className="px-3 py-1.5 bg-[#252535] text-[#8888a8] text-xs rounded-lg border border-[#2a2a3e] cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-[#f0f0f8] flex-1 leading-relaxed whitespace-pre-wrap">{value}</p>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 bg-[#252535] border border-[#2a2a3e] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#7c3aed]"
          >
            <Edit3 size={11} className="text-[#a78bfa]" />
          </button>
        </div>
      )}
    </div>
  );
}
