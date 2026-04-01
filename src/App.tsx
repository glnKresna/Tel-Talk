import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
// TODO: Import the Login and ChatDashboard page components
// TODO: Import useAuthStore (to check if someone is logged in)

// TODO: Create a 'ProtectedRoute' wrapper component here. 
// It should check the AuthStore. If no user is logged in, return <Navigate to="/login" />. 
// If they are logged in, return the child components.

export default function App() {
  useEffect(() => {
    const testChatbot = async() => {
      console.log("Hello... Test");

      try {
        const response = await fetch('api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({prompt: "Hello Gemini! I am building a new chat app. Respond with a short, funny greeting."}),
        });

        const data = await response.json();
        console.log("🤖 Gemini says:", data.reply);
      } catch (err) {
        console.error("Test error.")
      }
    };

    testChatbot();
  }, []);

  return (
    // TODO: Set up the <Routes> container
    // TODO: Create a public <Route> for the Login page (path="/login")
    // TODO: Create a protected <Route> for the ChatDashboard (path="/"). Wrap its element in your ProtectedRoute component.
    
    <div className="text-center mt-20">
      <h1>Router Placeholder</h1>
    </div>
  );
}