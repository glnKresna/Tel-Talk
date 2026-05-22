import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { db, storage } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  Bell, Mail, Calendar, Shield, Trash2, LogOut, ArrowLeft, Settings, Check
} from "lucide-react";

import { UserProfile, NotifSetting } from "../types/profileTypes";
import { AvatarCircle } from "../components/profile-page/avatarCircle";
import { EditableField } from "../components/profile-page/editableProfileField";
import { ToggleRow } from "../components/profile-page/toggleRow";
import { MenuItem } from "../components/profile-page/menuItem";
import { ConfirmModal } from "../components/profile-page/confirmModal";

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currUser, logoutUser } = useAuthStore();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [notifs, setNotifs] = useState<NotifSetting[]>([
    { key: "msg",    label: "Pesan baru",      sub: "Notifikasi setiap pesan masuk", on: true },
    { key: "mention",label: "Mention",          sub: "Saat kamu di-mention",          on: true },
    { key: "group",  label: "Pesan grup",       sub: "Notifikasi dari semua grup",    on: false },
    { key: "sound",  label: "Suara notifikasi", sub: "Mainkan suara pesan",           on: true },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currUser) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, "users", currUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          setUser({
            uid:         currUser.uid,
            displayName: d.nama || currUser.displayName || currUser.email?.split("@")[0] || "User",
            email:       currUser.email || "",
            photoURL:    d.photoURL || currUser.photoURL || null,
            bio:         d.bio || "Halo! Aku lagi pakai Tel-Talk 👋",
            createdAt:   d.createdAt?.toDate ? d.createdAt.toDate().toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            status:      d.status ? "online" : "online",
            stats: {
              messages: d.messageCount || 0,
              groups:   d.groupCount   || 0,
              contacts: d.contactCount || 0,
            },
          });
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currUser]);

  const triggerToast = () => { setToast(true); setTimeout(() => setToast(false), 2500); };

  const updateField = async (field: keyof UserProfile, value: string) => {
    if (!user || !currUser) return;
    setUser((prev) => prev ? { ...prev, [field]: value } : null);
    triggerToast();

    try {
      const userRef = doc(db, "users", currUser.uid);
      const firestoreField = field === "displayName" ? "nama" : field;
      await updateDoc(userRef, { [firestoreField]: value });

      if (field === "displayName") {
        await updateProfile(currUser, { displayName: value });
      }
    } catch (err) {
      console.error("Gagal update data:", err);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currUser) return;

    try {
      setLoading(true);
      const sRef = ref(storage, `avatars/${currUser.uid}_${Date.now()}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);

      await updateDoc(doc(db, "users", currUser.uid), { photoURL: url });
      await updateProfile(currUser, { photoURL: url });

      setUser((prev) => prev ? { ...prev, photoURL: url } : null);
      triggerToast();
    } catch (err) {
      console.error("Gagal upload avatar:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogout(false);
    await logoutUser();
    navigate("/");
  };

  const handleDelete = async () => {
    setShowDelete(false);
    if (!currUser) return;
    try {
      await currUser.delete();
      await logoutUser();
      navigate("/");
    } catch (err) {
      alert("Sesi kedaluwarsa. Tolong login ulang sebelum menghapus akun.");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0d0d12] flex items-center justify-center text-[#8888a8] text-sm">
        Memuat profil Tel-Talk...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d0d12] text-[#f0f0f8] font-sans overflow-hidden select-none">
      
      {/* ══════ SIDEBAR CHATS ══════ */}
      <aside className="w-[268px] bg-[#13131a] border-r border-[#2a2a3e] flex flex-col h-full">
        <div className="px-3.5 h-14 flex items-center justify-between border-b border-[#2a2a3e] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.25)]">
              <span className="text-white text-xs">💬</span>
            </div>
            <span className="text-sm font-bold">Tel-Talk</span>
          </div>
          <div className="w-7 h-7" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">
          <div className="h-full flex items-center justify-center p-6 text-center">
            <p className="text-xs text-[#4a4a6a] leading-relaxed">
              Sidebar chat mock sudah dibersihkan.
            </p>
          </div>
        </div>

        <div className="p-3.5 border-t border-[#2a2a3e] flex items-center gap-2 bg-[#7c3aed]/5 flex-shrink-0">
          <AvatarCircle photoURL={user.photoURL} displayName={user.displayName} size="xs" status={user.status} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user.displayName}</p>
            <p className="text-[10px] text-[#8888a8] mt-0.5">Online</p>
          </div>
          <Settings size={14} className="text-[#a78bfa] cursor-pointer" />
        </div>
      </aside>

      {/* ══════ PROFILE BODY ══════ */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto custom-scroll">
        <div className="sticky top-0 z-10 bg-[#0d0d12]/80 backdrop-blur-md border-b border-[#2a2a3e] px-6 h-14 flex items-center gap-2.5 flex-shrink-0">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg bg-[#1a1a24] border border-[#2a2a3e] flex items-center justify-center cursor-pointer hover:border-[#7c3aed] transition-colors">
            <ArrowLeft size={14} className="text-[#8888a8]" />
          </button>
          <h1 className="text-sm font-bold flex-1">Profil Saya</h1>
          {[Bell, Settings].map((Icon, i) => (
            <button key={i} className="w-8 h-8 rounded-lg bg-[#1a1a24] border border-[#2a2a3e] flex items-center justify-center cursor-pointer">
              <Icon size={14} className="text-[#8888a8]" />
            </button>
          ))}
        </div>

        <div className="max-w-[600px] w-full mx-auto px-5 py-6 flex flex-col gap-3">
          
          {/* Card 1: Avatar & Stats */}
          <div className="bg-[#1a1a24] border border-[#2a2a3e] rounded-xl overflow-hidden">
            <div className="p-5 flex flex-col items-center gap-2.5">
              <AvatarCircle photoURL={user.photoURL} displayName={user.displayName} size="lg" status={user.status} onEdit={() => fileRef.current?.click()} />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <div className="text-center">
                <h2 className="text-base font-bold">{user.displayName}</h2>
                <p className="text-xs text-[#8888a8] mt-0.5">{user.email}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-[#0d2e1e] border border-[#1a4d32] text-[#34d399] text-[11px] font-medium px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" /> Online
              </span>
            </div>
            <div className="grid grid-cols-3 border-t border-[#2a2a3e]">
              {[
                { label: "Pesan", val: user.stats.messages },
                { label: "Grup",  val: user.stats.groups },
                { label: "Kontak", val: user.stats.contacts },
              ].map((s, i) => (
                <div key={i} className={`p-3 text-center ${i > 0 ? "border-l border-[#2a2a3e]" : ""}`}>
                  <p className="text-base font-bold">{s.val}</p>
                  <p className="text-[10px] text-[#4a4a6a] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Info Profil */}
          <div className="bg-[#1a1a24] border border-[#2a2a3e] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a6a] mb-3">Informasi Profil</p>
            <EditableField label="Nama Tampilan" value={user.displayName} onSave={(v) => updateField("displayName", v)} maxLength={40} />
            <div className="border-t border-[#2a2a3e] my-3" />
            <EditableField label="Bio" value={user.bio} onSave={(v) => updateField("bio", v)} multiline maxLength={120} />
            <div className="border-t border-[#2a2a3e] my-3" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a6a] mb-1">Email</p>
                <div className="flex items-center gap-1.5 text-xs text-[#8888a8]">
                  <Mail size={12} className="text-[#4a4a6a]" /> {user.email}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a6a] mb-1">Bergabung sejak</p>
                <div className="flex items-center gap-1.5 text-xs text-[#8888a8]">
                  <Calendar size={12} className="text-[#4a4a6a]" /> {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Preferensi */}
          <div className="bg-[#1a1a24] border border-[#2a2a3e] rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a6a] mb-2">Preferensi Notifikasi</p>
            {notifs.map((n, i) => (
              <ToggleRow key={n.key} label={n.label} sub={n.sub} on={n.on}
                onToggle={() => setNotifs((prev) => prev.map((x, j) => j === i ? { ...x, on: !x.on } : x))} />
            ))}
          </div>

          {/* Card 4: Menu Pengaturan */}
          <div className="bg-[#1a1a24] border border-[#2a2a3e] rounded-xl overflow-hidden">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4a4a6a] px-4 pt-3 pb-1">Pengaturan</p>
            <MenuItem icon={Bell}   label="Notifikasi"         sub="Pesan & mention"      onClick={() => {}} />
            <MenuItem icon={Shield} label="Privasi & Keamanan" sub="Password, sesi aktif" onClick={() => {}} />
            <MenuItem icon={Users}  label="Tampilan"           sub="Tema, ukuran font"     onClick={() => {}} />
          </div>

          {/* Card 5: Danger Zone */}
          <div className="bg-[#1a1a24] border border-[#2a2a3e] rounded-xl overflow-hidden">
            <MenuItem icon={LogOut} label="Keluar"     onClick={() => setShowLogout(true)} danger />
            <MenuItem icon={Trash2} label="Hapus Akun" onClick={() => setShowDelete(true)} danger />
          </div>

          <p className="text-center text-[10px] text-[#4a4a6a] mt-2">Tel-Talk · v1.0.0</p>
        </div>
      </main>

      {/* ══ Modals & Toast ══ */}
      <ConfirmModal show={showLogout} icon={LogOut} title="Keluar dari akun?" desc="Kamu perlu login lagi untuk menggunakan Tel-Talk." confirmLabel="Keluar" onConfirm={handleLogout} onClose={() => setShowLogout(false)} />
      <ConfirmModal show={showDelete} icon={Trash2} title="Hapus akun?" desc="Semua data akan dihapus permanen. Tindakan ini tidak bisa dibatalkan." confirmLabel="Hapus Akun" onConfirm={handleDelete} onClose={() => setShowDelete(false)} />

      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-1.5 bg-[#0d2e1e] border border-[#1a4d32] text-[#34d399] text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-[toastIn_0.25s_ease]">
          <Check size={13} /> Perubahan tersimpan!
        </div>
      )}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 2px; }
        @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
