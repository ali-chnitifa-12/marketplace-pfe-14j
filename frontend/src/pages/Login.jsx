import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [typewriterDone, setTypewriterDone] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const cardRef     = useRef(null);
  const titleRef    = useRef(null);
  const fieldsRef   = useRef([]);
  const btnRef      = useRef(null);
  const orb1Ref     = useRef(null);
  const orb2Ref     = useRef(null);
  const orb3Ref     = useRef(null);
  const borderRef   = useRef(null);

  /* ─── Entrance Animations ─── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: 50, y: -40, scale: 1.1, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -60, y: 50, scale: 0.9, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      gsap.to(orb3Ref.current, { x: 40, y: 35, scale: 1.2, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });

      gsap.fromTo(cardRef.current,
        { scale: 0.75, opacity: 0, y: 60, rotationX: -10 },
        { scale: 1, opacity: 1, y: 0, rotationX: 0, duration: 1.1, ease: 'elastic.out(1, 0.55)', transformPerspective: 1000 }
      );
      gsap.fromTo(titleRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'power3.out' }
      );
      gsap.fromTo(fieldsRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.7, ease: 'power2.out' }
      );
      gsap.fromTo(btnRef.current,
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 1.1, ease: 'back.out(2)' }
      );

      // Animated gradient border — rotate conic gradient
      gsap.to(borderRef.current, {
        '--angle': '360deg',
        duration: 4,
        ease: 'none',
        repeat: -1,
        modifiers: {
          '--angle': v => `${parseFloat(v) % 360}deg`
        }
      });
    }, containerRef);

    // Typewriter trigger
    setTimeout(() => setTypewriterDone(true), 1400);
    return () => ctx.revert();
  }, []);

  /* ─── 3D Card Tilt ─── */
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(card, {
      rotationY: x * 10, rotationX: -y * 10,
      duration: 0.5, ease: 'power2.out', transformPerspective: 900,
    });
  };
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  };

  /* ─── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const loggedUser = await login(email, password);
      gsap.to(cardRef.current, { scale: 1.04, opacity: 0, y: -30, duration: 0.5, ease: 'power3.in' });
      setTimeout(() => navigate(loggedUser.role === 'admin' ? '/admin' : '/'), 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
      // Error shake + red glow
      gsap.fromTo(cardRef.current,
        { x: -14 },
        { x: 14, duration: 0.07, yoyo: true, repeat: 8, ease: 'linear',
          onComplete: () => gsap.set(cardRef.current, { x: 0 }) }
      );
      gsap.fromTo(cardRef.current,
        { boxShadow: '0 0 0 1px rgba(239,68,68,0.3)' },
        { boxShadow: '0 0 40px rgba(239,68,68,0.4)', duration: 0.3, yoyo: true, repeat: 3 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addToFields = (el) => { if (el && !fieldsRef.current.includes(el)) fieldsRef.current.push(el); };

  return (
    <div ref={containerRef} className="login-page" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div ref={orb3Ref} className="orb orb-3" />
      <div className="grid-bg" />

      {/* Animated gradient border wrapper */}
      <div ref={borderRef} className="card-border-ring">
        <div ref={cardRef} className="glass-card">

          {/* Logo */}
          <div ref={addToFields} className="logo-area">
            <div className="logo-icon-wrap">📍</div>
            <span className="logo-text">Products Marketplace</span>
          </div>

          {/* Title */}
          <div ref={titleRef} className="card-title-area">
            <h1 className="card-title">Content de te revoir 👋</h1>
            <p className={`card-subtitle typewriter ${typewriterDone ? 'done' : ''}`}>
              Connecte-toi pour continuer ton aventure
            </p>
          </div>

          {error && (
            <div ref={addToFields} className="error-box">
              <span className="error-icon">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-area">
            {/* Email */}
            <div ref={addToFields} className={`input-group ${focused === 'email' ? 'focused' : ''}`}>
              <label>Email</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  placeholder="vous@email.com" required
                />
                {email.includes('@') && <span className="check-mark">✓</span>}
              </div>
              <div className="input-glow-line" />
            </div>

            {/* Password */}
            <div ref={addToFields} className={`input-group ${focused === 'password' ? 'focused' : ''}`}>
              <label>Mot de passe</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  placeholder="••••••••" required
                />
              </div>
              <div className="input-glow-line" />
            </div>

            <div ref={addToFields} className="forgot-row">
              <Link to="/forgot-password" className="forgot-link">Mot de passe oublié ?</Link>
            </div>

            <button ref={btnRef} type="submit" disabled={isLoading} className="submit-btn">
              {isLoading
                ? <span className="loading-inner"><span className="loader-ring" /> Connexion...</span>
                : <span className="btn-inner">Se connecter <span className="btn-arrow">→</span></span>
              }
              <div className="btn-liquid" />
            </button>
          </form>

          <div ref={addToFields} className="switch-auth">
            Pas de compte ?{' '}
            <Link to="/register" className="switch-link">Inscris-toi gratuitement</Link>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .login-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif;
          overflow: hidden; position: relative; padding: 20px;
        }
        .grid-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(var(--grid-dots) 1px, transparent 1px);
          background-size: 32px 32px; pointer-events: none; z-index: 0;
        }
        .orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 550px; height: 550px; background: radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%); top: -130px; left: -130px; }
        .orb-2 { width: 450px; height: 450px; background: radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%); bottom: -100px; right: -80px; }
        .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%); top: 45%; left: 58%; }

        /* Animated rotating border ring */
        .card-border-ring {
          position: relative; z-index: 10;
          width: 100%; max-width: 470px;
          border-radius: 30px; padding: 2px;
          background: conic-gradient(
            from var(--angle, 0deg),
            #f97316 0deg, #14b8a6 90deg, #a78bfa 180deg, #f97316 360deg
          );
          animation: rotateBorder 4s linear infinite;
          box-shadow: 0 0 40px rgba(249,115,22,0.15), 0 30px 80px rgba(0,0,0,0.3);
        }
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes rotateBorder {
          to { --angle: 360deg; }
        }

        .glass-card {
          background: rgba(5,8,22,0.92);
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          border-radius: 28px; padding: 48px;
          width: 100%;
          transform-style: preserve-3d;
          position: relative; overflow: hidden;
        }
        .light-mode .glass-card { background: rgba(248,250,252,0.95); }

        /* Subtle inner shimmer */
        .glass-card::before {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
          animation: shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }

        .logo-area { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
        .logo-icon-wrap {
          width: 38px; height: 38px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(249,115,22,0.2), rgba(20,184,166,0.15));
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 20px rgba(249,115,22,0.15);
        }
        .logo-text {
          font-size: 16px; font-weight: 800; letter-spacing: -0.02em;
          background: linear-gradient(135deg, #f97316, #14b8a6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .card-title-area { margin-bottom: 32px; }
        .card-title { font-size: 28px; font-weight: 900; color: var(--text-primary); letter-spacing: -0.03em; line-height: 1.2; }
        
        /* Typewriter effect */
        .card-subtitle {
          font-size: 14px; color: var(--text-secondary); margin-top: 8px;
          overflow: hidden; white-space: nowrap; width: 0;
          border-right: 2px solid var(--accent-orange);
          animation: typewriter 0.8s steps(40) 0.8s forwards, cursorBlink 0.8s step-end infinite;
        }
        .card-subtitle.done {
          width: 100%; border-right-color: transparent;
          animation: none;
        }

        .error-box {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #fca5a5; border-radius: 12px; padding: 12px 16px;
          font-size: 13px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
          animation: slideDown 0.3s ease-out;
        }
        .error-icon { font-size: 16px; }

        .form-area { display: flex; flex-direction: column; gap: 20px; }

        .input-group { position: relative; }
        .input-group label {
          display: block; font-size: 11px; font-weight: 700;
          color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 8px; transition: color 0.3s;
        }
        .input-group.focused label { color: #f97316; }

        .input-wrapper {
          display: flex; align-items: center; position: relative;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 14px; overflow: hidden;
          transition: border-color 0.35s, background 0.35s, box-shadow 0.35s;
        }
        .input-group.focused .input-wrapper {
          border-color: rgba(249,115,22,0.5);
          background: var(--input-focus-bg);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1), 0 0 25px rgba(249,115,22,0.06);
        }
        .input-icon {
          padding: 0 12px 0 16px; color: var(--text-secondary);
          transition: color 0.3s;
        }
        .input-group.focused .input-icon { color: #f97316; }
        .input-wrapper input {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text-primary); font-size: 15px; padding: 15px 16px 15px 0;
          font-family: 'Inter', sans-serif;
        }
        .input-wrapper input::placeholder { color: var(--text-secondary); opacity: 0.5; }
        .check-mark { padding-right: 14px; color: #10b981; font-size: 15px; font-weight: 700; }

        /* Slide-in underline glow on focus */
        .input-glow-line {
          height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #f97316, #14b8a6);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 2px;
        }
        .input-group.focused .input-glow-line { transform: scaleX(1); }

        .forgot-row { text-align: right; }
        .forgot-link { font-size: 13px; color: #f97316; text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .forgot-link:hover { color: #fb923c; }

        /* Liquid animated submit button */
        .submit-btn {
          position: relative; overflow: hidden;
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #14b8a6 100%);
          background-size: 200% 200%;
          border: none; border-radius: 14px; cursor: pointer;
          color: white; font-size: 15px; font-weight: 700;
          font-family: 'Inter', sans-serif; letter-spacing: -0.01em;
          box-shadow: 0 4px 30px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: background-position 0.5s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-3px);
          box-shadow: 0 10px 40px rgba(249,115,22,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; z-index: 1; }
        .btn-arrow { display: inline-block; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .submit-btn:hover .btn-arrow { transform: translateX(4px); }

        .loading-inner { display: flex; align-items: center; justify-content: center; gap: 10px; position: relative; z-index: 1; }
        .loader-ring {
          display: inline-block; width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
          animation: spin 0.7s linear infinite;
        }

        /* Liquid ripple on hover */
        .btn-liquid {
          position: absolute; inset: 0; border-radius: 14px;
          background: radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.15), transparent 60%);
          pointer-events: none; opacity: 0; transition: opacity 0.3s;
        }
        .submit-btn:hover .btn-liquid { opacity: 1; }

        .switch-auth { text-align: center; margin-top: 28px; font-size: 13px; color: var(--text-secondary); }
        .switch-link { color: #14b8a6; font-weight: 700; text-decoration: none; transition: color 0.2s; }
        .switch-link:hover { color: #2dd4bf; }
      `}</style>
    </div>
  );
}
