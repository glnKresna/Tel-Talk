import { useState, useRef, useEffect } from "react";
import {
  Camera, Edit3, Check, X, LogOut, Mail, Calendar,
  Shield, Bell, Trash2, ChevronRight, MessageSquare,
  Search, Settings, Users, Activity, Hash, ArrowLeft,
} from "lucide-react";

// ─────────────────────────────────────────────────────
// FIREBASE IMPORTS — aktifkan setelah setup
// ─────────────────────────────────────────────────────
// import { auth, db, storage }                              from "../config/firebase";
// import { signOut, deleteUser, updateProfile }             from "firebase/auth";
// import { doc, getDoc, updateDoc, collection, query,
//          where, getDocs, onSnapshot }                     from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL }               from "firebase/storage";

// ─── Types ────────────────────────────────────────────
interface UserProfile {
  uid:         string;
  displayName: string;
  email:       string;
  photoURL:    string | null;
  bio:         string;
  createdAt:   string;
  status:      "online" | "offline" | "away";
  stats:       { messages: number; groups: number; contacts: number };
}

interface ChatPreview {
  id:        string;
  name:      string;
  lastMsg:   string;
  time:      string;
  unread?:   number;
  initials:  string;
  color:     string;
  online?:   boolean;
  isGroup?:  boolean;
}

interface NotifSetting {
  key:   string;
  label: string;
  sub:   string;
  on:    boolean;
}

// ─── Warna tema ───────────────────────────────────────
const C = {
  bgPage:    "#0d0d12",
  bgSidebar: "#13131a",
  bgCard:    "#1a1a24",
  bgCard2:   "#1e1e2c",
  bgInput:   "#252535",
  border:    "#2a2a3e",
  purple:    "#7c3aed",
  purpleH:   "#6d28d9",
  purpleDim: "#3b1f6e",
  text1:     "#f0f0f8",
  text2:     "#8888a8",
  text3:     "#4a4a6a",
  green:     "#34d399",
  red:       "#f87171",
  redBg:     "#2d1515",
};

// ─── Mock data — GANTI dengan Firebase ───────────────
const MOCK_USER: UserProfile = {
  uid:         "abc123",
  displayName: "Juan Mesyiakh Orydex",
  email:       "juan@example.com",
  photoURL:    null,
  bio:         "Halo! Aku lagi pakai Tel-Talk 👋",
  createdAt:   "2025-01-15",
  status:      "online",
  stats:       { messages: 128, groups: 5, contacts: 4 },
};

const MOCK_CHATS: ChatPreview[] = [
  { id: "1", name: "Daffa Al Abiyyu",  initials: "DA", color: "linear-gradient(135deg,#0d9488,#0891b2)", lastMsg: "Oke siap, nanti aku push",    time: "10:24",  unread: 3, online: true },
  { id: "2", name: "IPPL Tel-Talk",    initials: "IT", color: "linear-gradient(135deg,#7c3aed,#3b82f6)", lastMsg: "Galan: Deploy berhasil!",      time: "09:51",  unread: 5, isGroup: true },
  { id: "3", name: "Kafin Fazlur",     initials: "KF", color: "linear-gradient(135deg,#db2777,#7c3aed)", lastMsg: "Login sudah beres bang",      time: "09:30" },
  { id: "4", name: "Luthfi Ramadhani", initials: "ML", color: "linear-gradient(135deg,#ea580c,#d97706)", lastMsg: "File upload masih error nih",  time: "Kemarin", unread: 1 },
  { id: "5", name: "Galan Kresna",     initials: "GK", color: "linear-gradient(135deg,#0d9488,#0891b2)", lastMsg: "Vercel sudah up!",             time: "Senin",  online: true },
];

