import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function VerifyEmail() {

  const navigate = useNavigate();

  const {
    currUser,
    resendVerifikasi,
    logoutUser,
    reloadUser
  } = useAuthStore();

  const cekVerifikasi = async () => {

    await reloadUser();

    const { currUser } = useAuthStore.getState();

    if (currUser?.emailVerified) {
      navigate('/');
    } else {
      alert('Email belum diverifikasi.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] flex flex-col items-center justify-center p-4 text-center">

      <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mb-6 border border-violet-500/30">
        <svg
          className="w-8 h-8 text-violet-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white mb-3">
        Verifikasi Email
      </h1>

      <p className="text-zinc-400 max-w-md mb-2">
        Kami telah mengirim email verifikasi ke:
      </p>

      <p className="text-white font-medium mb-8">
        {currUser?.email}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">

        <button
          onClick={cekVerifikasi}
          className="w-full bg-violet-500 hover:bg-violet-600 text-white py-3 rounded-xl transition-all"
        >
          Saya Sudah Verifikasi
        </button>

        <button
          onClick={() => resendVerifikasi()}
          className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white py-3 rounded-xl transition-all"
        >
          Kirim Ulang Email
        </button>

        <button
          onClick={async () => {
            await logoutUser();
            navigate('/login');
          }}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Kembali ke Login
        </button>

      </div>
    </div>
  );
}