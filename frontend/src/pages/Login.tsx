import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { authService } from '../api';
import { UserRole } from '../types';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
  setUserRole: (role: UserRole | null) => void;
}

function Login({ setIsLoggedIn, setUserRole }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleOk = () => {
    console.log('Email entered:', forgotEmail);
    setShowForgot(false);
    setForgotEmail('');
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.login(email, password);
      setIsLoggedIn(true);
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored) as { role?: UserRole };
          setUserRole(parsed?.role ?? null);
        } else {
          setUserRole(null);
        }
      } catch (parseError) {
        console.warn('[Login] Failed to parse stored user', parseError);
        setUserRole(null);
      }
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Admin Login</h1>
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
            boxSizing: 'border-box',
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
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ color: '#b91c1c', margin: 0, fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Login'}
        </button>
      </form>

      <p onClick={() => setShowForgot(true)} id="forgot-password">
        Forgot Password?
      </p>

      {showForgot && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Forgot Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #abaaaaff',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleOk}
              className="submit-button"
              style={{
                margin: '1rem',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
