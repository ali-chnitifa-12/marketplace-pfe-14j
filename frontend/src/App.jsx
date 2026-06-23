import { useContext, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateAnnonce from './pages/CreateAnnonce';
import AnnonceDetails from './pages/AnnonceDetails';
import Profile from './pages/Profile';
import About from './pages/About';
import ChatbotWidget from './components/ChatbotWidget';
import { ThemeProvider } from './context/ThemeContext';

/* ─── Shooting Star Component ─── */
function ShootingStars() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const spawnStar = () => {
      const star = document.createElement('div');
      star.style.cssText = `
        position: fixed;
        top: ${Math.random() * 60}%;
        left: ${Math.random() * 80}%;
        width: 3px; height: 3px;
        border-radius: 50%;
        background: white;
        pointer-events: none;
        z-index: 1;
        animation: shoot ${1.2 + Math.random() * 0.8}s ease-out forwards;
      `;

      // Tail
      const tail = document.createElement('div');
      tail.style.cssText = `
        position: absolute;
        top: 50%; left: 50%;
        width: ${80 + Math.random() * 120}px;
        height: 1px;
        background: linear-gradient(90deg, rgba(255,255,255,0.8) 0%, transparent 100%);
        transform: translate(-100%, -50%) rotate(0deg);
        transform-origin: right center;
      `;
      star.appendChild(tail);
      container.appendChild(star);
      setTimeout(() => star.remove(), 2200);
    };

    // Initial shoots
    setTimeout(() => spawnStar(), 800);
    setTimeout(() => spawnStar(), 3000);

    // Recurring spawns
    const interval = setInterval(() => {
      if (Math.random() > 0.3) spawnStar();
    }, 2500 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  return <div ref={containerRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }} />;
}

/* ─── Route Guards ─── */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

/* ─── Premium Loading Screen ─── */
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#050816',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Starfield on loader too */}
      <div className="stars-layer" />
      <div className="stars-large" />
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.05)',
          borderTop: '2px solid #f97316',
          borderRight: '2px solid #14b8a6',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '8px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.03)',
          borderBottom: '2px solid #a78bfa',
          animation: 'spin 1.2s linear infinite reverse',
        }} />
      </div>
      <span style={{ color: '#475569', fontSize: '13px', fontWeight: '500', letterSpacing: '0.05em' }}>
        Chargement...
      </span>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* ⭐ Global Starfield — visible on ALL pages */}
        <div className="stars-layer" />
        <div className="stars-large" />
        <ShootingStars />

        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/admin" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />
            <Route path="/create-annonce" element={
              <PrivateRoute><CreateAnnonce /></PrivateRoute>
            } />
            <Route path="/annonce/:id" element={
              <PrivateRoute><AnnonceDetails /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />
            <Route path="/about" element={
              <PrivateRoute><About /></PrivateRoute>
            } />
            <Route path="/" element={
              <PrivateRoute><Home /></PrivateRoute>
            } />
          </Routes>
          <ChatbotWidget />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
