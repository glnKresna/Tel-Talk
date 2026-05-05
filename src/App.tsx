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
  const { currUser, isLoading } = useAuthStore()

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
