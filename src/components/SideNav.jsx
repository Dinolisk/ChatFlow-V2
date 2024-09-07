import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SideNav({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('authToken');
    
    // Update the authentication state
    setIsAuthenticated(false);
    
    // Redirect to the home page ("/")
    navigate('/');
  };

  return (
    <div className="sidenav">
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
