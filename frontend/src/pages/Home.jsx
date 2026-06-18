import React, { useEffect, useRef, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');

  const containerRef = useRef(null);
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const feedRef = useRef(null);
  
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
        params: { search, categorie }
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
  }, [search, categorie]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background Orbs
      gsap.to(orb1Ref.current, { x: 50, y: -30, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -40, y: 40, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      gsap.to(orb3Ref.current, { x: 30, y: 30, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });

      // Nav Entrance
      gsap.fromTo(navRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      
      // Header Entrance
      gsap.fromTo(headerRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' });
      
      // Feed Entrance
      gsap.fromTo(feedRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'power3.out' });
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const categories = [
    { id: '', label: 'Toutes les catégories' },
    { id: 'Électronique', label: 'Électronique' },
    { id: 'Vêtements', label: 'Vêtements' },
    { id: 'Maison', label: 'Maison & Déco' },
    { id: 'Véhicules', label: 'Véhicules' },
    { id: 'Services', label: 'Services' },
  ];

  if (user?.role === 'admin') return null;

  return (
    <div ref={containerRef} className="home-page">
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div ref={orb3Ref} className="orb orb-3" />
      <div className="grid-bg" />

      {/* Navigation */}
      <nav ref={navRef} className="top-nav">
        <div className="nav-left">
          <span className="nav-logo-icon">📍</span>
          <span className="nav-logo-text">Marketplace PFE</span>
        </div>
        
        <div className="nav-center">
          <div className="search-bar-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Que recherchez-vous aujourd'hui ?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="nav-right">
          {user?.typeCompte === 'vendeur' && (
            <Link to="/create-annonce" className="publish-btn">
              <span>➕</span> Publier
            </Link>
          )}
          <div className="nav-user-pill">
            <div className="nav-user-avatar">{getInitials(user?.nom)}</div>
          </div>
          <button onClick={handleLogout} className="nav-logout-btn">
            <span>⏻</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-main">
        {/* Header & Categories */}
        <section ref={headerRef} className="feed-header">
          <h1 className="feed-title">Découvrez les annonces récentes</h1>
          <div className="categories-filter">
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setCategorie(cat.id)}
                className={`category-pill ${categorie === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Annonces Feed */}
        <section ref={feedRef} className="feed-grid">
          {loading ? (
            <div className="loading-state">
              <span className="spinner">⟳</span> Chargement des annonces...
            </div>
          ) : annonces.length > 0 ? (
            annonces.map((annonce) => (
              <Link to={`/annonce/${annonce.id}`} key={annonce.id} className="annonce-card">
                <div className="annonce-image-placeholder">
                  {annonce.images && annonce.images.length > 0 ? (
                    <img src={annonce.images[0]} alt={annonce.titre} className="annonce-img" />
                  ) : (
                    <span className="no-image-icon">📷</span>
                  )}
                  <span className="annonce-price">{annonce.prix.toFixed(2)} DH</span>
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
              <span className="empty-icon">🏜️</span>
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
          background: #050816;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* ─── Background ─── */
        .grid-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none; z-index: 0;
        }
        .orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%); top: -200px; left: -150px; }
        .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%); bottom: -150px; right: -100px; }
        .orb-3 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%); top: 40%; right: 20%; }

        /* ─── Navigation ─── */
        .top-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 32px;
          background: rgba(5,8,22,0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-left { display: flex; align-items: center; gap: 10px; width: 250px; }
        .nav-logo-icon { font-size: 22px; }
        .nav-logo-text { font-size: 16px; font-weight: 800; background: linear-gradient(135deg, #14b8a6, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .nav-center { flex: 1; display: flex; justify-content: center; max-width: 600px; margin: 0 20px; }
        .search-bar-container {
          width: 100%; display: flex; align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px; padding: 6px 16px;
          transition: all 0.3s;
        }
        .search-bar-container:focus-within {
          background: rgba(255,255,255,0.06);
          border-color: rgba(20,184,166,0.5);
          box-shadow: 0 0 0 3px rgba(20,184,166,0.15);
        }
        .search-icon { font-size: 14px; opacity: 0.5; margin-right: 10px; }
        .search-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #f1f5f9; font-size: 14px; padding: 6px 0;
          font-family: 'Inter', sans-serif;
        }

        .nav-right { display: flex; align-items: center; justify-content: flex-end; gap: 12px; width: 250px; }
        .publish-btn {
          display: flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; text-decoration: none; font-size: 13px; font-weight: 700;
          padding: 8px 16px; border-radius: 100px;
          box-shadow: 0 4px 15px rgba(249,115,22,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .publish-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(249,115,22,0.4); }
        .nav-user-pill {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 100px; padding: 4px;
        }
        .nav-user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          color: white; font-size: 12px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logout-btn {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 50%; width: 38px; height: 38px;
          color: #fca5a5; font-size: 14px; cursor: pointer; transition: all 0.3s;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logout-btn:hover { background: rgba(239,68,68,0.2); color: #fecaca; }

        /* ─── Main Content ─── */
        .home-main { position: relative; z-index: 10; max-width: 1200px; margin: 0 auto; padding: 100px 24px 60px; }

        /* ─── Feed Header ─── */
        .feed-header { margin-bottom: 30px; }
        .feed-title { font-size: 28px; font-weight: 800; color: #f1f5f9; margin-bottom: 20px; }
        .categories-filter { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none; }
        .categories-filter::-webkit-scrollbar { display: none; }
        .category-pill {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
          padding: 8px 18px; border-radius: 100px; cursor: pointer;
          white-space: nowrap; transition: all 0.3s;
        }
        .category-pill:hover { background: rgba(255,255,255,0.06); color: #cbd5e1; }
        .category-pill.active {
          background: rgba(20,184,166,0.15); border-color: rgba(20,184,166,0.4);
          color: #2dd4bf;
        }

        /* ─── Feed Grid ─── */
        .feed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .loading-state, .empty-state {
          grid-column: 1 / -1; text-align: center; padding: 80px 20px;
          color: #64748b; font-weight: 500;
        }
        .spinner { display: inline-block; animation: spin 1s linear infinite; font-size: 20px; margin-right: 8px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .empty-icon { font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.8; }
        .empty-state h3 { font-size: 20px; color: #cbd5e1; margin-bottom: 8px; }

        /* ─── Annonce Card ─── */
        .annonce-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; overflow: hidden; text-decoration: none;
          display: flex; flex-direction: column; transition: all 0.3s;
        }
        .annonce-card:hover {
          transform: translateY(-4px); background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1); box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .annonce-image-placeholder {
          height: 180px; background: rgba(0,0,0,0.2); position: relative;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          overflow: hidden;
        }
        .annonce-img { width: 100%; height: 100%; object-fit: cover; }
        .no-image-icon { font-size: 40px; opacity: 0.2; }
        .annonce-price {
          position: absolute; bottom: 12px; right: 12px;
          background: rgba(5,8,22,0.85); backdrop-filter: blur(8px);
          color: #2dd4bf; font-weight: 800; font-size: 15px;
          padding: 6px 12px; border-radius: 8px; border: 1px solid rgba(45,212,191,0.3);
        }
        .annonce-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        .annonce-category { font-size: 11px; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .annonce-titre { font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; line-height: 1.4; }
        .annonce-desc { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px; flex: 1; }
        
        .annonce-footer {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.05); padding-top: 14px;
        }
        .annonce-etat {
          background: rgba(255,255,255,0.05); color: #cbd5e1;
          font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px;
        }
        .annonce-seller { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; font-weight: 500; }
        .seller-avatar-small {
          width: 20px; height: 20px; border-radius: 50%;
          background: #334155; color: white; font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .top-nav { flex-wrap: wrap; padding: 12px 16px; gap: 12px; }
          .nav-center { order: 3; max-width: 100%; margin: 0; }
          .home-main { padding-top: 130px; }
        }
      `}</style>
    </div>
  );
}
