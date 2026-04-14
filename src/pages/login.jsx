// TODO: Import useState from React
// TODO: Import useAuthStore
// TODO: Buat & export Login component
// TODO: Atur local state variables buat input email & password
// TODO: Buat handler untuk form yang memanggil login function dari useAuthStore
// TODO: Return JSX

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { loginUser, registerUser, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isRegister) {
      await registerUser(email, password)
    } else {
      await loginUser(email, password)
    }

    // Kalau berhasil (tidak ada error), redirect ke dashboard
    const { currUser } = useAuthStore.getState()
    if (currUser) navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tel-Talk</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isRegister ? 'Buat akun baru' : 'Selamat datang kembali'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#16161f] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600
                  focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600
                  focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed
                text-white text-sm font-semibold py-3 rounded-xl transition-all duration-200 mt-2
                shadow-lg shadow-violet-900/30"
            >
              {isLoading
                ? 'Loading...'
                : isRegister
                ? 'Daftar'
                : 'Masuk'}
            </button>
          </form>

          {/* Toggle login / register */}
          <p className="text-center text-xs text-zinc-500 mt-6">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              {isRegister ? 'Masuk' : 'Daftar'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}