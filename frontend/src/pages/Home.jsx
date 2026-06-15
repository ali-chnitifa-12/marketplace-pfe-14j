import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const navRef = useRef(null);
  const heroRef = useRef(null);
  const welcomeRef = useRef(null);
  const nameRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);
  const actionsRef = useRef([]);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const orb4Ref = useRef(null);
  const avatarRef = useRef(null);
  const avatarGlowRef = useRef(null);

  // Redirect admin to /admin
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Orb floating
      gsap.to(orb1Ref.current, { x: 60, y: -40, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -50, y: 50, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      gsap.to(orb3Ref.current, { x: 40, y: 30, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
      gsap.to(orb4Ref.current, { x: -30, y: -50, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });

      // Nav slide down
      gsap.fromTo(navRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Avatar entrance
      gsap.fromTo(avatarRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, delay: 0.3, ease: 'elastic.out(1, 0.5)' }
      );

      // Avatar glow pulse
      gsap.to(avatarGlowRef.current, {
        scale: 1.3, opacity: 0, duration: 2, ease: 'power2.out', repeat: -1, repeatDelay: 1
      });

      // Welcome text
      gsap.fromTo(welcomeRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.5, ease: 'power3.out' }
      );

      // Name text with color shift
      gsap.fromTo(nameRef.current,
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.9, delay: 0.7, ease: 'back.out(1.5)' }
      );

      // Subtitle
      gsap.fromTo(subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.9, ease: 'power2.out' }
      );

      // Cards stagger
      gsap.fromTo(cardsRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, delay: 1.1, ease: 'back.out(1.5)' }
      );

      // Action buttons stagger
      gsap.fromTo(actionsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 1.6, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    gsap.to(containerRef.current, {
      opacity: 0, y: -20, duration: 0.4, ease: 'power2.in',
      onComplete: () => {
        logout();
        navigate('/login');
      }
    });
  };

  const addToCards = (el) => {
    if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
  };

  const addToActions = (el) => {
    if (el && !actionsRef.current.includes(el)) actionsRef.current.push(el);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const quickStats = [
    { icon: '📦', label: 'Mes Annonces', value: '—', color: '#f97316', desc: 'Bientôt disponible' },
    { icon: '🛒', label: 'Mes Commandes', value: '—', color: '#14b8a6', desc: 'Bientôt disponible' },
    { icon: '💬', label: 'Négociations', value: '—', color: '#a78bfa', desc: 'Bientôt disponible' },
    { icon: '🔔', label: 'Alertes', value: '—', color: '#eab308', desc: 'Bientôt disponible' },
  ];

  const quickActions = [
    { icon: '➕', label: 'Publier une annonce', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
    { icon: '🔍', label: 'Explorer le catalogue', color: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
    { icon: '📍', label: 'Recherche par zone', color: '#a78bfa', gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  ];

  if (user?.role === 'admin') return null;

  return (
    <div ref={containerRef} className="home-page">
      {/* Background effects */}
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div ref={orb3Ref} className="orb orb-3" />
      <div ref={orb4Ref} className="orb orb-4" />
      <div className="grid-bg" />

      {/* Navigation Bar */}
      <nav ref={navRef} className="top-nav">
        <div className="nav-left">
          <span className="nav-logo-icon">📍</span>
          <span className="nav-logo-text">Marketplace PFE</span>
        </div>
        <div className="nav-right">
          <div className="nav-user-pill">
            <div className="nav-user-avatar">{getInitials(user?.nom)}</div>
            <span className="nav-user-name">{user?.nom || 'Utilisateur'}</span>
          </div>
          <button onClick={handleLogout} className="nav-logout-btn">
            <span>⏻</span> Déconnexion
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-main">
        {/* Hero Section */}
        <section ref={heroRef} className="hero-section">
          <div className="avatar-container">
            <div ref={avatarGlowRef} className="avatar-glow" />
            <div ref={avatarRef} className="hero-avatar">
              {getInitials(user?.nom)}
            </div>
          </div>

          <p ref={welcomeRef} className="welcome-label">{getGreeting()} 👋</p>
          <h1 ref={nameRef} className="welcome-name">
            Bienvenue, <span className="name-gradient">{user?.nom || 'Utilisateur'}</span>
          </h1>
          <p ref={subtitleRef} className="welcome-subtitle">
            Ton espace personnel sur Marketplace PFE — explore, vends et achète en toute confiance
          </p>
        </section>

        {/* Quick Stats */}
        <section className="stats-section">
          <h2 className="section-title">
            <span className="section-icon">📊</span> Tableau de bord rapide
          </h2>
          <div className="stats-grid">
            {quickStats.map((stat, i) => (
              <div
                ref={addToCards}
                key={i}
                className="stat-card"
                style={{ '--accent': stat.color }}
              >
                <div className="stat-icon-wrapper" style={{ background: `${stat.color}15` }}>
                  <span className="stat-icon">{stat.icon}</span>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
                <span className="stat-desc">{stat.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <h2 className="section-title">
            <span className="section-icon">⚡</span> Actions rapides
          </h2>
          <div className="actions-grid">
            {quickActions.map((action, i) => (
              <button
                ref={addToActions}
                key={i}
                className="action-card"
                style={{ '--accent': action.color }}
              >
                <div className="action-icon-circle" style={{ background: action.gradient }}>
                  <span>{action.icon}</span>
                </div>
                <span className="action-label">{action.label}</span>
                <span className="action-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* Info Banner */}
        <section className="info-banner">
          <div className="info-icon">🚀</div>
          <div className="info-content">
            <h3>La marketplace prend forme !</h3>
            <p>Les modules sont en cours de développement par l'équipe. Les annonces, commandes, et enchères seront bientôt disponibles.</p>
          </div>
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .home-page {
          min-height: 100vh;
          background: #050816;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* ─── Background ─── */
        .grid-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }
        .orb {
          position: fixed; border-radius: 50%;
          filter: blur(100px); pointer-events: none; z-index: 0;
        }
        .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%); top: -200px; left: -150px; }
        .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%); bottom: -150px; right: -100px; }
        .orb-3 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%); top: 40%; right: 20%; }
        .orb-4 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(234,179,8,0.1) 0%, transparent 70%); bottom: 30%; left: 10%; }

        /* ─── Navigation ─── */
        .top-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 40px;
          background: rgba(5,8,22,0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-left { display: flex; align-items: center; gap: 10px; }
        .nav-logo-icon { font-size: 22px; }
        .nav-logo-text {
          font-size: 16px; font-weight: 800;
          background: linear-gradient(135deg, #f97316, #14b8a6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .nav-user-pill {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px; padding: 6px 16px 6px 6px;
        }
        .nav-user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #14b8a6);
          color: white; font-size: 13px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-user-name { font-size: 13px; color: #cbd5e1; font-weight: 600; }
        .nav-logout-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 8px 16px;
          color: #fca5a5; font-size: 13px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer; transition: all 0.3s;
        }
        .nav-logout-btn:hover {
          background: rgba(239,68,68,0.2);
          border-color: rgba(239,68,68,0.4);
          color: #fecaca;
        }

        /* ─── Main Content ─── */
        .home-main {
          position: relative; z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 100px 24px 60px;
        }

        /* ─── Hero Section ─── */
        .hero-section {
          text-align: center;
          padding: 40px 0 50px;
        }
        .avatar-container {
          position: relative;
          display: inline-block;
          margin-bottom: 28px;
        }
        .avatar-glow {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(249,115,22,0.4), rgba(20,184,166,0.4));
          z-index: 0;
        }
        .hero-avatar {
          position: relative; z-index: 1;
          width: 96px; height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #14b8a6);
          color: white;
          font-size: 36px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(249,115,22,0.3);
          border: 3px solid rgba(255,255,255,0.1);
        }
        .welcome-label {
          font-size: 16px; color: #94a3b8; font-weight: 500;
          margin-bottom: 8px; letter-spacing: 0.02em;
        }
        .welcome-name {
          font-size: 42px; font-weight: 900; color: #f1f5f9;
          line-height: 1.15; margin-bottom: 14px;
        }
        .name-gradient {
          background: linear-gradient(135deg, #f97316 0%, #fb923c 30%, #14b8a6 70%, #2dd4bf 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shimmer 4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
        .welcome-subtitle {
          font-size: 15px; color: #64748b; max-width: 500px;
          margin: 0 auto; line-height: 1.7;
        }

        /* ─── Section Titles ─── */
        .section-title {
          display: flex; align-items: center; gap: 10px;
          font-size: 18px; font-weight: 700; color: #e2e8f0;
          margin-bottom: 20px;
        }
        .section-icon { font-size: 20px; }

        /* ─── Stats Grid ─── */
        .stats-section { margin-bottom: 40px; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 22px;
          transition: all 0.3s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .stat-card:hover::before { opacity: 1; }
        .stat-icon-wrapper {
          width: 44px; height: 44px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .stat-icon { font-size: 20px; }
        .stat-info { display: flex; flex-direction: column; gap: 2px; }
        .stat-value { font-size: 24px; font-weight: 800; color: #f1f5f9; }
        .stat-label { font-size: 13px; color: #94a3b8; font-weight: 500; }
        .stat-desc {
          display: block; margin-top: 10px;
          font-size: 11px; color: #475569;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }

        /* ─── Actions ─── */
        .actions-section { margin-bottom: 40px; }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .action-card {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 18px 20px;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Inter', sans-serif;
          text-align: left;
        }
        .action-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }
        .action-icon-circle {
          width: 42px; height: 42px; min-width: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .action-label {
          font-size: 14px; font-weight: 600; color: #e2e8f0;
          flex: 1;
        }
        .action-arrow {
          font-size: 16px; color: #475569;
          transition: transform 0.3s, color 0.3s;
        }
        .action-card:hover .action-arrow {
          transform: translateX(4px);
          color: #94a3b8;
        }

        /* ─── Info Banner ─── */
        .info-banner {
          display: flex; align-items: flex-start; gap: 16px;
          background: rgba(20,184,166,0.06);
          border: 1px solid rgba(20,184,166,0.12);
          border-radius: 18px;
          padding: 22px 26px;
        }
        .info-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
        .info-content h3 {
          font-size: 15px; font-weight: 700; color: #5eead4; margin-bottom: 6px;
        }
        .info-content p {
          font-size: 13px; color: #64748b; line-height: 1.7;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .top-nav { padding: 14px 20px; }
          .nav-user-name { display: none; }
          .home-main { padding: 90px 16px 40px; }
          .welcome-name { font-size: 28px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .actions-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .welcome-name { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
