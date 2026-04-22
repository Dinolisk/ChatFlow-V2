import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
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

        <div className="auth-links">
          <Link className="shared-btn" to="/register">Skapa konto</Link>
          <Link className="shared-btn btn-secondary" to="/login">Logga in</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
