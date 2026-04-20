import { useState, useRef } from "react";
import {
  User,
  Camera,
  Edit3,
  Check,
  X,
  LogOut,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Bell,
  Trash2,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  createdAt: string;
  status: "online" | "offline" | "away";
}

// ─── Mock — ganti dengan data dari Firebase Auth + Firestore ──────────────────
const mockUser: UserProfile = {
  uid: "abc123",
  displayName: "Juan Mesyiakh Orydex",
  email: "juan@example.com",
  photoURL: null,
  bio: "Halo! Aku lagi pakai Tel-Talk 👋",
  createdAt: "2025-01-15",
  status: "online",
};

// ─── Helper: inisial dari nama ────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Sub-komponen: Avatar ─────────────────────────────────────────────────────
function Avatar({
  user,
  size = "lg",
  onEdit,
}: {
  user: UserProfile;
  size?: "sm" | "lg";
  onEdit?: () => void;
}) {
  const dim = size === "lg" ? "w-24 h-24 text-3xl" : "w-10 h-10 text-base";
  return (
    <div className="relative inline-block">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName}
          className={`${dim} rounded-full object-cover ring-4 ring-white shadow-md`}
        />
      ) : (
        <div
          className={`${dim} rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center ring-4 ring-white shadow-md font-semibold text-white`}
        >
          {getInitials(user.displayName)}
        </div>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
          title="Ganti foto"
        >
          <Camera size={14} className="text-white" />
        </button>
      )}
      {/* Status dot */}
      <span
        className={`absolute top-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
          user.status === "online"
            ? "bg-emerald-400"
            : user.status === "away"
            ? "bg-amber-400"
            : "bg-gray-400"
        }`}
      />
    </div>
  );
}

// ─── Sub-komponen: Field yang bisa diedit ─────────────────────────────────────
function EditableField({
  label,
  value,
  onSave,
  multiline = false,
  maxLength = 100,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    if (draft.trim()) {
      onSave(draft.trim());
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="group">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      {editing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={maxLength}
              rows={3}
              autoFocus
              className="w-full text-sm text-gray-800 bg-indigo-50 border border-indigo-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          ) : (
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={maxLength}
              autoFocus
              className="w-full text-sm text-gray-800 bg-indigo-50 border border-indigo-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          )}
          <p className="text-xs text-gray-400 text-right">
            {draft.length}/{maxLength}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Check size={12} /> Simpan
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X size={12} /> Batal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-gray-800 flex-1 break-words">{value}</p>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100"
            title={`Edit ${label}`}
          >
            <Edit3 size={14} className="text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sub-komponen: Item menu ──────────────────────────────────────────────────
function MenuItem({
  icon: Icon,
  label,
  sublabel,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
        danger
          ? "hover:bg-red-50 text-red-500"
          : "hover:bg-gray-50 text-gray-700"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger ? "bg-red-100" : "bg-indigo-50"
        }`}
      >
        <Icon size={18} className={danger ? "text-red-500" : "text-indigo-600"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {sublabel && (
          <p className="text-xs text-gray-400 truncate">{sublabel}</p>
        )}
      </div>
      {!danger && <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />}
    </button>
  );
}

// ─── Komponen utama: ProfilePage ──────────────────────────────────────────────
export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulasi update Firestore — ganti dengan updateDoc() dari Firebase
  const updateField = (field: keyof UserProfile, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
    // TODO: await updateDoc(doc(db, "users", user.uid), { [field]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Simulasi upload foto — ganti dengan Firebase Storage
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setUser((prev) => ({ ...prev, photoURL: dataUrl }));
      // TODO: upload ke Firebase Storage lalu simpan URL ke Firestore
    };
    reader.readAsDataURL(file);
  };

  // Simulasi logout — ganti dengan signOut(auth) dari Firebase
  const handleLogout = () => {
    // TODO: await signOut(auth); navigate("/login");
    alert("Logout berhasil! (simulasi)");
    setShowLogoutConfirm(false);
  };

  const formattedDate = new Date(user.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-900 flex-1">Profil Saya</h1>
          {saved && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-pulse">
              <Check size={12} /> Tersimpan
            </span>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-4">
        {/* ── Kartu foto & nama ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar
              user={user}
              size="lg"
              onEdit={() => fileInputRef.current?.click()}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.displayName}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                user.status === "online"
                  ? "bg-emerald-100 text-emerald-700"
                  : user.status === "away"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {user.status === "online"
                ? "Online"
                : user.status === "away"
                ? "Tidak aktif"
                : "Offline"}
            </span>
          </div>
        </div>

        {/* ── Kartu info yang bisa diedit ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Informasi Profil
          </h3>
          <EditableField
            label="Nama Tampilan"
            value={user.displayName}
            onSave={(v) => updateField("displayName", v)}
            maxLength={50}
          />
          <div className="border-t border-gray-50" />
          <EditableField
            label="Bio"
            value={user.bio}
            onSave={(v) => updateField("bio", v)}
            multiline
            maxLength={150}
          />
          <div className="border-t border-gray-50" />
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Email
            </p>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-gray-400" />
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-gray-50" />
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Bergabung sejak
            </p>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <p className="text-sm text-gray-600">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* ── Kartu pengaturan ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Pengaturan
            </h3>
          </div>
          <div className="px-1 pb-2 space-y-0.5">
            <MenuItem
              icon={Bell}
              label="Notifikasi"
              sublabel="Kelola notifikasi pesan"
              onClick={() => {}}
            />
            <MenuItem
              icon={Shield}
              label="Privasi & Keamanan"
              sublabel="Ubah password, sesi aktif"
              onClick={() => {}}
            />
          </div>
        </div>

        {/* ── Kartu aksi berbahaya ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-1 py-2 space-y-0.5">
            <MenuItem
              icon={LogOut}
              label="Keluar"
              onClick={() => setShowLogoutConfirm(true)}
              danger
            />
            <MenuItem
              icon={Trash2}
              label="Hapus Akun"
              onClick={() => setShowDeleteConfirm(true)}
              danger
            />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Tel-Talk · v1.0.0
        </p>
      </div>

      {/* ── Modal konfirmasi logout ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <LogOut size={22} className="text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">Keluar dari akun?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Kamu perlu login lagi untuk menggunakan Tel-Talk.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal konfirmasi hapus akun ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">Hapus akun?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Semua data dan riwayat chat kamu akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  // TODO: deleteUser(auth.currentUser)
                  alert("Hapus akun (simulasi)");
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}