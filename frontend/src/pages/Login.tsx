import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { authService } from '../services/authService';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

function Login({ setIsLoggedIn }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === import.meta.env.VITE_TEST_EMAIL) {
      localStorage.setItem('authToken', import.meta.env.VITE_JWT_TOKEN);
      localStorage.setItem('user', JSON.stringify({ 
        email: import.meta.env.VITE_TEST_EMAIL,
        role: 'admin',
        name: 'Bob Marley'
      }));
      setIsLoggedIn(true);
      navigate('/');
      return;
    }

    setError('Invalid credentials');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Admin Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #abaaaaff',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #abaaaaff',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
        <button type="submit" className='submit-button'>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