// ─── Helpers ─────────────────────────────────────────
function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Sub: Avatar ──────────────────────────────────────
function AvatarCircle({
  photoURL, displayName, size, status, onEdit,
}: {
  photoURL:    string | null;
  displayName: string;
  size:        "xs" | "sm" | "lg";
  status?:     string;
  onEdit?:     () => void;
}) {
  const dim     = size === "lg" ? 88 : size === "sm" ? 40 : 34;
  const fs      = size === "lg" ? 28 : size === "sm" ? 14 : 11;
  const dotSize = size === "lg" ? 13 : 9;
  const dotOff  = size === "lg" ? 4 : 0;

  return (
    <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }}>
      <div style={{
        width: dim, height: dim, borderRadius: "50%",
        background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: fs, fontWeight: 700, color: "#fff",
        boxShadow: `0 0 0 3px ${C.bgCard},0 0 0 4px ${C.border},0 8px 28px #7c3aed28`,
        overflow: "hidden", position: "relative", flexShrink: 0,
      }}>
        {photoURL
          ? <img src={photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
          : <span style={{ position: "relative", zIndex: 1 }}>{getInitials(displayName)}</span>
        }
      </div>
      {onEdit && (
        <button onClick={onEdit} style={{
          position: "absolute", bottom: 2, right: 2,
          width: 26, height: 26, borderRadius: "50%",
          background: C.purple, border: `2px solid ${C.bgCard}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <Camera size={11} color="#fff" />
        </button>
      )}
      {status && (
        <span style={{
          position: "absolute", top: dotOff, left: dotOff,
          width: dotSize, height: dotSize, borderRadius: "50%",
          background: status === "online" ? C.green : status === "away" ? "#f59e0b" : "#6b7280",
          border: `2px solid ${C.bgCard}`,
        }} />
      )}
    </div>
  );
}

// ─── Sub: EditableField ───────────────────────────────
function EditableField({
  label, value, onSave, multiline = false, maxLength = 100,
}: {
  label:      string;
  value:      string;
  onSave:     (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);

  const save = () => {
    if (draft.trim()) { onSave(draft.trim()); setEditing(false); }
    else cancel();
  };
  const cancel = () => { setDraft(value); setEditing(false); };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: C.bgInput,
    border: `1px solid ${C.purple}`, borderRadius: 10,
    padding: "9px 12px", fontSize: 14, color: C.text1,
    fontFamily: "Inter,sans-serif", boxSizing: "border-box",
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={(e) => {
        const btn = (e.currentTarget as HTMLDivElement).querySelector<HTMLButtonElement>(".edit-btn");
        if (btn) btn.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        const btn = (e.currentTarget as HTMLDivElement).querySelector<HTMLButtonElement>(".edit-btn");
        if (btn) btn.style.opacity = "0";
      }}
    >
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.text3, marginBottom: 5 }}>
        {label}
      </p>
      {editing ? (
        <div>
          {multiline
            ? <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={maxLength} rows={3} autoFocus style={{ ...inputStyle, resize: "none" }} />
            : <input    value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={maxLength}          autoFocus style={inputStyle} />
          }
          <p style={{ fontSize: 11, color: C.text3, textAlign: "right", marginTop: 3 }}>{draft.length}/{maxLength}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={save}   style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", background: C.purple, color: "#fff", fontSize: 12, fontWeight: 600, borderRadius: 8, border: "none", cursor: "pointer" }}>
              <Check size={11} /> Simpan
            </button>
            <button onClick={cancel} style={{ padding: "6px 12px", background: C.bgInput, color: C.text2, fontSize: 12, borderRadius: 8, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              Batal
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <p style={{ fontSize: 14, color: C.text1, flex: 1, lineHeight: 1.6 }}>{value}</p>
          <button className="edit-btn" onClick={() => { setDraft(value); setEditing(true); }} style={{
            opacity: 0, transition: "opacity .15s",
            width: 26, height: 26, background: C.bgInput,
            border: `1px solid ${C.border}`, borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}>
            <Edit3 size={11} color="#a78bfa" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sub: Toggle Row ─────────────────────────────────
function ToggleRow({ label, sub, on, onToggle }: { label: string; sub: string; on: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: C.text1 }}>{label}</p>
        <p style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>{sub}</p>
      </div>
      <button onClick={onToggle} style={{
        width: 38, height: 20, borderRadius: 10,
        background: on ? C.purple : C.bgInput,
        border: on ? "none" : `1px solid ${C.border}`,
        position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0,
      }}>
        <span style={{ position: "absolute", top: 2, left: on ? 20 : 2, width: 16, height: 16, borderRadius: "50%", background: on ? "#fff" : C.text3, transition: "left .2s" }} />
      </button>
    </div>
  );
}

// ─── Sub: Menu Item ───────────────────────────────────
function MenuItem({ icon: Icon, label, sub, onClick, danger = false }: {
  icon:     React.ElementType;
  label:    string;
  sub?:     string;
  onClick:  () => void;
  danger?:  boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", border: "none", cursor: "pointer", textAlign: "left", background: hover ? (danger ? "#2d151530" : C.bgCard2) : "transparent", transition: "background .15s" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: danger ? C.redBg : C.purpleDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color={danger ? C.red : "#a78bfa"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: danger ? C.red : C.text1 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>{sub}</p>}
      </div>
      {!danger && <ChevronRight size={13} color={C.text3} />}
    </button>
  );
}

// ─── Sub: Confirm Modal ───────────────────────────────
function ConfirmModal({ show, icon: Icon, title, desc, confirmLabel, onConfirm, onClose }: {
  show:         boolean;
  icon:         React.ElementType;
  title:        string;
  desc:         string;
  confirmLabel: string;
  onConfirm:    () => void;
  onClose:      () => void;
}) {
  if (!show) return null;
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 380, animation: "modalIn .2s ease" }}>
        <div style={{ width: 52, height: 52, background: C.redBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Icon size={24} color={C.red} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, textAlign: "center", color: C.text1, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: C.text2, textAlign: "center", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: desc }} />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose}   style={{ flex: 1, padding: 11, borderRadius: 10, background: C.bgInput, border: `1px solid ${C.border}`, color: C.text2, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Batal</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 11, borderRadius: 10, background: "#7f1d1d", border: "1px solid #991b1b", color: C.red, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────
export default function ProfilePage() {
  const [user,        setUser]       = useState<UserProfile>(MOCK_USER);
  const [notifs,      setNotifs]     = useState<NotifSetting[]>([
    { key: "msg",    label: "Pesan baru",      sub: "Notifikasi setiap pesan masuk", on: true },
    { key: "mention",label: "Mention",          sub: "Saat kamu di-mention",          on: true },
    { key: "group",  label: "Pesan grup",       sub: "Notifikasi dari semua grup",    on: false },
    { key: "sound",  label: "Suara notifikasi", sub: "Mainkan suara pesan",           on: true },
  ]);
  const [showLogout,  setShowLogout] = useState(false);
  const [showDelete,  setShowDelete] = useState(false);
  const [toast,       setToast]      = useState(false);
  const [search,      setSearch]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch user dari Firestore ─────────────────────
  useEffect(() => {
    // TODO: aktifkan setelah Firebase terhubung
    //
    // const fetchUser = async () => {
    //   const curr = auth.currentUser;
    //   if (!curr) return;
    //   const snap = await getDoc(doc(db, "users", curr.uid));
    //   if (snap.exists()) {
    //     const d = snap.data();
    //     setUser({
    //       uid:         curr.uid,
    //       displayName: d.displayName || curr.displayName || "",
    //       email:       curr.email || "",
    //       photoURL:    d.photoURL || curr.photoURL || null,
    //       bio:         d.bio || "",
    //       createdAt:   d.createdAt?.toDate().toISOString().split("T")[0] || "",
    //       status:      d.status || "online",
    //       stats: {
    //         messages: d.messageCount || 0,
    //         groups:   d.groupCount   || 0,
    //         contacts: d.contactCount || 0,
    //       },
    //     });
    //   }
    // };
    // fetchUser();
  }, []);

  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 2500); };

  // ── Update field ke Firestore ─────────────────────
  const updateField = (field: keyof UserProfile, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
    showToast();
    // TODO: await updateDoc(doc(db, "users", user.uid), { [field]: value });
    // TODO: if (field === "displayName") await updateProfile(auth.currentUser!, { displayName: value });
  };

  // ── Upload foto ───────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUser((prev) => ({ ...prev, photoURL: ev.target?.result as string }));
    reader.readAsDataURL(file);
    // TODO:
    // const sRef = ref(storage, `avatars/${user.uid}`);
    // await uploadBytes(sRef, file);
    // const url = await getDownloadURL(sRef);
    // await updateDoc(doc(db, "users", user.uid), { photoURL: url });
    // await updateProfile(auth.currentUser!, { photoURL: url });
  };

  // ── Logout ────────────────────────────────────────
  const handleLogout = async () => {
    setShowLogout(false);
    // TODO: await signOut(auth); navigate("/login");
  };

  // ── Hapus akun ────────────────────────────────────
  const handleDelete = async () => {
    setShowDelete(false);
    // TODO:
    // await deleteDoc(doc(db, "users", user.uid));
    // await deleteUser(auth.currentUser!);
    // navigate("/login");
  };

  const filteredChats = MOCK_CHATS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const card: React.CSSProperties = {
    background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden",
  };
  const sLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.text3,
  };
  const divider: React.CSSProperties = {
    border: "none", borderTop: `1px solid ${C.border}`, margin: "12px 0",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", height: "100vh", background: C.bgPage, color: C.text1, fontFamily: "Inter,sans-serif", overflow: "hidden" }}>

      {/* ══════ SIDEBAR ══════ */}
      <aside style={{ width: 268, minWidth: 268, background: C.bgSidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh" }}>

        {/* Logo */}
        <div style={{ padding: "0 14px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px #7c3aed40" }}>
              <MessageSquare size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Tel-Talk</span>
          </div>
          <button style={{ width: 28, height: 28, borderRadius: 8, background: C.bgCard, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Hash size={13} color={C.text2} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <Search size={12} color={C.text3} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input type="text" placeholder="Cari pesan..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", background: C.bgCard2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "7px 12px 7px 28px", fontSize: 13, color: C.text1, boxSizing: "border-box", fontFamily: "Inter,sans-serif" }} />
          </div>
        </div>

        <p style={{ ...sLabel, padding: "10px 14px 3px" }}>Pesan</p>

        {/* Chat list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredChats.map((chat) => (
            <div key={chat.id}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", cursor: "pointer", transition: "background .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bgCard2)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: chat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                  {chat.isGroup ? <Users size={16} color="#fff" /> : chat.initials}
                </div>
                {chat.online && !chat.isGroup && (
                  <span style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: C.green, border: `2px solid ${C.bgSidebar}` }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.name}</p>
                <p style={{ fontSize: 11, color: C.text3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.lastMsg}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: C.text3 }}>{chat.time}</span>
                {chat.unread ? (
                  <span style={{ minWidth: 17, height: 17, borderRadius: 9, background: C.purple, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                    {chat.unread}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8, background: "#7c3aed12", flexShrink: 0 }}>
          <AvatarCircle photoURL={user.photoURL} displayName={user.displayName} size="xs" status={user.status} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName.split(" ").slice(0, 2).join(" ")}</p>
            <p style={{ fontSize: 10, color: C.text2, marginTop: 1 }}>Online</p>
          </div>
          <Settings size={14} color="#a78bfa" />
        </div>
      </aside>

      {/* ══════ MAIN — STACK KE BAWAH ══════ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>

        {/* Topbar */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: `${C.bgPage}cc`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button style={{ width: 32, height: 32, borderRadius: 9, background: C.bgCard, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={15} color={C.text2} />
          </button>
          <h1 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Profil Saya</h1>
          {[Bell, Settings].map((Icon, i) => (
            <button key={i} style={{ width: 32, height: 32, borderRadius: 9, background: C.bgCard, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon size={14} color={C.text2} />
            </button>
          ))}
        </div>

        {/* Konten — semua stack ke bawah dalam 1 kolom */}
        <div style={{ maxWidth: 640, width: "100%", margin: "0 auto", padding: "20px 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* ── 1. Avatar card ── */}
          <div style={card}>
            <div style={{ padding: "24px 20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <AvatarCircle
                photoURL={user.photoURL}
                displayName={user.displayName}
                size="lg"
                status={user.status}
                onEdit={() => fileRef.current?.click()}
              />
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: 17, fontWeight: 700 }}>{user.displayName}</h2>
                <p style={{ fontSize: 13, color: C.text2, marginTop: 3 }}>{user.email}</p>
              </div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0d2e1e", border: "1px solid #1a4d32", color: C.green, fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 20, marginBottom: 16 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} /> Online
              </span>
            </div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: `1px solid ${C.border}` }}>
              {[
                { label: "Pesan",   val: user.stats.messages },
                { label: "Grup",    val: user.stats.groups },
                { label: "Kontak",  val: user.stats.contacts },
              ].map((s, i) => (
                <div key={i} style={{ padding: "12px 8px", textAlign: "center", borderLeft: i > 0 ? `1px solid ${C.border}` : "none" }}>
                  <p style={{ fontSize: 18, fontWeight: 700 }}>{s.val}</p>
                  <p style={{ fontSize: 10, color: C.text3, marginTop: 1 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 2. Informasi Profil ── */}
          <div style={card}>
            <div style={{ padding: 16 }}>
              <p style={{ ...sLabel, marginBottom: 12 }}>Informasi Profil</p>
              <EditableField label="Nama Tampilan" value={user.displayName} onSave={(v) => updateField("displayName", v)} maxLength={50} />
              <hr style={divider} />
              <EditableField label="Bio" value={user.bio} onSave={(v) => updateField("bio", v)} multiline maxLength={150} />
              <hr style={divider} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <p style={{ ...sLabel, marginBottom: 5 }}>Email</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Mail size={12} color={C.text3} />
                    <p style={{ fontSize: 13, color: C.text2 }}>{user.email}</p>
                  </div>
                </div>
                <div>
                  <p style={{ ...sLabel, marginBottom: 5 }}>Bergabung sejak</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={12} color={C.text3} />
                    <p style={{ fontSize: 13, color: C.text2 }}>{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. Notifikasi ── */}
          <div style={card}>
            <div style={{ padding: 16 }}>
              <p style={{ ...sLabel, marginBottom: 4 }}>Preferensi Notifikasi</p>
              {notifs.map((n, i) => (
                <ToggleRow
                  key={n.key}
                  label={n.label}
                  sub={n.sub}
                  on={n.on}
                  onToggle={() => setNotifs((prev) => prev.map((x, j) => j === i ? { ...x, on: !x.on } : x))}
                />
              ))}
            </div>
          </div>

          {/* ── 4. Pengaturan ── */}
          <div style={card}>
            <p style={{ ...sLabel, padding: "12px 16px 4px" }}>Pengaturan</p>
            <MenuItem icon={Bell}   label="Notifikasi"         sub="Pesan & mention"      onClick={() => {}} />
            <MenuItem icon={Shield} label="Privasi & Keamanan" sub="Password, sesi aktif" onClick={() => {}} />
            <MenuItem icon={Users}  label="Tampilan"           sub="Tema, ukuran font"     onClick={() => {}} />
          </div>

          {/* ── 5. Aksi berbahaya ── */}
          <div style={card}>
            <MenuItem icon={LogOut} label="Keluar"     onClick={() => setShowLogout(true)} danger />
            <MenuItem icon={Trash2} label="Hapus Akun" onClick={() => setShowDelete(true)} danger />
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: C.text3 }}>Tel-Talk · v1.0.0</p>
        </div>
      </main>

      {/* ══ Modals ══ */}
      <ConfirmModal
        show={showLogout} icon={LogOut}
        title="Keluar dari akun?"
        desc="Kamu perlu login lagi untuk menggunakan Tel-Talk."
        confirmLabel="Keluar"
        onConfirm={handleLogout}
        onClose={() => setShowLogout(false)}
      />
      <ConfirmModal
        show={showDelete} icon={Trash2}
        title="Hapus akun?"
        desc={`Semua data akan dihapus permanen. Tindakan ini <strong style="color:${C.red}">tidak bisa dibatalkan</strong>.`}
        confirmLabel="Hapus Akun"
        onConfirm={handleDelete}
        onClose={() => setShowDelete(false)}
      />

      {/* ══ Toast ══ */}
      {toast && (
        <div style={{ position: "fixed", top: 18, right: 18, zIndex: 60, display: "flex", alignItems: "center", gap: 8, background: "#0d2e1e", border: "1px solid #1a4d32", color: C.green, fontSize: 13, fontWeight: 500, padding: "10px 16px", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,.5)", animation: "toastIn .25s ease" }}>
          <Check size={13} /> Perubahan tersimpan!
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, textarea, button { font-family: Inter,sans-serif; }
        input::placeholder { color: ${C.text3}; }
        input, textarea { outline: none; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        @keyframes modalIn { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}