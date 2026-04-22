import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Login.css';

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const registerNote = location.state?.message;
  const emailConfirmed = new URLSearchParams(location.search).get('confirmed') === 'true';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        navigate('/chat');
      }
    });
  }, [setIsAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      const msg =
        signInError.message === 'Invalid login credentials'
          ? 'Fel e-post eller lösenord.'
          : signInError.message;
      setError(msg);
      return;
    }

    const user = data.user;
    const meta = user?.user_metadata ?? {};
    const displayName = meta.username || user?.email?.split('@')[0] || 'användare';
    const avatarUrl = meta.avatar_url || 'https://i.pravatar.cc/100';

    localStorage.setItem('username', displayName);
    localStorage.setItem('avatar', avatarUrl);
    if (user?.id) localStorage.setItem('userId', user.id);

    setIsAuthenticated(true);
    navigate('/chat');
  };

  return (
    <div className="page-container login-page">
      <div className="form-container">
        <h2>Login to ChatFlow</h2>
        {emailConfirmed && <p className="msg-success">E-posten bekräftad! Logga in med dina uppgifter.</p>}
        {registerNote && <p className="msg-success">{registerNote}</p>}
        {error && <p className="msg-error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-post"
              className="form-control"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-control"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="shared-btn">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
