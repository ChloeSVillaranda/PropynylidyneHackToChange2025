import { Link } from 'react-router-dom';
import '../index.css';

interface HeaderProps {
  isLoggedIn: boolean;
}

function Header({ isLoggedIn }: HeaderProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '2rem', paddingRight: '2rem', backgroundColor: 'var(--main-dark-blue)', color: 'white' }}>
      <h2>My Dashboard</h2>
      <nav style={{ display: 'flex', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', paddingRight: '2rem'}} className='nav-button'>
              Drone Map
            </Link>
            <Link to="/manage-missions" style={{ color: 'white', textDecoration: 'none', paddingRight: '2rem'}} className='nav-button'>
              Manage Missions
            </Link>
            <Link to="/manage-drones" style={{ color: 'white', textDecoration: 'none', paddingRight: '2rem'}} className='nav-button'>
              Manage Drones
            </Link>
            <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }} className='nav-button'>
              Settings
            </Link>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none'}} className='nav-button'>
            Admin Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
