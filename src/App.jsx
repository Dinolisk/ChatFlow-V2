import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import Home from './components/Home';
import Header from './components/Header';  // Import Header component
import './global.css'; // Import your global styles

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kontrollera token i localStorage vid sidladdning
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    // Kontrollera om token finns och om den är giltig
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Hantera utloggning och rensa all användardata
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('avatar');
    setIsAuthenticated(false);
    window.location.href = '/login';  // Omdirigera till inloggningssidan efter utloggning
  };

  return (
    <Router>
      <div className="App">
        {/* Lägg till Header på alla sidor */}
        <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />

        <Routes>
          {/* Hem-sida: Tillgänglig för alla */}
          <Route path="/" element={<Home />} />

          {/* Registrering */}
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/chat" />}
          />

          {/* Inloggning */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/chat" />}
          />

          {/* Skyddad chat-sida */}
          <Route
            path="/chat"
            element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
          />

          {/* Omdirigera okända routes till Hem */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
