import './App.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Login from './pages/Login';
import Settings from './pages/Settings';
import { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
