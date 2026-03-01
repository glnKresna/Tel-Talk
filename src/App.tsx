import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
// TODO: Import the Login and ChatDashboard page components
// TODO: Import useAuthStore (to check if someone is logged in)

// TODO: Create a 'ProtectedRoute' wrapper component here. 
// It should check the AuthStore. If no user is logged in, return <Navigate to="/login" />. 
// If they are logged in, return the child components.

export default function App() {
  // TODO: Add a useEffect hook here that calls the checkAuthState() function from useAuthStore when the app first loads

  return (
    // TODO: Set up the <Routes> container
    // TODO: Create a public <Route> for the Login page (path="/login")
    // TODO: Create a protected <Route> for the ChatDashboard (path="/"). Wrap its element in your ProtectedRoute component.
    
    <div className="text-center mt-20">
      {/* Remove this placeholder div once the Routes are built! */}
      <h1>Tel-Talk Router Placeholder</h1>
    </div>
  );
}