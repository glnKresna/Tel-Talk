import { useEffect, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import Landing from './pages/landing';
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import VerifyEmail from './pages/verifyEmail';

// Komponen wrapper buat route yang butuh login
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currUser, isLoading, reloadUser } = useAuthStore()

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Kalau user login tapi belum verifikasi email, cek statusnya setiap 3 detik
    if (currUser && !currUser.emailVerified) {
      interval = setInterval(() => {
        reloadUser();
      }, 3000);
    }

    // Hilangkan interval saat user logout atau sudah verifikasi email
    return () => clearInterval(interval);
  }, [currUser, reloadUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f14]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currUser) {
    return <Navigate to="/landing" replace />
  }

  if (!currUser.emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return <>{children}</>
}

export default function App() {
  const { cekAuthState } = useAuthStore()

  // Pantau status auth dari Firebase saat app pertama kali mount
  useEffect(() => {
    const unsubscribe = cekAuthState()
    return unsubscribe
  }, [cekAuthState])

  return (
    <Routes>
      {/* Public route */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      {/* Protected route — harus login dulu */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback: redirect ke home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
