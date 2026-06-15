import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: 40, y: -30, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -50, y: 40, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });

      gsap.fromTo(cardRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.5)' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    gsap.to(cardRef.current, { scale: 0.95, opacity: 0, duration: 0.4, ease: 'power2.in' });
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 400);
  };

  return (
    <div ref={containerRef} className="admin-placeholder-page">
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div className="grid-bg" />

      <div ref={cardRef} className="admin-placeholder-card">
        <div className="admin-logo-area">
          <span className="admin-logo-icon">🛡️</span>
          <span className="admin-logo-text">Admin Panel</span>
        </div>

        <div className="admin-avatar">
          {user?.nom ? user.nom.charAt(0).toUpperCase() : 'A'}
        </div>

        <h1 className="admin-title">
          Bienvenue, <span className="admin-name">{user?.nom || 'Admin'}</span>
        </h1>
        <p className="admin-role-badge">👑 Administrateur</p>

        <div className="admin-notice">
          <span className="notice-icon">🚧</span>
          <div>
            <h3>Dashboard en cours de développement</h3>
            <p>L'Étudiant 7 prendra le relais pour implémenter le Dashboard Admin complet avec la gestion des utilisateurs, la modération des annonces et les statistiques.</p>
          </div>
        </div>

        <div className="admin-api-info">
          <h4>✅ API Backend prête</h4>
          <div className="api-list">
            <div className="api-item"><span className="api-method get">GET</span> <code>/api/admin/users</code></div>
            <div className="api-item"><span className="api-method get">GET</span> <code>/api/admin/stats</code></div>
            <div className="api-item"><span className="api-method put">PUT</span> <code>/api/admin/users/:id/role</code></div>
            <div className="api-item"><span className="api-method put">PUT</span> <code>/api/admin/users/:id/ban</code></div>
            <div className="api-item"><span className="api-method del">DEL</span> <code>/api/admin/users/:id</code></div>
          </div>
        </div>

        <button onClick={handleLogout} className="admin-logout-btn">
          ⏻ Déconnexion
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-placeholder-page {
          min-height: 100vh;
          background: #050816;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif;
          overflow: hidden; position: relative; padding: 20px;
        }
        .grid-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(167,139,250,0.1) 1px, transparent 1px);
          background-size: 30px 30px; pointer-events: none;
        }
        .orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%); top: -120px; left: -80px; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%); bottom: -100px; right: -60px; }

        .admin-placeholder-card {
          position: relative; z-index: 10;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 48px;
          width: 100%; max-width: 520px;
          box-shadow: 0 0 0 1px rgba(167,139,250,0.12), 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          text-align: center;
        }

        .admin-logo-area { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; }
        .admin-logo-icon { font-size: 26px; }
        .admin-logo-text { font-size: 16px; font-weight: 800; background: linear-gradient(135deg, #a78bfa, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .admin-avatar {
          width: 80px; height: 80px; margin: 0 auto 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          color: white; font-size: 32px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(167,139,250,0.4);
          border: 3px solid rgba(255,255,255,0.1);
        }

        .admin-title { font-size: 26px; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }
        .admin-name { color: #c4b5fd; }
        .admin-role-badge {
          display: inline-block;
          background: rgba(167,139,250,0.12);
          border: 1px solid rgba(167,139,250,0.25);
          color: #c4b5fd; font-size: 13px; font-weight: 600;
          padding: 5px 16px; border-radius: 100px;
          margin-bottom: 28px;
        }

        .admin-notice {
          display: flex; align-items: flex-start; gap: 14px;
          background: rgba(234,179,8,0.06);
          border: 1px solid rgba(234,179,8,0.15);
          border-radius: 16px;
          padding: 18px 20px;
          text-align: left;
          margin-bottom: 24px;
        }
        .notice-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
        .admin-notice h3 { font-size: 14px; font-weight: 700; color: #fbbf24; margin-bottom: 6px; }
        .admin-notice p { font-size: 12px; color: #64748b; line-height: 1.6; }

        .admin-api-info {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px 20px;
          text-align: left;
          margin-bottom: 28px;
        }
        .admin-api-info h4 { font-size: 13px; font-weight: 700; color: #34d399; margin-bottom: 14px; }
        .api-list { display: flex; flex-direction: column; gap: 8px; }
        .api-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: #94a3b8;
        }
        .api-item code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background: rgba(255,255,255,0.04);
          padding: 3px 8px; border-radius: 6px;
          font-size: 11px; color: #cbd5e1;
        }
        .api-method {
          font-size: 10px; font-weight: 800;
          padding: 2px 8px; border-radius: 4px;
          text-transform: uppercase; min-width: 36px; text-align: center;
        }
        .api-method.get { background: rgba(20,184,166,0.15); color: #14b8a6; }
        .api-method.put { background: rgba(249,115,22,0.15); color: #f97316; }
        .api-method.del { background: rgba(239,68,68,0.15); color: #ef4444; }

        .admin-logout-btn {
          width: 100%; padding: 14px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 14px; cursor: pointer;
          color: #fca5a5; font-size: 14px; font-weight: 700;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s;
        }
        .admin-logout-btn:hover {
          background: rgba(239,68,68,0.2);
          border-color: rgba(239,68,68,0.4);
        }
      `}</style>
    </div>
  );
}
