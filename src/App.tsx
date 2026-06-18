import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AdvancedMode from './components/AdvancedMode';
import AdvancedPortfolio from './components/AdvancedPortfolio';
import AIAnalysis from './components/AIAnalysis';
import BeginnerMode from './components/BeginnerMode';
import CacheMonitor from './components/CacheMonitor';
import Chart from './components/Chart';
import Home from './components/Home';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Portfolio from './components/Portfolio';
import Profile from './components/Profile';
import Screener from './components/Screener';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.isAdmin;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return element;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/screener" element={<Screener />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/chart" element={<Chart />} />
              <Route path="/ai-analysis" element={<AIAnalysis />} />
              <Route path="/advanced-portfolio" element={<AdvancedPortfolio />} />
              <Route path="/beginner-mode" element={<BeginnerMode />} />
              <Route path="/advanced-mode" element={<AdvancedMode />} />
              <Route path="/cache-status" element={<AdminRoute element={<CacheMonitor />} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
