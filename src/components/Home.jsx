import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInAsGuest } from '../guestLogin';

function Home() {
  const navigate = useNavigate();
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState('');

  const handleGuestLogin = async () => {
    setGuestError('');
    setGuestLoading(true);
    try {
      await signInAsGuest();
      navigate('/chat');
    } catch (err) {
      setGuestError(err.message || 'Kunde inte starta gästläge. Skapa ett konto eller logga in.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container home-card">
        <div className="home-logo">💬</div>
        <h2>ChatFlow</h2>
        <p className="home-tagline">Din smarta chattupplevelse — driven av AI.</p>

        <ul className="home-features">
          <li>
            <span className="feature-icon">🔐</span>
            <span>Skapa ett konto på sekunder</span>
          </li>
          <li>
            <span className="feature-icon">💬</span>
            <span>Chatta i realtid</span>
          </li>
          <li>
            <span className="feature-icon">🤖</span>
            <span>Få svar från vår AI-bot Patrik</span>
          </li>
        </ul>

        {guestError && <p className="msg-error">{guestError}</p>}

        <div className="auth-links">
          <Link className="shared-btn" to="/register">Skapa konto</Link>
          <Link className="shared-btn btn-secondary" to="/login">Logga in</Link>
          <button
            type="button"
            className="shared-btn"
            onClick={handleGuestLogin}
            disabled={guestLoading}
          >
            {guestLoading ? 'Startar…' : 'Prova som gäst'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
