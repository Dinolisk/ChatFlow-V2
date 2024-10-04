import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

export default function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Kontrollera om användaren redan är inloggad
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      navigate('/chat');
    }
  }, [setIsAuthenticated, navigate]);

  // Funktion för att dekodera JWT-token
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload); // Returnera den dekodade JSON payloaden
    } catch (error) {
      console.error('Fel vid dekodering av JWT-token:', error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const csrfToken = localStorage.getItem('csrfToken');
    try {
      const response = await fetch('https://chatify-api.up.railway.app/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          csrfToken: csrfToken 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setIsAuthenticated(true);

        console.log('Inloggning lyckades, authToken sparad:', data.token);

        // Dekoda JWT-token för att få användarinformationen
        const decodedJwt = decodeJwt(data.token);
        console.log('Dekodad JWT:', decodedJwt); 

        if (decodedJwt) {
          // Spara användarnamnet och avataren i localStorage
          localStorage.setItem('username', decodedJwt.user);
          localStorage.setItem('avatar', decodedJwt.avatar || 'https://i.pravatar.cc/100');
          
          navigate('/chat');
        } else {
          setError('Kunde inte dekoda användarinformation.');
        }
      } else {
        setError(data.message || 'Inloggning misslyckades');
        console.error('Inloggningsfel:', data);
      }
    } catch (error) {
      setError('Ett fel uppstod vid inloggning');
      console.error('Inloggningsfel:', error);
    }
  };

  return (
    <div className="page-container login-page">
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
              required
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
            />
          </div>
          <button type="submit" className="shared-btn">Log In</button>
        </form>
      </div>
    </div>
  );
}
