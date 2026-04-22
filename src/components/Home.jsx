import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page-container">
      <div className="form-container">
        <h2>ChatFlow</h2>
        <p className="home-subtitle">Logga in eller skapa ett konto för att starta.</p>
        <div className="auth-links">
          <Link className="shared-btn" to="/login">Logga in</Link>
          <Link className="shared-btn" to="/register" style={{ background: 'var(--surface-3)', color: 'var(--text)' }}>
            Skapa konto
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
