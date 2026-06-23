import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [typeCompte, setTypeCompte] = useState('acheteur');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const cardRef      = useRef(null);
  const titleRef     = useRef(null);
  const fieldsRef    = useRef([]);
  const btnRef       = useRef(null);
  const progressRef  = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: -60, y: 50, scale: 0.9, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: 50, y: -40, scale: 1.1, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
      gsap.to(orb3Ref.current, { x: -30, y: -50, scale: 1.2, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });

      gsap.fromTo(cardRef.current,
        { scale: 0.78, opacity: 0, y: 70 },
        { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.55)' }
      );
      gsap.fromTo(titleRef.current,
        { y: -25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'power3.out' }
      );
      gsap.fromTo(fieldsRef.current,
        { x: 35, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.7, ease: 'power2.out' }
      );
      gsap.fromTo(btnRef.current,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 1.2, ease: 'back.out(2)' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Animate progress bar
  useEffect(() => {
    const filled = [nom, email, password].filter(Boolean).length;
    if (progressRef.current) {
      gsap.to(progressRef.current, { width: `${(filled / 3) * 100}%`, duration: 0.5, ease: 'power2.out' });
    }
  }, [nom, email, password]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(card, { rotationY: x * 8, rotationX: -y * 8, duration: 0.5, ease: 'power2.out', transformPerspective: 900 });
  };
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const newUser = await register(nom, email, password, typeCompte);
      gsap.to(cardRef.current, { scale: 1.04, opacity: 0, y: -30, duration: 0.5, ease: 'power3.in' });
      setTimeout(() => navigate(newUser.role === 'admin' ? '/admin' : '/'), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
      gsap.fromTo(cardRef.current,
        { x: -14 },
        { x: 14, duration: 0.07, yoyo: true, repeat: 8, ease: 'linear', onComplete: () => gsap.set(cardRef.current, { x: 0 }) }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addToFields = (el) => { if (el && !fieldsRef.current.includes(el)) fieldsRef.current.push(el); };

  const getStrength = () => {
    if (!password) return null;
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };
  const strength = getStrength();

  return (
    <div ref={containerRef} className="register-page" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div ref={orb3Ref} className="orb orb-3" />
      <div className="grid-bg" />

      <div className="card-border-ring">
        <div ref={cardRef} className="glass-card">

          {/* Logo */}
          <div ref={addToFields} className="logo-area">
            <div className="logo-icon-wrap">📍</div>
            <span className="logo-text">Products Marketplace</span>
          </div>

          <div ref={titleRef} className="card-title-area">
            <h1 className="card-title">Créer un compte 🚀</h1>
            <p className="card-subtitle">Rejoins des milliers d'acheteurs et vendeurs</p>
          </div>

          {/* Progress bar */}
          <div ref={addToFields} className="progress-area">
            <div className="progress-track">
              <div ref={progressRef} className="progress-fill" style={{ width: '0%' }} />
              <div className="progress-glow" />
            </div>
            <span className="progress-label">
              {[nom, email, password].filter(Boolean).length} / 3 champs complétés
            </span>
          </div>

          {error && (
            <div ref={addToFields} className="error-box">⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} className="form-area">
            {/* Nom */}
            <div ref={addToFields} className={`input-group ${focused === 'nom' ? 'focused' : ''}`}>
              <label>Nom complet</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                  onFocus={() => setFocused('nom')} onBlur={() => setFocused('')}
                  placeholder="Votre nom complet" required />
                {nom && <span className="check-mark">✓</span>}
              </div>
              <div className="input-glow-line" />
            </div>

            {/* Email */}
            <div ref={addToFields} className={`input-group ${focused === 'email' ? 'focused' : ''}`}>
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  placeholder="vous@email.com" required />
                {email.includes('@') && <span className="check-mark">✓</span>}
              </div>
              <div className="input-glow-line" />
            </div>

            {/* Password */}
            <div ref={addToFields} className={`input-group ${focused === 'password' ? 'focused' : ''}`}>
              <label>Mot de passe</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  placeholder="••••••••" required />
                {password.length >= 6 && <span className="check-mark">✓</span>}
              </div>
              <div className="input-glow-line" />
              {password && (
                <div className="strength-row">
                  <div className={`strength-track`}>
                    <div className={`strength-fill ${strength}`} />
                  </div>
                  <span className={`strength-label ${strength}`}>
                    {strength === 'weak' ? '🔴 Faible' : strength === 'medium' ? '🟡 Moyen' : '🟢 Fort'}
                  </span>
                </div>
              )}
            </div>

            {/* Account type */}
            <div ref={addToFields} className="account-type-group">
              <label className="group-label">Type de compte</label>
              <div className="segmented-control">
                <input type="radio" name="typeCompte" id="acheteur" value="acheteur"
                  checked={typeCompte === 'acheteur'} onChange={() => setTypeCompte('acheteur')} />
                <label htmlFor="acheteur" className="segment-label">
                  <span>🛒</span> Acheteur
                </label>
                <input type="radio" name="typeCompte" id="vendeur" value="vendeur"
                  checked={typeCompte === 'vendeur'} onChange={() => setTypeCompte('vendeur')} />
                <label htmlFor="vendeur" className="segment-label">
                  <span>🏷️</span> Vendeur
                </label>
                <div className={`segment-indicator ${typeCompte === 'vendeur' ? 'right' : ''}`} />
              </div>
            </div>

            <button ref={btnRef} type="submit" disabled={isLoading} className="submit-btn">
              {isLoading
                ? <span className="loading-inner"><span className="loader-ring" /> Création...</span>
                : <span className="btn-inner">S'inscrire gratuitement <span className="btn-arrow">→</span></span>
              }
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
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .register-page {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; overflow: hidden; position: relative; padding: 20px;
        }
        .grid-bg { position: fixed; inset: 0; background-image: radial-gradient(var(--grid-dots) 1px, transparent 1px); background-size: 32px 32px; pointer-events: none; z-index: 0; }
        .orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 580px; height: 580px; background: radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%); top: -140px; right: -120px; }
        .orb-2 { width: 450px; height: 450px; background: radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%); bottom: -110px; left: -90px; }
        .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%); top: 42%; left: 18%; }

        .card-border-ring {
          position: relative; z-index: 10;
          width: 100%; max-width: 480px; border-radius: 30px; padding: 2px;
          background: conic-gradient(from var(--angle, 0deg), #14b8a6, #a78bfa, #f97316, #14b8a6);
          animation: rotateBorder 5s linear infinite;
          box-shadow: 0 0 40px rgba(20,184,166,0.12), 0 30px 80px rgba(0,0,0,0.3);
        }
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotateBorder { to { --angle: 360deg; } }

        .glass-card {
          background: rgba(5,8,22,0.93); backdrop-filter: blur(30px);
          border-radius: 28px; padding: 44px;
          transform-style: preserve-3d; position: relative; overflow: hidden;
        }
        .light-mode .glass-card { background: rgba(248,250,252,0.95); }

        .logo-area { display: flex; align-items: center; gap: 10px; margin-bottom: 26px; }
        .logo-icon-wrap { width: 36px; height: 36px; border-radius: 11px; background: linear-gradient(135deg, rgba(20,184,166,0.2), rgba(249,115,22,0.15)); display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 0 18px rgba(20,184,166,0.15); }
        .logo-text { font-size: 15px; font-weight: 800; letter-spacing: -0.02em; background: linear-gradient(135deg, #14b8a6, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .card-title-area { margin-bottom: 24px; }
        .card-title { font-size: 26px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.03em; }
        .card-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 6px; }

        .progress-area { margin-bottom: 22px; }
        .progress-track { height: 4px; background: var(--card-border); border-radius: 10px; overflow: hidden; position: relative; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #14b8a6, #f97316); border-radius: 10px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }
        .progress-label { font-size: 11px; color: var(--text-secondary); margin-top: 6px; display: block; text-align: right; }

        .error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; border-radius: 12px; padding: 12px 16px; font-size: 13px; margin-bottom: 18px; }

        .form-area { display: flex; flex-direction: column; gap: 18px; }

        .input-group { position: relative; }
        .input-group label { display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 7px; transition: color 0.3s; }
        .input-group.focused label { color: #14b8a6; }
        .input-wrapper { display: flex; align-items: center; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 13px; overflow: hidden; transition: all 0.35s; }
        .input-group.focused .input-wrapper { border-color: rgba(20,184,166,0.5); background: var(--input-focus-bg); box-shadow: 0 0 0 3px rgba(20,184,166,0.1), 0 0 25px rgba(20,184,166,0.05); }
        .input-icon { padding: 0 10px 0 14px; color: var(--text-secondary); transition: color 0.3s; }
        .input-group.focused .input-icon { color: #14b8a6; }
        .input-wrapper input { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 15px; padding: 14px 14px 14px 0; font-family: 'Inter', sans-serif; }
        .input-wrapper input::placeholder { color: var(--text-secondary); opacity: 0.5; }
        .check-mark { padding-right: 12px; color: #10b981; font-size: 14px; font-weight: 700; }
        .input-glow-line { height: 2px; border-radius: 2px; background: linear-gradient(90deg, #14b8a6, #f97316); transform: scaleX(0); transform-origin: left; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); margin-top: 2px; }
        .input-group.focused .input-glow-line { transform: scaleX(1); }

        .strength-row { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
        .strength-track { flex: 1; height: 3px; background: var(--card-border); border-radius: 10px; overflow: hidden; }
        .strength-fill { height: 100%; border-radius: 10px; transition: width 0.4s ease, background 0.4s ease; }
        .strength-fill.weak   { width: 33%; background: #ef4444; }
        .strength-fill.medium { width: 66%; background: #f59e0b; }
        .strength-fill.strong { width: 100%; background: #10b981; }
        .strength-label { font-size: 11px; white-space: nowrap; }
        .strength-label.weak   { color: #ef4444; }
        .strength-label.medium { color: #f59e0b; }
        .strength-label.strong { color: #10b981; }

        .group-label { display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .segmented-control { display: flex; position: relative; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 12px; padding: 4px; }
        .segmented-control input[type="radio"] { display: none; }
        .segment-label { flex: 1; text-align: center; padding: 11px 8px; font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; position: relative; z-index: 2; transition: color 0.3s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .segmented-control input[type="radio"]:checked + .segment-label { color: var(--text-primary); font-weight: 700; }
        .segment-indicator { position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); background: linear-gradient(135deg, rgba(20,184,166,0.2), rgba(20,184,166,0.05)); border: 1px solid rgba(20,184,166,0.35); border-radius: 8px; z-index: 1; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s; }
        .segment-indicator.right { transform: translateX(100%); background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05)); border-color: rgba(249,115,22,0.35); }

        .submit-btn { position: relative; overflow: hidden; width: 100%; padding: 16px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #f97316 100%); background-size: 200% 200%; border: none; border-radius: 14px; cursor: pointer; color: white; font-size: 15px; font-weight: 700; font-family: 'Inter', sans-serif; box-shadow: 0 4px 30px rgba(20,184,166,0.35), inset 0 1px 0 rgba(255,255,255,0.15); transition: background-position 0.5s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s; margin-top: 6px; }
        .submit-btn:hover:not(:disabled) { background-position: right center; transform: translateY(-3px); box-shadow: 0 10px 40px rgba(20,184,166,0.5); }
        .submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-arrow { display: inline-block; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .submit-btn:hover .btn-arrow { transform: translateX(5px); }
        .loading-inner { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .loader-ring { display: inline-block; width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; animation: spin 0.7s linear infinite; }

        .features-row { display: flex; gap: 8px; margin-top: 22px; justify-content: center; flex-wrap: wrap; }
        .feature-badge { background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text-secondary); font-size: 12px; padding: 5px 12px; border-radius: 100px; transition: all 0.2s; }
        .feature-badge:hover { border-color: var(--card-border-light); color: var(--text-primary); }

        .switch-auth { text-align: center; margin-top: 18px; font-size: 13px; color: var(--text-secondary); }
        .switch-link { color: #f97316; font-weight: 700; text-decoration: none; transition: color 0.2s; }
        .switch-link:hover { color: #fb923c; }
      `}</style>
    </div>
  );
}
