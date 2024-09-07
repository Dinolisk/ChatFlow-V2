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

  // Check for token in localStorage on initial render
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        {/* Add Header on all pages */}
        <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />


        <Routes>
          {/* Home Route: Accessible to all */}
          <Route path="/" element={<Home />} />

          {/* Registration Page */}
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/chat" />}
          />

          {/* Login Page */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/chat" />}
          />

          {/* Protected Chat Page */}
          <Route
            path="/chat"
            element={isAuthenticated ? <Chat setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />}
          />

          {/* Redirect any unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
