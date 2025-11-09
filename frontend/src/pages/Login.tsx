import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
}

function Login({ setIsLoggedIn }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleOk = () => {
    console.log("Email entered:", email);
    setShowForgot(false); // close modal
    setEmail(""); // reset input
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple login logic - replace with actual authentication
    if (username && password) {
      setIsLoggedIn(true);
      navigate('/');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

      <p onClick={() => setShowForgot(true)} id="forgot-password">Forgot Password?</p>

      {showForgot && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px" }}>
            <h3>Forgot Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #abaaaaff',
                borderRadius: '4px',
                boxSizing: 'border-box'}}
            />
            <button onClick={handleOk} className='submit-button' style={{
              margin: '1rem'
            }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
