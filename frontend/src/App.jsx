import { useContext } from 'react';
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


const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050816',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '500' }}>Chargement...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050816',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '500' }}>Chargement...</div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  
  return children;
};

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/create-annonce" element={
              <PrivateRoute>
                <CreateAnnonce />
              </PrivateRoute>
            } />
            <Route path="/annonce/:id" element={
              <PrivateRoute>
                <AnnonceDetails />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/about" element={
              <PrivateRoute>
                <About />
              </PrivateRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
          </Routes>
          <ChatbotWidget />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
