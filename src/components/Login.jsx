import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';  // Import the CSS file for Login page

export default function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://chatify-api.up.railway.app/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);  // Store token in localStorage
        setIsAuthenticated(true);
        navigate('/chat');  // Redirect to chat after successful login
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Error logging in');
    }
  };

  return (
    <div className="page-container login-page"> {/* Added login-page class */}
      <div className="form-container">
        <h2>Login to ChatFlow</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-control"
            />
          </div>
          <button type="submit" className="shared-btn">Log In</button>
        </form>
      </div>
    </div>
  );
}
