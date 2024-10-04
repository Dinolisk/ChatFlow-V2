import { Link, useLocation } from 'react-router-dom';

const Header = ({ isAuthenticated, handleLogout }) => {
    const location = useLocation();

    return (
        <header className="header">
            {isAuthenticated && location.pathname === '/chat' && (
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            )}
            {location.pathname === '/chat' ? (
                <h1>Welcome to ChatFlow</h1>
            ) : (
                <Link to="/" className="navbar-home-link">Home</Link>
            )}
        </header>
    );
};

export default Header;