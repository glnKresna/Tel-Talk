import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ForgotPassword() {

  const navigate = useNavigate();

  const { forgotPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');
    setMessage('');

    if (!email) {
      setError('Email wajib diisi');
      return;
    }

    const result = await forgotPassword(email);

    if (result.success) {
      setMessage('Link reset password berhasil dikirim. Cek inbox/spam email kamu.');
    } else {
      setError(result.error || 'Gagal mengirim link reset password. Coba lagi nanti.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4">

      <div className="w-full max-w-sm">

        <h1 className="text-3xl font-bold text-white mb-3">
          Lupa Password
        </h1>

        <p className="text-zinc-400 mb-6">
          Masukkan email akun kamu untuk reset password.
        </p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 py-3 text-white"
        />

        {error && (
          <p className="text-red-400 text-sm mt-2">
            {error}
          </p>
        )}

        {message && (
          <p className="text-green-400 text-sm mt-2">
            {message}
          </p>
        )}

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="w-full bg-violet-500 hover:bg-violet-600 text-white py-3 rounded-xl mt-5"
        >
          {isLoading ? 'Loading...' : 'Kirim Link Reset'}
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-3 text-zinc-400 hover:text-white text-sm"
        >
          Kembali ke Login
        </button>

      </div>

    </div>
  );
}