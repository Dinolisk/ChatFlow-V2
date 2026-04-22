import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import Home from './components/Home';
import Header from './components/Header';
import { supabase } from './supabaseClient';
import './global.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('avatar');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/chat" />}
          />
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/chat" />}
          />

          <Route
            path="/chat"
            element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
