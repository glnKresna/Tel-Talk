// import { useState, useEffect } from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// TODO: Import the Login and ChatDashboard page components
// TODO: Import useAuthStore (to check if someone is logged in)

// TODO: Create a 'ProtectedRoute' wrapper component here. 
// It should check the AuthStore. If no user is logged in, return <Navigate to="/login" />. 
// If they are logged in, return the child components.

// export default function App() {
//   useEffect(() => {
//     const testChatbot = async() => {
//       console.log("Hello... Test");

//       try {
//         const response = await fetch('api/gemini', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({prompt: "Hello Gemini! I am building a new chat app. Respond with a short, funny greeting."}),
//         });

//         const data = await response.json();
//         console.log("🤖 Gemini says:", data.reply);
//       } catch (err) {
//         console.error("Test error.")
//       }
//     };

//     testChatbot();
//   }, []);

//   return (
//     // TODO: Set up the <Routes> container
//     // TODO: Create a public <Route> for the Login page (path="/login")
//     // TODO: Create a protected <Route> for the ChatDashboard (path="/"). Wrap its element in your ProtectedRoute component.
    
//     <div className="text-center mt-20">
//       <h1>Router Placeholder</h1>
//     </div>
//   );
// }

// import { useEffect } from 'react'
// import { Routes, Route, Navigate } from 'react-router-dom'
// import Login from './pages/login'
// import ChatDashboard from './pages/chatDashboard'
// import { useAuthStore } from './store/useAuthStore'

import { useEffect, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import Landing from './pages/landing';
import Login from './pages/login'
import ChatDashboard from './pages/chatDashboard'

// Komponen wrapper buat route yang butuh login
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currUser, isLoading, logoutUser, resendVerifikasi, reloadUser } = useAuthStore()

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
    return (
      <div className="min-h-screen bg-[#0f0f14] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mb-6 border border-violet-500/30">
          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Cek Email Kamu!</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Kami telah mengirimkan link verifikasi ke <span className="text-white font-medium">{currUser.email}</span>. 
          Silakan klik link tersebut untuk mengaktifkan akunmu.
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {/* NEW: Resend Button */}
          <button 
            onClick={() => resendVerifikasi()}
            className="w-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-sm font-medium py-3 rounded-xl transition-all"
          >
            Kirim Ulang Email
          </button>
          
          <button 
            onClick={() => logoutUser()}
            className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
          >
            Kembali ke halaman Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  const { cekAuthState } = useAuthStore()

  // Pantau status auth dari Firebase saat app pertama kali mount
  useEffect(() => {
    cekAuthState()
  }, [cekAuthState])

  return (
    <Routes>
      {/* Public route */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected route — harus login dulu */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback: redirect ke home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
