import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import Home from './components/Home';
import Header from './components/Header';
import { supabase } from './supabaseClient';
import './global.css';

function AppShell({ isAuthenticated, setIsAuthenticated, handleLogout }) {
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  return (
    <div className="App">
      <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />

      <main className={`app-main${isChat ? '' : ' app-main--scroll'}`}>
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
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // När användaren bekräftar sin e-post skapas en session automatiskt.
      // Vi loggar ut dem direkt så de får logga in manuellt istället.
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && !session.user.is_anonymous) {
        const isNewConfirmation = !localStorage.getItem('hasLoggedInBefore_' + session.user.id);
        if (isNewConfirmation) {
          localStorage.setItem('hasLoggedInBefore_' + session.user.id, 'true');
          supabase.auth.signOut();
          window.location.href = '/login?confirmed=true';
          return;
        }
      }
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
      <AppShell
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
