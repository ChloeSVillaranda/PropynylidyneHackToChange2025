import './App.css';

import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { AppThemeProvider } from "./theme";
import Header from './components/Header';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManageDrones from './pages/ManageDrones';
import ManageMissions from './pages/ManageMissions';
import Settings from './pages/Settings';
import ViewDrones from './pages/ViewDrones';
import { useEffect, useState } from 'react';
import { UserRole } from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return null;
      const parsed = JSON.parse(stored) as { role?: UserRole };
      return parsed?.role ?? null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored) as { role?: UserRole };
        setUserRole(parsed?.role ?? null);
      }
    } catch {
      setUserRole(null);
    }
  }, [isLoggedIn]);

  return (
    <AppThemeProvider>
      <Router>
        <div className="App">
          <Header
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            setIsLoggedIn={setIsLoggedIn}
            setUserRole={setUserRole}
          />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} />
            <Route path="/settings" element={isLoggedIn && userRole === 'admin' ? <Settings /> : <Navigate to="/login" replace />} />
            <Route
              path="/manage-drones"
              element={isLoggedIn && userRole === 'admin' ? <ManageDrones /> : <Navigate to="/view-drones" replace />}
            />
            <Route
              path="/manage-missions"
              element={isLoggedIn && userRole === 'admin' ? <ManageMissions /> : <Navigate to="/" replace />}
            />
            <Route path="/view-drones" element={<ViewDrones />} />
          </Routes>
        </div>
      </Router>
    </AppThemeProvider>
  );
}

export default App;
