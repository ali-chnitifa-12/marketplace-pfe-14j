import React, { useEffect, useRef, useContext, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const { isLightMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
  const [minPrix, setMinPrix] = useState('');
  const [maxPrix, setMaxPrix] = useState('');

  const containerRef = useRef(null);
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const feedRef = useRef(null);
  const cardsRef = useRef([]);
  
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  // Redirect admin to /admin
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/annonces', {
        params: { search, categorie, minPrix, maxPrix }
      });
      setAnnonces(res.data);
    } catch (err) {
      console.error('Erreur lors du chargement des annonces', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnonces();
  }, [search, categorie, minPrix, maxPrix]);

  // Animate cards when they appear
  useEffect(() => {
    if (!loading && annonces.length > 0 && cardsRef.current.length > 0) {
      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { y: 50, opacity: 0, scale: 0.95 },
        { 
          y: 0, opacity: 1, scale: 1, 
          duration: 0.6, 
          stagger: 0.08, 
          ease: 'back.out(1.4)',
          clearProps: 'transform'
        }
      );
    }
  }, [loading, annonces]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background Orbs — more dynamic floating
      gsap.to(orb1Ref.current, { x: 80, y: -50, scale: 1.1, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -60, y: 60, scale: 0.9, duration: 10, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      gsap.to(orb3Ref.current, { x: 40, y: 40, scale: 1.15, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });

      // Nav Entrance — slide down with spring
      gsap.fromTo(navRef.current, 
        { y: -80, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }
      );
      
      // Header Entrance — scale up
      gsap.fromTo(headerRef.current, 
        { y: 40, opacity: 0, scale: 0.98 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.9, delay: 0.3, ease: 'power3.out' }
      );
      
      // Feed Entrance
      gsap.fromTo(feedRef.current, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLogout = () => {
    gsap.to(containerRef.current, {
      opacity: 0, y: -30, duration: 0.5, ease: 'power3.in',
      onComplete: () => {
        logout();
        navigate('/login');
      }
    });
  };

  // Card 3D tilt on hover
  const handleCardMouseMove = useCallback((e, index) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotationY: x * 12,
      rotationX: -y * 12,
      scale: 1.03,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 800,
    });
  }, []);

  const handleCardMouseLeave = useCallback((index) => {
    const card = cardsRef.current[index];
    if (!card) return;
    gsap.to(card, {
      rotationY: 0, rotationX: 0, scale: 1,
      duration: 0.6, ease: 'elastic.out(1, 0.4)'
    });
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const categories = [
    { id: '', label: 'Toutes', icon: '🏷️' },
    { id: 'Électronique', label: 'Électronique', icon: '📱' },
    { id: 'Vêtements', label: 'Vêtements', icon: '👕' },
    { id: 'Maison', label: 'Maison & Déco', icon: '🏠' },
    { id: 'Véhicules', label: 'Véhicules', icon: '🚗' },
    { id: 'Services', label: 'Services', icon: '🔧' },
  ];

  if (user?.role === 'admin') return null;

  return (
    <div ref={containerRef} className="home-page">
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div ref={orb3Ref} className="orb orb-3" />
      <div className="grid-bg" />
      
      {/* Floating Particles */}
      <div className="particles-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* Navigation */}
      <nav ref={navRef} className="top-nav">
        <div className="nav-left">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <div className="nav-logo-glow">
              <span className="nav-logo-icon">📍</span>
            </div>
            <span className="nav-logo-text">Products Marketplace</span>
          </Link>
          <Link to="/about" className="nav-about-link" style={{ marginLeft: '12px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600' }}>
            À Propos
          </Link>
        </div>
        
        <div className="nav-center">
          <div className="search-bar-container">
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              type="text" 
              placeholder="Que recherchez-vous aujourd'hui ?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        <div className="nav-right">
          <button onClick={toggleTheme} className="nav-theme-btn" title="Toggle Light/Dark Mode">
            <span className="theme-icon">{isLightMode ? '🌙' : '☀️'}</span>
          </button>
          {user?.typeCompte === 'vendeur' && (
            <Link to="/create-annonce" className="publish-btn">
              <span className="publish-icon">+</span> Publier
            </Link>
          )}
          <Link to="/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
            <div className="nav-user-avatar-ring">
              <div className="nav-user-avatar">{getInitials(user?.nom)}</div>
            </div>
          </Link>
          <button onClick={handleLogout} className="nav-logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-main">
        {/* Header & Categories */}
        <section ref={headerRef} className="feed-header">
          <h1 className="feed-title">
            <span className="title-gradient">Découvrez</span> les annonces récentes
          </h1>
          <p className="feed-subtitle">Trouvez les meilleures offres près de chez vous</p>
          <div className="filters-row">
            <div className="categories-filter">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setCategorie(cat.id)}
                  className={`category-pill ${categorie === cat.id ? 'active' : ''}`}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="price-filters">
              <div className="price-input-wrapper">
                <input type="number" placeholder="Min" value={minPrix} onChange={(e) => setMinPrix(e.target.value)} className="price-input" />
                <span className="price-currency">DH</span>
              </div>
              <span className="price-separator">—</span>
              <div className="price-input-wrapper">
                <input type="number" placeholder="Max" value={maxPrix} onChange={(e) => setMaxPrix(e.target.value)} className="price-input" />
                <span className="price-currency">DH</span>
              </div>
            </div>
          </div>
        </section>

        {/* Annonces Feed */}
        <section ref={feedRef} className="feed-grid">
          {loading ? (
            /* Shimmer Skeleton Loading */
            [...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image skeleton" />
                <div className="skeleton-content">
                  <div className="skeleton skeleton-line" style={{width: '40%', height: '12px'}} />
                  <div className="skeleton skeleton-line" style={{width: '80%', height: '16px'}} />
                  <div className="skeleton skeleton-line" style={{width: '60%', height: '12px'}} />
                  <div className="skeleton-footer">
                    <div className="skeleton skeleton-badge" />
                    <div className="skeleton skeleton-avatar" />
                  </div>
                </div>
              </div>
            ))
          ) : annonces.length > 0 ? (
            annonces.map((annonce, index) => (
              <Link 
                to={`/annonce/${annonce.id}`} 
                key={annonce.id} 
                className="annonce-card"
                ref={(el) => { cardsRef.current[index] = el; }}
                onMouseMove={(e) => handleCardMouseMove(e, index)}
                onMouseLeave={() => handleCardMouseLeave(index)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="card-glow" />
                <div className="annonce-image-placeholder">
                  {annonce.images && annonce.images.length > 0 ? (
                    <img src={annonce.images[0]} alt={annonce.titre} className="annonce-img" />
                  ) : (
                    <span className="no-image-icon">📷</span>
                  )}
                  <div className="image-overlay" />
                  <span className="annonce-price">
                    <span className="price-value">{annonce.prix.toFixed(2)}</span>
                    <span className="price-unit">DH</span>
                  </span>
                  {annonce.typeAnnonce === 'Enchere' && (
                    <span className="auction-badge">🔨 Enchère</span>
                  )}
                </div>
                <div className="annonce-content">
                  <span className="annonce-category">{annonce.categorie}</span>
                  <h3 className="annonce-titre">{annonce.titre}</h3>
                  <p className="annonce-desc">{annonce.description.substring(0, 60)}...</p>
                  
                  <div className="annonce-footer">
                    <span className="annonce-etat">{annonce.etat}</span>
                    <div className="annonce-seller">
                      <div className="seller-avatar-small">{getInitials(annonce.User?.nom)}</div>
                      <span>{annonce.User?.nom}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <span className="empty-icon">🏜️</span>
              </div>
              <h3>Aucune annonce trouvée</h3>
              <p>Essayez de modifier vos critères de recherche.</p>
            </div>
          )}
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .home-page {
          min-height: 100vh;
          background-color: transparent;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* ─── Background Effects ─── */
        .grid-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(var(--grid-dots) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none; z-index: 0;
        }
        .orb { position: fixed; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; will-change: transform; }
        .orb-1 { width: 700px; height: 700px; background: radial-gradient(circle, var(--grid-dots-alt) 0%, transparent 70%); top: -250px; left: -200px; }
        .orb-2 { width: 600px; height: 600px; background: radial-gradient(circle, var(--grid-dots) 0%, transparent 70%); bottom: -200px; right: -150px; }
        .orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%); top: 35%; right: 15%; }

        /* ─── Floating Particles ─── */
        .particles-container { position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
        .particle {
          position: absolute; border-radius: 50%;
          opacity: 0.2; pointer-events: none;
        }
        .particle-1 { width: 4px; height: 4px; background: #f97316; top: 20%; left: 10%; animation: particleFloat1 15s ease-in-out infinite; }
        .particle-2 { width: 3px; height: 3px; background: #14b8a6; top: 60%; left: 80%; animation: particleFloat2 18s ease-in-out infinite 2s; }
        .particle-3 { width: 5px; height: 5px; background: #a78bfa; top: 40%; left: 50%; animation: particleFloat1 20s ease-in-out infinite 4s; }
        .particle-4 { width: 3px; height: 3px; background: #f97316; top: 80%; left: 30%; animation: particleFloat2 16s ease-in-out infinite 1s; }
        .particle-5 { width: 4px; height: 4px; background: #14b8a6; top: 15%; left: 70%; animation: particleFloat1 22s ease-in-out infinite 3s; }
        .particle-6 { width: 3px; height: 3px; background: #a78bfa; top: 70%; left: 20%; animation: particleFloat2 19s ease-in-out infinite 5s; }

        /* ─── Navigation ─── */
        .top-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 32px;
          background: var(--overlay-bg);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--card-border);
          transition: all 0.3s ease;
        }
        .nav-left { display: flex; align-items: center; gap: 10px; width: 280px; }
        .nav-logo-glow {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(249,115,22,0.15), rgba(20,184,166,0.15));
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
        }
        .nav-logo-glow:hover {
          background: linear-gradient(135deg, rgba(249,115,22,0.25), rgba(20,184,166,0.25));
          box-shadow: 0 0 20px rgba(249,115,22,0.2);
        }
        .nav-logo-icon { font-size: 18px; }
        .nav-logo-text { 
          font-size: 15px; font-weight: 800; letter-spacing: -0.02em;
          background: linear-gradient(135deg, #14b8a6, #2dd4bf); 
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
        }
        
        .nav-center { flex: 1; display: flex; justify-content: center; max-width: 550px; margin: 0 20px; }
        .search-bar-container {
          width: 100%; display: flex; align-items: center;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 14px; padding: 4px 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-bar-container:focus-within {
          background: var(--input-focus-bg);
          border-color: rgba(20,184,166,0.5);
          box-shadow: 0 0 0 4px rgba(20,184,166,0.1), 0 8px 32px rgba(20,184,166,0.08);
          transform: scale(1.01);
        }
        .search-icon { opacity: 0.4; margin-right: 10px; color: var(--text-primary); display: flex; transition: opacity 0.3s; }
        .search-bar-container:focus-within .search-icon { opacity: 0.8; color: #14b8a6; }
        .search-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text-primary); font-size: 14px; padding: 10px 0;
          font-family: 'Inter', sans-serif;
        }
        .search-clear {
          background: var(--card-bg-hover); border: none; color: var(--text-secondary);
          width: 22px; height: 22px; border-radius: 50%; cursor: pointer;
          font-size: 10px; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .search-clear:hover { background: rgba(239,68,68,0.2); color: #f87171; }

        .nav-right { display: flex; align-items: center; justify-content: flex-end; gap: 10px; width: 280px; }
        .nav-theme-btn {
          background: var(--card-bg); border: 1px solid var(--card-border);
          border-radius: 12px; width: 38px; height: 38px;
          color: var(--text-primary); font-size: 16px; cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center;
        }
        .theme-icon { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); display: inline-block; }
        .nav-theme-btn:hover { background: var(--card-bg-hover); border-color: var(--card-border-light); }
        .nav-theme-btn:hover .theme-icon { transform: rotate(30deg) scale(1.15); }
        
        .publish-btn {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; text-decoration: none; font-size: 13px; font-weight: 700;
          padding: 9px 18px; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(249,115,22,0.3);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          letter-spacing: -0.01em;
        }
        .publish-icon {
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700;
          transition: transform 0.3s;
        }
        .publish-btn:hover { 
          transform: translateY(-3px) scale(1.02); 
          box-shadow: 0 8px 30px rgba(249,115,22,0.45); 
        }
        .publish-btn:hover .publish-icon { transform: rotate(90deg); }
        .publish-btn:active { transform: translateY(0) scale(0.98); }
        
        .nav-user-pill {
          display: flex; align-items: center;
          border-radius: 14px; padding: 3px;
        }
        .nav-user-avatar-ring {
          padding: 2px;
          background: linear-gradient(135deg, #14b8a6, #f97316);
          border-radius: 50%;
          animation: ringRotate 4s linear infinite;
        }
        .nav-user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--bg-primary);
          color: var(--text-primary); font-size: 11px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
        }
        .nav-user-pill:hover .nav-user-avatar {
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          color: white;
        }
        
        .nav-logout-btn {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15);
          border-radius: 12px; width: 38px; height: 38px;
          color: #fca5a5; cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logout-btn:hover { 
          background: rgba(239,68,68,0.2); color: #fecaca; 
          border-color: rgba(239,68,68,0.3);
          box-shadow: 0 0 20px rgba(239,68,68,0.15);
        }

        /* ─── Main Content ─── */
        .home-main { position: relative; z-index: 10; max-width: 1240px; margin: 0 auto; padding: 95px 24px 60px; }

        /* ─── Feed Header ─── */
        .feed-header { margin-bottom: 36px; }
        .feed-title { 
          font-size: 32px; font-weight: 900; color: var(--text-primary); 
          margin-bottom: 6px; letter-spacing: -0.03em; line-height: 1.2;
        }
        .title-gradient {
          background: linear-gradient(135deg, #f97316, #14b8a6, #a78bfa, #f97316);
          background-size: 300% 300%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease infinite;
        }
        .feed-subtitle {
          font-size: 15px; color: var(--text-secondary); margin-bottom: 24px; font-weight: 400;
        }
        .filters-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .categories-filter { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; flex: 1; }
        .categories-filter::-webkit-scrollbar { display: none; }
        .price-filters { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
        .price-input-wrapper {
          display: flex; align-items: center;
          background: var(--card-bg); border: 1px solid var(--card-border);
          border-radius: 10px; overflow: hidden; transition: all 0.3s;
        }
        .price-input-wrapper:focus-within {
          border-color: rgba(20,184,166,0.4);
          box-shadow: 0 0 0 3px rgba(20,184,166,0.08);
        }
        .price-input {
          width: 70px; padding: 8px 10px; border: none; background: transparent;
          color: var(--text-primary); outline: none; font-family: 'Inter', sans-serif;
          font-size: 13px;
        }
        .price-currency { font-size: 11px; color: var(--text-secondary); padding-right: 10px; font-weight: 600; }
        .price-separator { color: var(--text-secondary); font-weight: 300; }
        
        .category-pill {
          background: var(--card-bg); border: 1px solid var(--card-border);
          color: var(--text-secondary); font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
          padding: 8px 16px; border-radius: 12px; cursor: pointer;
          white-space: nowrap; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; gap: 6px;
        }
        .cat-icon { font-size: 14px; transition: transform 0.3s; }
        .category-pill:hover { 
          background: var(--card-bg-hover); color: var(--text-primary); 
          border-color: var(--card-border-light);
          transform: translateY(-2px);
        }
        .category-pill:hover .cat-icon { transform: scale(1.2); }
        .category-pill.active {
          background: rgba(20,184,166,0.12); border-color: rgba(20,184,166,0.35);
          color: #2dd4bf;
          box-shadow: 0 4px 15px rgba(20,184,166,0.12);
        }
        .category-pill.active .cat-icon { transform: scale(1.15); }

        /* ─── Feed Grid ─── */
        .feed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 22px;
        }
        
        /* ─── Skeleton Loading ─── */
        .skeleton-card {
          background: var(--card-bg); border: 1px solid var(--card-border);
          border-radius: 20px; overflow: hidden;
          animation: fadeIn 0.3s ease-out both;
        }
        .skeleton-image { height: 180px; }
        .skeleton-content { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .skeleton-line { border-radius: 6px; }
        .skeleton-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .skeleton-badge { width: 60px; height: 24px; border-radius: 100px; }
        .skeleton-avatar { width: 24px; height: 24px; border-radius: 50%; }

        .loading-state, .empty-state {
          grid-column: 1 / -1; text-align: center; padding: 80px 20px;
          color: var(--text-secondary); font-weight: 500;
        }
        .empty-icon-wrapper {
          width: 80px; height: 80px; border-radius: 50%;
          background: var(--card-bg); border: 1px solid var(--card-border);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; animation: breathe 3s ease-in-out infinite;
        }
        .empty-icon { font-size: 36px; display: block; }
        .empty-state h3 { font-size: 20px; color: var(--text-primary); margin-bottom: 8px; font-weight: 700; }
        .empty-state p { font-size: 14px; color: var(--text-secondary); }

        /* ─── Annonce Card ─── */
        .annonce-card {
          position: relative;
          background: var(--card-bg); border: 1px solid var(--card-border);
          border-radius: 20px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column;
          transition: border-color 0.4s, box-shadow 0.4s;
          will-change: transform;
        }
        .card-glow {
          position: absolute; inset: 0; border-radius: 20px;
          opacity: 0; transition: opacity 0.4s;
          background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(249,115,22,0.06), transparent 40%);
          pointer-events: none; z-index: 1;
        }
        .annonce-card:hover {
          border-color: rgba(249,115,22,0.2);
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(249,115,22,0.1);
        }
        .annonce-card:hover .card-glow { opacity: 1; }
        
        .annonce-image-placeholder {
          height: 190px; background: var(--card-bg-hover); position: relative;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .annonce-img { 
          width: 100%; height: 100%; object-fit: cover; 
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .annonce-card:hover .annonce-img { transform: scale(1.08); }
        .image-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%);
          pointer-events: none; z-index: 1;
        }
        .no-image-icon { font-size: 40px; opacity: 0.15; }
        .annonce-price {
          position: absolute; bottom: 12px; right: 12px; z-index: 2;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(12px);
          font-weight: 800; font-size: 15px;
          padding: 6px 14px; border-radius: 10px; border: 1px solid rgba(45,212,191,0.3);
          display: flex; align-items: baseline; gap: 4px;
        }
        .price-value { color: #2dd4bf; }
        .price-unit { color: rgba(45,212,191,0.6); font-size: 11px; font-weight: 600; }
        .auction-badge {
          position: absolute; top: 12px; left: 12px; z-index: 2;
          background: rgba(249,115,22,0.9); color: white;
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px;
          animation: pulseGlow 2s ease-in-out infinite;
        }
        
        .annonce-content { padding: 18px 20px 20px; flex: 1; display: flex; flex-direction: column; position: relative; z-index: 2; }
        .annonce-category { 
          font-size: 11px; font-weight: 700; color: #f97316; 
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;
        }
        .annonce-titre { 
          font-size: 16px; font-weight: 700; color: var(--text-primary); 
          margin-bottom: 6px; line-height: 1.35; letter-spacing: -0.01em;
          transition: color 0.3s;
        }
        .annonce-card:hover .annonce-titre { color: #f97316; }
        .annonce-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; flex: 1; }
        
        .annonce-footer {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid var(--card-border); padding-top: 14px;
        }
        .annonce-etat {
          background: var(--card-bg-hover); color: var(--text-primary);
          font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 8px;
          border: 1px solid var(--card-border);
        }
        .annonce-seller { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); font-weight: 500; }
        .seller-avatar-small {
          width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg, #334155, #1e293b); 
          color: white; font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--card-border);
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .top-nav { flex-wrap: wrap; padding: 10px 16px; gap: 10px; }
          .nav-center { order: 3; max-width: 100%; margin: 0; flex-basis: 100%; }
          .home-main { padding-top: 140px; }
          .feed-title { font-size: 24px; }
          .filters-row { flex-direction: column; align-items: stretch; }
          .price-filters { justify-content: center; }
          .nav-left { width: auto; }
          .nav-right { width: auto; }
        }
      `}</style>
    </div>
  );
}
