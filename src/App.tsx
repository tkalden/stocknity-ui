import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import AdvancedPortfolio from './components/AdvancedPortfolio';
import AIAnalysis from './components/AIAnalysis';
import CacheMonitor from './components/CacheMonitor';
import Chart from './components/Chart';
import Home from './components/Home';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Portfolio from './components/Portfolio';
import Profile from './components/Profile';
import Screener from './components/Screener';
import Signup from './components/Signup';
import { AuthProvider } from './context/AuthContext';

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
              <Route path="/cache-status" element={<CacheMonitor />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
