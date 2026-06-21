import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export default function About() {
  const { user, logout } = useContext(AuthContext);
  const { isLightMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const navRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const techRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: 50, y: -30, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -40, y: 40, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      gsap.fromTo(navRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo(heroRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: 'power3.out' });
      gsap.fromTo('.feature-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.5, stagger: 0.08, ease: 'power3.out' });
      gsap.fromTo(techRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 1.2, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const p = name.trim().split(' ');
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.charAt(0).toUpperCase();
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const features = [
    { icon: '🛍️', title: 'Marketplace Complète', desc: 'Publiez, recherchez et achetez des produits en toute simplicité. Filtrage avancé par catégorie, prix et état.' },
    { icon: '💳', title: 'Paiement à la Livraison', desc: 'Commandez en Cash on Delivery et suivez le statut de votre commande en temps réel depuis votre profil.' },
    { icon: '📍', title: 'Géolocalisation & Points Relais', desc: 'Localisez chaque annonce sur une carte interactive et choisissez un point de retrait relais près de chez vous.' },
    { icon: '💬', title: 'Négociation via WhatsApp', desc: 'Contactez directement le vendeur via un bouton WhatsApp intégré pour négocier le prix.' },
    { icon: '⭐', title: 'Avis & Réputation', desc: 'Évaluez les vendeurs avec des étoiles et des commentaires. La note moyenne reflète la fiabilité du vendeur.' },
    { icon: '🔨', title: 'Enchères en Temps Réel', desc: 'Participez à des ventes aux enchères dynamiques. Surenchérissez et suivez les offres en direct.' },
    { icon: '🤖', title: 'Assistant IA Intelligent', desc: 'Posez vos questions à notre chatbot IA alimenté par OpenAI. Il vous guide et répond en Darija ou en Français.' },
    { icon: '🛡️', title: 'Modération Automatique', desc: "Un filtre IA anti-spam détecte automatiquement les annonces frauduleuses et les signale pour modération." },
    { icon: '🌙', title: 'Mode Sombre & Clair', desc: 'Basculez entre un thème sombre élégant et un mode clair lumineux selon votre préférence.' },
  ];

  const techStack = [
    { name: 'React.js', desc: 'Interface utilisateur dynamique', color: '#61dafb' },
    { name: 'Node.js', desc: 'Serveur backend performant', color: '#68a063' },
    { name: 'Express.js', desc: 'Framework API RESTful', color: '#f97316' },
    { name: 'Sequelize', desc: 'ORM pour base de données', color: '#3178c6' },
    { name: 'Chart.js', desc: 'Visualisations statistiques', color: '#ff6384' },
    { name: 'GSAP', desc: 'Animations fluides premium', color: '#88ce02' },
    { name: 'Leaflet', desc: 'Cartes interactives', color: '#199900' },
    { name: 'OpenAI API', desc: 'Chatbot IA conversationnel', color: '#10a37f' },
    { name: 'JWT & Bcrypt', desc: 'Authentification sécurisée', color: '#a78bfa' },
  ];

  return (
    <div ref={containerRef} className="about-page">
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div className="grid-bg" />

      {/* Navigation */}
      <nav ref={navRef} className="top-nav">
        <div className="nav-left">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
            <span className="nav-logo-icon">📍</span>
            <span className="nav-logo-text">Products Marketplace</span>
          </Link>
          <Link to="/about" className="nav-about-link active">À Propos</Link>
        </div>
        <div className="nav-right">
          <button onClick={toggleTheme} className="nav-theme-btn">{isLightMode ? '🌙' : '☀️'}</button>
          <Link to="/profile" className="nav-user-pill" style={{ textDecoration: 'none' }}>
            <div className="nav-user-avatar">{getInitials(user?.nom)}</div>
          </Link>
          <button onClick={handleLogout} className="nav-logout-btn"><span>⏻</span></button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="about-container">
        <section ref={heroRef} className="hero-section">
          <div className="hero-badge">🇲🇦 Made in Morocco</div>
          <h1 className="hero-title">Products Marketplace</h1>
          <p className="hero-subtitle">
            La plateforme e-commerce marocaine nouvelle génération qui réunit acheteurs et vendeurs 
            dans un écosystème moderne, sécurisé et intelligent.
          </p>
          <div className="hero-stats">
            <div className="stat-pill">
              <span className="stat-number">9+</span>
              <span className="stat-label">Fonctionnalités</span>
            </div>
            <div className="stat-pill">
              <span className="stat-number">9</span>
              <span className="stat-label">Technologies</span>
            </div>
            <div className="stat-pill">
              <span className="stat-number">2</span>
              <span className="stat-label">Thèmes (Dark/Light)</span>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-section">
          <h2 className="section-title">Ce que propose notre plateforme</h2>
          <p className="section-subtitle">Chaque fonctionnalité a été pensée pour offrir la meilleure expérience possible.</p>
          <div ref={featuresRef} className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section ref={techRef} className="tech-section glass-card">
          <h2 className="section-title">Technologies Utilisées</h2>
          <p className="section-subtitle">Un stack moderne et performant pour une application de qualité professionnelle.</p>
          <div className="tech-grid">
            {techStack.map((t, i) => (
              <div key={i} className="tech-pill">
                <div className="tech-dot" style={{ background: t.color }} />
                <div>
                  <span className="tech-name">{t.name}</span>
                  <span className="tech-desc">{t.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2>Prêt à découvrir ?</h2>
          <p>Explorez les annonces, négociez les prix, et profitez d'une expérience d'achat unique.</p>
          <Link to="/" className="cta-btn">Explorer les annonces →</Link>
        </section>
      </div>

      <style>{`
        .about-page { min-height: 100vh; color: var(--text-primary); padding: 100px 20px 60px; position: relative; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        .grid-bg { position: fixed; inset: 0; background-image: radial-gradient(var(--grid-dots) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
        
        .orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 400px; height: 400px; background: rgba(249, 115, 22, 0.08); top: 10%; left: -100px; }
        .orb-2 { width: 350px; height: 350px; background: rgba(20, 184, 166, 0.06); bottom: 10%; right: -80px; }

        .top-nav { position: fixed; top: 0; left: 0; right: 0; height: 70px; background: rgba(15,23,42,0.15); backdrop-filter: blur(16px); border-bottom: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; z-index: 1000; }
        .nav-left { display: flex; align-items: center; gap: 20px; }
        .nav-logo-icon { font-size: 24px; }
        .nav-logo-text { font-size: 18px; font-weight: 800; background: linear-gradient(135deg, #f97316, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-about-link { text-decoration: none; color: var(--text-secondary); font-size: 14px; font-weight: 600; padding: 6px 12px; border-radius: 100px; transition: 0.2s; }
        .nav-about-link.active, .nav-about-link:hover { color: #f97316; background: rgba(249,115,22,0.1); }
        .nav-right { display: flex; align-items: center; gap: 15px; }
        .nav-theme-btn, .nav-logout-btn { background: transparent; border: none; font-size: 20px; cursor: pointer; color: var(--text-primary); padding: 8px; border-radius: 50%; transition: 0.2s; }
        .nav-theme-btn:hover, .nav-logout-btn:hover { background: var(--card-bg-hover); }
        .nav-user-pill { display: flex; align-items: center; justify-content: center; }
        .nav-user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #14b8a6); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: white; }

        .about-container { max-width: 1000px; margin: 0 auto; position: relative; z-index: 10; }

        /* Hero */
        .hero-section { text-align: center; margin-bottom: 60px; }
        .hero-badge { display: inline-block; background: rgba(249,115,22,0.1); color: #ea580c; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 100px; margin-bottom: 20px; border: 1px solid rgba(249,115,22,0.2); }
        .hero-title { font-size: 52px; font-weight: 900; background: linear-gradient(135deg, #f97316, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 20px; line-height: 1.1; }
        .hero-subtitle { font-size: 18px; color: var(--text-secondary); line-height: 1.7; max-width: 650px; margin: 0 auto 35px; }
        .hero-stats { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
        .stat-pill { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 16px 28px; text-align: center; min-width: 130px; }
        .stat-number { display: block; font-size: 28px; font-weight: 900; color: #f97316; }
        .stat-label { font-size: 12px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Features */
        .features-section { margin-bottom: 50px; }
        .section-title { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 10px; text-align: center; }
        .section-subtitle { font-size: 15px; color: var(--text-secondary); text-align: center; margin: 0 0 35px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
        .feature-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 18px; padding: 28px; transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s; cursor: default; }
        .feature-card:hover { transform: translateY(-6px); border-color: rgba(249,115,22,0.3); box-shadow: 0 12px 40px rgba(249,115,22,0.08); }
        .feature-icon { font-size: 32px; margin-bottom: 14px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: rgba(249,115,22,0.08); border-radius: 14px; }
        .feature-card h3 { font-size: 17px; font-weight: 700; color: var(--text-primary); margin: 0 0 10px; }
        .feature-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; }

        /* Tech */
        .tech-section { margin-bottom: 50px; padding: 40px; }
        .glass-card { background: var(--card-bg); backdrop-filter: blur(20px); border: 1px solid var(--card-border); border-radius: 24px; }
        .tech-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 14px; }
        .tech-pill { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: var(--card-bg-hover); border: 1px solid var(--card-border); border-radius: 12px; transition: border-color 0.2s; }
        .tech-pill:hover { border-color: var(--card-border-light); }
        .tech-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .tech-name { display: block; font-size: 15px; font-weight: 700; color: var(--text-primary); }
        .tech-desc { display: block; font-size: 12px; color: var(--text-secondary); }

        /* CTA */
        .cta-section { text-align: center; padding: 50px 20px; }
        .cta-section h2 { font-size: 28px; font-weight: 800; margin: 0 0 12px; color: var(--text-primary); }
        .cta-section p { font-size: 15px; color: var(--text-secondary); margin: 0 0 25px; }
        .cta-btn { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 14px 36px; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(249,115,22,0.3); }

        @media (max-width: 640px) {
          .hero-title { font-size: 32px; }
          .hero-subtitle { font-size: 16px; }
          .hero-stats { gap: 12px; }
          .stat-pill { min-width: 100px; padding: 12px 16px; }
        }
      `}</style>
    </div>
  );
}
