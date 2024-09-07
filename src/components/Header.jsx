import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ isAuthenticated, handleLogout }) => {
    const location = useLocation(); // Get current route

    return (
        <header className="header">
            {isAuthenticated && location.pathname === '/chat' && (
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            )}
            {/* Conditionally render the title based on the current page */}
            {location.pathname === '/chat' ? (
                <h1>Welcome to the Chatroom</h1>
            ) : (
                <Link to="/" className="navbar-home-link">Home</Link>
            )}
        </header>
    );
};

export default Header;
