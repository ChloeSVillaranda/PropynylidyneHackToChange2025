import { Link } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
}

function Header({ isLoggedIn }: HeaderProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#333', color: 'white' }}>
      <h1>My Dashboard</h1>
      <nav style={{ display: 'flex', alignItems: 'center' }}>
        {isLoggedIn ? (
          <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>
            Settings
          </Link>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
