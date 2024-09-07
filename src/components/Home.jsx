import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="text-center">Welcome to ChatFlow</h2>
        <p className="text-center">Please log in or register to continue.</p>

        <div className="auth-links">
          <Link className="shared-btn" to="/login">Log In</Link>
          <Link className="shared-btn" to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
