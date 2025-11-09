import './App.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppThemeProvider } from "./theme";
import Header from './components/Header';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManageDrones from './pages/ManageDrones';
import ManageMissions from './pages/ManageMissions';
import Settings from './pages/Settings';
import ViewDrones from './pages/ViewDrones';
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AppThemeProvider>
      <Router>
        <div className="App">
          <Header isLoggedIn={isLoggedIn} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/manage-drones" element={<ManageDrones />} />
            <Route path="/manage-missions" element={<ManageMissions />} />
            <Route path="/view-drones" element={<ViewDrones />} />
          </Routes>
        </div>
      </Router>
    </AppThemeProvider>
  );
}

export default App;
