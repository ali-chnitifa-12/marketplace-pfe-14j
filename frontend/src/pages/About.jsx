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
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    const p = name.trim().split(' ');
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: 70, y: -50, scale: 1.1, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -60, y: 60, scale: 0.9, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      gsap.fromTo(navRef.current, { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)' });
      gsap.fromTo(heroRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'power3.out' });
      gsap.fromTo('.feature-card', { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, delay: 0.6, stagger: 0.07, ease: 'back.out(1.5)' });
      gsap.fromTo('.tech-pill', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, delay: 1.0, stagger: 0.04, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const features = [
    { icon: '🛍️', title: 'Marketplace Complète', desc: 'Publiez, recherchez et achetez des produits en toute simplicité. Filtrage avancé par catégorie, prix et état.', color: '#f97316' },
    { icon: '💳', title: 'Paiement à la Livraison', desc: 'Commandez en Cash on Delivery et suivez le statut en temps réel depuis votre profil.', color: '#10b981' },
    { icon: '📍', title: 'Géolocalisation & Relais', desc: 'Localisez chaque annonce sur carte et choisissez un point de retrait près de chez vous.', color: '#14b8a6' },
    { icon: '💬', title: 'Négociation WhatsApp', desc: 'Contactez le vendeur directement via un bouton WhatsApp intégré pour négocier.', color: '#25d366' },
    { icon: '⭐', title: 'Avis & Réputation', desc: 'Évaluez les vendeurs. La note moyenne reflète la fiabilité du vendeur.', color: '#f59e0b' },
    { icon: '🔨', title: 'Enchères en Temps Réel', desc: 'Participez à des ventes aux enchères dynamiques et surenchérissez en direct.', color: '#8b5cf6' },
    { icon: '🤖', title: 'Assistant IA', desc: 'Chatbot alimenté par OpenAI. Il vous guide en Darija ou en Français.', color: '#06b6d4' },
    { icon: '🛡️', title: 'Modération Automatique', desc: 'Filtre IA anti-spam qui détecte les annonces frauduleuses automatiquement.', color: '#ec4899' },
    { icon: '🌙', title: 'Mode Sombre & Clair', desc: 'Basculez entre thème sombre élégant et mode clair lumineux.', color: '#a78bfa' },
  ];

  const techStack = [
    { name: 'React.js', desc: 'Interface dynamique', color: '#61dafb' },
    { name: 'Node.js', desc: 'Serveur backend', color: '#68a063' },
    { name: 'Express.js', desc: 'API RESTful', color: '#f97316' },
    { name: 'Sequelize', desc: 'ORM MySQL', color: '#3178c6' },
    { name: 'Chart.js', desc: 'Visualisations', color: '#ff6384' },
    { name: 'GSAP', desc: 'Animations premium', color: '#88ce02' },
    { name: 'Leaflet', desc: 'Cartes interactives', color: '#199900' },
    { name: 'OpenAI API', desc: 'Chatbot IA', color: '#10a37f' },
    { name: 'JWT & Bcrypt', desc: 'Auth sécurisée', color: '#a78bfa' },
  ];

  return (
    <div ref={containerRef} className="about-page">
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div className="grid-bg" />

      {/* Nav */}
      <nav ref={navRef} className="top-nav">
        <div className="nav-left">
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', color:'inherit' }}>
            <div className="nav-logo-box">📍</div>
            <span className="nav-logo-text">Products Marketplace</span>
          </Link>
          <Link to="/about" className="nav-pill active">À Propos</Link>
        </div>
        <div className="nav-right">
          <button onClick={toggleTheme} className="icon-btn">{isLightMode ? '🌙' : '☀️'}</button>
          <Link to="/profile" className="avatar-ring-link">
            <div className="avatar-ring"><div className="avatar-inner">{getInitials(user?.nom)}</div></div>
          </Link>
          <button onClick={() => { logout(); navigate('/login'); }} className="icon-btn logout-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </nav>

      <div className="about-container">
        {/* Hero */}
        <section ref={heroRef} className="hero-section">
          <span className="hero-badge">🇲🇦 Made in Morocco</span>
          <h1 className="hero-title">
            <span className="gradient-text">Products</span><br />Marketplace
          </h1>
          <p className="hero-subtitle">
            La plateforme e-commerce marocaine nouvelle génération qui réunit acheteurs et vendeurs dans un écosystème moderne, sécurisé et intelligent.
          </p>
          <div className="hero-stats">
            {[['9+','Fonctionnalités'],['9','Technologies'],[' 2','Thèmes']].map(([n,l]) => (
              <div key={l} className="stat-pill">
                <span className="stat-num">{n}</span>
                <span className="stat-label">{l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <h2 className="section-title">Ce que propose notre plateforme</h2>
          <p className="section-sub">Chaque fonctionnalité a été pensée pour offrir la meilleure expérience possible.</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ '--card-accent': f.color }}>
                <div className="feat-icon" style={{ background: `${f.color}18`, color: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="feat-glow" style={{ background: f.color }} />
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="tech-section">
          <h2 className="section-title">Technologies Utilisées</h2>
          <p className="section-sub">Un stack moderne pour une application de qualité professionnelle.</p>
          <div className="tech-grid">
            {techStack.map((t, i) => (
              <div key={i} className="tech-pill">
                <div className="tech-dot" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
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
          <Link to="/" className="cta-btn">
            Explorer les annonces <span className="cta-arrow">→</span>
          </Link>
        </section>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .about-page { min-height:100vh; color:var(--text-primary); padding:90px 20px 60px; position:relative; font-family:'Inter',sans-serif; overflow-x:hidden; }
        .grid-bg { position:fixed; inset:0; background-image:radial-gradient(var(--grid-dots) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:0; }
        .orb { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; z-index:0; }
        .orb-1 { width:500px; height:500px; background:radial-gradient(circle,rgba(249,115,22,0.1) 0%,transparent 70%); top:-150px; left:-130px; }
        .orb-2 { width:450px; height:450px; background:radial-gradient(circle,rgba(20,184,166,0.08) 0%,transparent 70%); bottom:-120px; right:-100px; }

        .top-nav { position:fixed; top:0; left:0; right:0; height:68px; background:var(--overlay-bg); backdrop-filter:blur(20px); border-bottom:1px solid var(--card-border); display:flex; align-items:center; justify-content:space-between; padding:0 36px; z-index:100; }
        .nav-left { display:flex; align-items:center; gap:16px; }
        .nav-logo-box { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(20,184,166,0.12)); display:flex; align-items:center; justify-content:center; font-size:17px; }
        .nav-logo-text { font-size:15px; font-weight:800; background:linear-gradient(135deg,#f97316,#14b8a6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .nav-pill { text-decoration:none; color:var(--text-secondary); font-size:13px; font-weight:600; padding:6px 14px; border-radius:100px; transition:all 0.25s; }
        .nav-pill.active,.nav-pill:hover { color:#f97316; background:rgba(249,115,22,0.1); }
        .nav-right { display:flex; align-items:center; gap:10px; }
        .icon-btn { background:var(--card-bg); border:1px solid var(--card-border); border-radius:12px; width:38px; height:38px; color:var(--text-primary); font-size:17px; cursor:pointer; transition:all 0.3s; display:flex; align-items:center; justify-content:center; }
        .icon-btn:hover { background:var(--card-bg-hover); transform:scale(1.08); }
        .logout-btn { color:#fca5a5; border-color:rgba(239,68,68,0.2); background:rgba(239,68,68,0.06); }
        .logout-btn:hover { background:rgba(239,68,68,0.15); }
        .avatar-ring-link { display:block; padding:2px; background:linear-gradient(135deg,#f97316,#14b8a6); border-radius:50%; animation:ringRotate 4s linear infinite; }
        .avatar-ring { padding:2px; border-radius:50%; background:var(--bg-primary); }
        .avatar-inner { width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#334155,#1e293b); color:white; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; }

        .about-container { max-width:1060px; margin:0 auto; position:relative; z-index:10; }

        /* Hero */
        .hero-section { text-align:center; margin-bottom:80px; }
        .hero-badge { display:inline-block; background:rgba(249,115,22,0.1); color:#ea580c; font-size:13px; font-weight:700; padding:6px 18px; border-radius:100px; margin-bottom:24px; border:1px solid rgba(249,115,22,0.2); }
        .hero-title { font-size:72px; font-weight:900; line-height:1; letter-spacing:-0.04em; margin:0 0 20px; }
        .hero-subtitle { font-size:18px; color:var(--text-secondary); line-height:1.7; max-width:620px; margin:0 auto 40px; }
        .hero-stats { display:flex; justify-content:center; gap:20px; flex-wrap:wrap; }
        .stat-pill { background:var(--card-bg); border:1px solid var(--card-border); border-radius:18px; padding:18px 30px; text-align:center; min-width:130px; transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1); cursor:default; }
        .stat-pill:hover { transform:translateY(-6px); border-color:rgba(249,115,22,0.3); box-shadow:0 16px 40px rgba(249,115,22,0.08); }
        .stat-num { display:block; font-size:32px; font-weight:900; color:#f97316; }
        .stat-label { font-size:12px; color:var(--text-secondary); font-weight:700; text-transform:uppercase; letter-spacing:0.06em; }

        /* Features */
        .features-section { margin-bottom:70px; }
        .section-title { font-size:32px; font-weight:900; color:var(--text-primary); margin:0 0 10px; text-align:center; letter-spacing:-0.03em; }
        .section-sub { font-size:15px; color:var(--text-secondary); text-align:center; margin:0 0 40px; }
        .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); gap:18px; }
        .feature-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:20px; padding:28px; transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1); cursor:default; position:relative; overflow:hidden; }
        .feature-card:hover { transform:translateY(-7px); border-color:var(--card-accent,rgba(249,115,22,0.3)); box-shadow:0 16px 50px rgba(0,0,0,0.1); }
        .feat-icon { font-size:28px; width:56px; height:56px; display:flex; align-items:center; justify-content:center; background:rgba(249,115,22,0.08); border-radius:16px; margin-bottom:16px; transition:transform 0.3s; }
        .feature-card:hover .feat-icon { transform:scale(1.15) rotate(5deg); }
        .feature-card h3 { font-size:17px; font-weight:800; color:var(--text-primary); margin:0 0 10px; }
        .feature-card p { font-size:14px; color:var(--text-secondary); line-height:1.65; margin:0; }
        .feat-glow { position:absolute; width:100px; height:100px; border-radius:50%; bottom:-40px; right:-30px; opacity:0.06; filter:blur(30px); pointer-events:none; }

        /* Tech */
        .tech-section { background:var(--card-bg); border:1px solid var(--card-border); border-radius:24px; padding:40px; margin-bottom:60px; }
        .tech-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; }
        .tech-pill { display:flex; align-items:center; gap:14px; padding:14px 18px; background:var(--card-bg-hover); border:1px solid var(--card-border); border-radius:14px; transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); cursor:default; }
        .tech-pill:hover { transform:translateX(6px); border-color:var(--card-border-light); }
        .tech-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
        .tech-name { display:block; font-size:15px; font-weight:800; color:var(--text-primary); }
        .tech-desc { display:block; font-size:12px; color:var(--text-secondary); margin-top:2px; }

        /* CTA */
        .cta-section { text-align:center; padding:60px 20px; }
        .cta-section h2 { font-size:36px; font-weight:900; letter-spacing:-0.03em; margin:0 0 14px; color:var(--text-primary); }
        .cta-section p { font-size:16px; color:var(--text-secondary); margin:0 0 30px; }
        .cta-btn { display:inline-flex; align-items:center; gap:10px; background:linear-gradient(135deg,#f97316,#ea580c); color:white; padding:16px 40px; border-radius:16px; font-size:16px; font-weight:800; text-decoration:none; transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); box-shadow:0 8px 30px rgba(249,115,22,0.3); }
        .cta-btn:hover { transform:translateY(-4px) scale(1.02); box-shadow:0 16px 50px rgba(249,115,22,0.45); }
        .cta-arrow { display:inline-block; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .cta-btn:hover .cta-arrow { transform:translateX(5px); }

        @media (max-width:640px) {
          .hero-title { font-size:44px; }
          .hero-subtitle { font-size:16px; }
          .top-nav { padding:0 16px; }
        }
      `}</style>
    </div>
  );
}
