import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    axios.get('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setUser(res.data); // now includes role, isBanned
    })
    .catch(err => {
      console.error('Invalid token', err);
      localStorage.removeItem('token');
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const login = async (email, motDePasse) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, motDePasse });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user); // includes role
    return res.data.user;
  };

  const register = async (nom, email, motDePasse, typeCompte) => {
    const res = await axios.post('http://localhost:5000/api/auth/register', { nom, email, motDePasse, typeCompte });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user); // includes role and typeCompte
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
