import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [step, setStep] = useState(0); // 0: name, 1: email, 2: password

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const titleRef = useRef(null);
  const fieldsRef = useRef([]);
  const btnRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Orb floating
      gsap.to(orb1Ref.current, { x: -50, y: 40, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: 40, y: -30, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
      gsap.to(orb3Ref.current, { x: -30, y: -40, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });

      // Card entrance
      gsap.fromTo(cardRef.current,
        { scale: 0.75, opacity: 0, y: 60 },
        { scale: 1, opacity: 1, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.6)' }
      );
      gsap.fromTo(titleRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'power3.out' }
      );
      gsap.fromTo(fieldsRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.12, duration: 0.6, delay: 0.7, ease: 'power2.out' }
      );
      gsap.fromTo(btnRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 1.2, ease: 'back.out(2)' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Animate progress bar when fields change
  useEffect(() => {
    const filled = [nom, email, password].filter(Boolean).length;
    gsap.to(progressRef.current, {
      width: `${(filled / 3) * 100}%`,
      duration: 0.5,
      ease: 'power2.out'
    });
  }, [nom, email, password]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(card, { rotationY: x / 35, rotationX: -y / 35, duration: 0.5, ease: 'power2.out', transformPerspective: 1000 });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register(nom, email, password);
      gsap.to(cardRef.current, { scale: 1.05, opacity: 0, y: -20, duration: 0.5 });
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
      gsap.fromTo(cardRef.current,
        { x: -15 },
        { x: 15, duration: 0.08, yoyo: true, repeat: 7, ease: 'linear', onComplete: () => gsap.set(cardRef.current, { x: 0 }) }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addToFields = (el) => {
    if (el && !fieldsRef.current.includes(el)) fieldsRef.current.push(el);
  };

  return (
    <div
      ref={containerRef}
      className="register-page"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div ref={orb3Ref} className="orb orb-3" />
      <div className="grid-bg" />

      <div ref={cardRef} className="glass-card">
        {/* Logo */}
        <div ref={addToFields} className="logo-area">
          <div className="logo-icon">📍</div>
          <span className="logo-text">Marketplace PFE</span>
        </div>

        <div ref={titleRef} className="card-title-area">
          <h1 className="card-title">Créer un compte</h1>
          <p className="card-subtitle">Rejoins des milliers d'acheteurs et vendeurs</p>
        </div>

        {/* Progress bar */}
        <div ref={addToFields} className="progress-area">
          <div className="progress-track">
            <div ref={progressRef} className="progress-fill" style={{ width: '0%' }} />
          </div>
          <span className="progress-label">Profil complété</span>
        </div>

        {error && (
          <div ref={addToFields} className="error-box">⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="form-area">
          <div ref={addToFields} className={`input-group ${focused === 'nom' ? 'focused' : ''}`}>
            <label>Nom complet</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                onFocus={() => setFocused('nom')}
                onBlur={() => setFocused('')}
                placeholder="Votre nom"
                required
              />
              {nom && <span className="check-icon">✓</span>}
            </div>
          </div>

          <div ref={addToFields} className={`input-group ${focused === 'email' ? 'focused' : ''}`}>
            <label>Email</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                placeholder="vous@email.com"
                required
              />
              {email.includes('@') && <span className="check-icon">✓</span>}
            </div>
          </div>

          <div ref={addToFields} className={`input-group ${focused === 'password' ? 'focused' : ''}`}>
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                placeholder="••••••••"
                required
              />
              {password.length >= 6 && <span className="check-icon">✓</span>}
            </div>
            {password && (
              <div className="strength-row">
                <div className={`strength-bar ${password.length < 6 ? 'weak' : password.length < 10 ? 'medium' : 'strong'}`} />
                <span className="strength-text">
                  {password.length < 6 ? 'Faible' : password.length < 10 ? 'Moyen' : 'Fort 🔥'}
                </span>
              </div>
            )}
          </div>

          <button ref={btnRef} type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? '⟳ Création...' : "S'inscrire gratuitement →"}
          </button>
        </form>

        <div ref={addToFields} className="features-row">
          <span className="feature-badge">✅ 100% Gratuit</span>
          <span className="feature-badge">🔒 Sécurisé</span>
          <span className="feature-badge">📍 Local</span>
        </div>

        <div ref={addToFields} className="switch-auth">
          Déjà un compte ?{' '}
          <Link to="/login" className="switch-link">Se connecter</Link>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .register-page {
          min-height: 100vh;
          background: #050816;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif;
          overflow: hidden; position: relative; padding: 20px;
        }

        .grid-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px);
          background-size: 30px 30px; pointer-events: none;
        }

        .orb { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 550px; height: 550px; background: radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%); top: -120px; right: -100px; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%); bottom: -100px; left: -80px; }
        .orb-3 { width: 280px; height: 280px; background: radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%); top: 40%; left: 20%; }

        .glass-card {
          position: relative; z-index: 10;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px; padding: 44px;
          width: 100%; max-width: 470px;
          box-shadow: 0 0 0 1px rgba(20,184,166,0.12), 0 30px 90px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
          transform-style: preserve-3d;
        }

        .logo-area { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .logo-icon { font-size: 28px; }
        .logo-text { font-size: 17px; font-weight: 700; background: linear-gradient(135deg, #14b8a6, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .card-title-area { margin-bottom: 24px; }
        .card-title { font-size: 28px; font-weight: 800; color: #f1f5f9; }
        .card-subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }

        .progress-area { margin-bottom: 24px; }
        .progress-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #14b8a6, #f97316); border-radius: 10px; transition: width 0.5s ease; }
        .progress-label { font-size: 11px; color: #475569; margin-top: 6px; display: block; text-align: right; }

        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: 12px; padding: 12px 16px; font-size: 13px; margin-bottom: 16px; }

        .form-area { display: flex; flex-direction: column; gap: 18px; }

        .input-group label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .input-wrapper { display: flex; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; transition: all 0.3s; }
        .input-group.focused .input-wrapper { border-color: rgba(20,184,166,0.6); box-shadow: 0 0 0 3px rgba(20,184,166,0.12), 0 0 20px rgba(20,184,166,0.08); }
        .input-icon { padding: 14px 12px 14px 16px; font-size: 16px; user-select: none; }
        .input-wrapper input { flex: 1; background: transparent; border: none; outline: none; color: #e2e8f0; font-size: 15px; padding: 14px 8px; font-family: 'Inter', sans-serif; }
        .input-wrapper input::placeholder { color: #1e293b; }
        .check-icon { padding-right: 14px; color: #34d399; font-size: 16px; font-weight: 700; }

        .strength-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .strength-bar { height: 3px; flex: 1; border-radius: 10px; transition: background 0.3s; }
        .strength-bar.weak { background: #ef4444; width: 33%; }
        .strength-bar.medium { background: #f59e0b; width: 66%; }
        .strength-bar.strong { background: #34d399; width: 100%; }
        .strength-text { font-size: 11px; color: #64748b; white-space: nowrap; }

        .submit-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #14b8a6, #0d9488); border: none; border-radius: 14px; cursor: pointer; color: white; font-size: 15px; font-weight: 700; font-family: 'Inter', sans-serif; box-shadow: 0 4px 30px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.15); transition: transform 0.2s, box-shadow 0.2s; margin-top: 6px; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(20,184,166,0.55); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .features-row { display: flex; gap: 10px; margin-top: 24px; justify-content: center; flex-wrap: wrap; }
        .feature-badge { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; font-size: 12px; padding: 5px 12px; border-radius: 100px; }

        .switch-auth { text-align: center; margin-top: 20px; font-size: 13px; color: #475569; }
        .switch-link { color: #f97316; font-weight: 600; text-decoration: none; transition: color 0.2s; }
        .switch-link:hover { color: #fdba74; }
      `}</style>
    </div>
  );
}
