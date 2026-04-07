import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css'; 

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Kolla om lösenorden stämmer med varandra
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validera input
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      console.log('Attempting to register:', { username, email }); // Debug logging
      
      const response = await fetch('https://chatify-api.up.railway.app/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log('Registration response status:', response.status); // Debug logging
      console.log('Registration response ok:', response.ok); // Debug logging

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data); // Debug logging
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Registration error:', errorData); // Debug logging
        
        // Mer specifika felmeddelanden
        if (response.status === 409) {
          setError('Username or email already exists');
        } else if (response.status === 400) {
          setError(errorData.message || 'Invalid input data');
        } else if (response.status === 500) {
          setError('Server error. Please try again later');
        } else {
          setError('Registration failed. Please try again');
        }
      }
    } catch (err) {
      console.error('Registration error:', err); // Debug logging
      setError('Network error. Please check your connection');
    }
  };

  return (
    <div className="page-container register-page">
      <div className="form-container">
        <h2>Register</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <button type="submit" className="shared-btn">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
