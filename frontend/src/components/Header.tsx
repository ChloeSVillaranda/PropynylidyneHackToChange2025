import { Link } from 'react-router-dom';
import '../index.css';

interface HeaderProps {
  isLoggedIn: boolean;
}

function Header({ isLoggedIn }: HeaderProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '2rem', paddingRight: '2rem', backgroundColor: 'var(--main-dark-blue)', color: 'white' }}>
      <h1>My Dashboard</h1>
      <nav style={{ display: 'flex', alignItems: 'center' }}>
        {isLoggedIn ? (
          <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>
            Settings
          </Link>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none'}} className='login-button'>
            Admin Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
