import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate   = useNavigate();
  const [motDePasse, setMotDePasse] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [showPass, setShowPass] = useState(false);
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const fieldsRef = useRef([]);
  const btnRef = useRef(null);
  const addToFields = (el) => { if (el && !fieldsRef.current.includes(el)) fieldsRef.current.push(el); };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: 40, y: -30, scale: 1.1, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -50, y: 40, scale: 0.9, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.8 });
      gsap.fromTo(cardRef.current, { scale: 0.82, opacity: 0, y: 50 }, { scale: 1, opacity: 1, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.55)' });
      gsap.fromTo(fieldsRef.current, { x: -25, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.6, ease: 'power2.out' });
      gsap.fromTo(btnRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 1, ease: 'back.out(2)' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(card, { rotationY: x * 9, rotationX: -y * 9, duration: 0.5, ease: 'power2.out', transformPerspective: 900 });
  };
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  };

  const getStrength = () => {
    if (!motDePasse) return null;
    if (motDePasse.length < 6) return 'weak';
    if (motDePasse.length < 10 || !/[A-Z]/.test(motDePasse) || !/[0-9]/.test(motDePasse)) return 'medium';
    return 'strong';
  };
  const strength = getStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (motDePasse !== confirm) {
      setStatus('error'); setMessage('Les mots de passe ne correspondent pas.');
      gsap.fromTo(cardRef.current, { x: -12 }, { x: 12, duration: 0.07, yoyo: true, repeat: 8, ease: 'linear', onComplete: () => gsap.set(cardRef.current, { x: 0 }) });
      return;
    }
    if (motDePasse.length < 6) { setStatus('error'); setMessage('Au moins 6 caractères.'); return; }
    setIsLoading(true); setMessage(''); setStatus('');
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { motDePasse });
      setStatus('success'); setMessage(res.data.message);
      gsap.to(cardRef.current, { scale: 1.02, duration: 0.3 });
      setTimeout(() => { gsap.to(cardRef.current, { scale: 0.95, opacity: 0, duration: 0.4, ease: 'power2.in' }); setTimeout(() => navigate('/login'), 400); }, 2500);
    } catch (err) {
      setStatus('error'); setMessage(err.response?.data?.message || 'Token invalide ou expiré.');
      gsap.fromTo(cardRef.current, { x: -12 }, { x: 12, duration: 0.07, yoyo: true, repeat: 8, ease: 'linear', onComplete: () => gsap.set(cardRef.current, { x: 0 }) });
    } finally { setIsLoading(false); }
  };

  return (
    <div ref={containerRef} className="rp-page" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div className="grid-bg" />
      <div className="card-border-ring">
        <div ref={cardRef} className="glass-card">
          <div ref={addToFields} className="logo-area">
            <div className="logo-icon-wrap">📍</div>
            <span className="logo-text">Products Marketplace</span>
          </div>
          <div ref={addToFields} className="header-area">
            <div className="shield-icon">🛡️</div>
            <h1 className="card-title">Nouveau mot de passe</h1>
            <p className="card-subtitle">Choisissez un mot de passe sécurisé pour votre compte.</p>
          </div>
          {message && (
            <div ref={addToFields} className={status === 'success' ? 'success-box' : 'error-box'}>
              {status === 'success' ? '✅' : '⚠️'} {message}
              {status === 'success' && <span style={{color:'#94a3b8',fontSize:'12px'}}> Redirection...</span>}
            </div>
          )}
          {status !== 'success' && (
            <form onSubmit={handleSubmit} className="form-area">
              <div ref={addToFields} className={`input-group ${focused === 'pass' ? 'focused' : ''}`}>
                <label>Nouveau mot de passe</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input type={showPass ? 'text' : 'password'} value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                    placeholder="••••••••" required />
                  <button type="button" className="toggle-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                <div className="input-glow-line" />
                {strength && (
                  <div className="strength-row">
                    <div className="strength-track"><div className={`strength-fill ${strength}`} /></div>
                    <span className={`strength-label ${strength}`}>
                      {strength === 'weak' ? '🔴 Faible' : strength === 'medium' ? '🟡 Moyen' : '🟢 Fort'}
                    </span>
                  </div>
                )}
              </div>
              <div ref={addToFields} className={`input-group ${focused === 'confirm' ? 'focused' : ''}`}>
                <label>Confirmer</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔑</span>
                  <input type={showPass ? 'text' : 'password'} value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                    placeholder="••••••••" required />
                  {confirm && (
                    <span style={{paddingRight:'12px',fontSize:'14px',fontWeight:700,color:motDePasse===confirm?'#10b981':'#ef4444'}}>
                      {motDePasse === confirm ? '✓' : '✗'}
                    </span>
                  )}
                </div>
                <div className="input-glow-line" />
              </div>
              <button ref={btnRef} type="submit" disabled={isLoading} className="submit-btn">
                {isLoading
                  ? <span className="loading-inner"><span className="loader-ring" /> Réinitialisation...</span>
                  : <span className="btn-inner">Réinitialiser <span className="btn-arrow">→</span></span>
                }
              </button>
            </form>
          )}
          <div ref={addToFields} className="switch-auth">
            <Link to="/login" className="switch-link">← Retour à la connexion</Link>
          </div>
        </div>
      </div>
      <style>{`
        .rp-page { min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; overflow:hidden; position:relative; padding:20px; }
        .grid-bg { position:fixed; inset:0; background-image:radial-gradient(var(--grid-dots) 1px,transparent 1px); background-size:32px 32px; pointer-events:none; z-index:0; }
        .orb { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
        .orb-1 { width:500px; height:500px; background:radial-gradient(circle,rgba(20,184,166,0.2) 0%,transparent 70%); top:-120px; left:-110px; }
        .orb-2 { width:420px; height:420px; background:radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%); bottom:-90px; right:-70px; }
        .card-border-ring { position:relative; z-index:10; width:100%; max-width:460px; border-radius:30px; padding:2px; background:conic-gradient(from var(--angle,0deg),#14b8a6,#f97316,#a78bfa,#14b8a6); animation:rotateBorder 5s linear infinite; box-shadow:0 0 40px rgba(20,184,166,0.12),0 30px 80px rgba(0,0,0,0.3); }
        @property --angle { syntax:'<angle>'; initial-value:0deg; inherits:false; }
        @keyframes rotateBorder { to { --angle:360deg; } }
        .glass-card { background:rgba(5,8,22,0.93); backdrop-filter:blur(30px); border-radius:28px; padding:48px; transform-style:preserve-3d; position:relative; overflow:hidden; }
        .light-mode .glass-card { background:rgba(248,250,252,0.95); }
        .logo-area { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
        .logo-icon-wrap { width:36px; height:36px; border-radius:11px; background:linear-gradient(135deg,rgba(20,184,166,0.2),rgba(249,115,22,0.15)); display:flex; align-items:center; justify-content:center; font-size:18px; }
        .logo-text { font-size:15px; font-weight:800; background:linear-gradient(135deg,#14b8a6,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .header-area { text-align:center; margin-bottom:28px; }
        .shield-icon { font-size:46px; display:block; margin-bottom:14px; animation:breathe 3s ease-in-out infinite; }
        .card-title { font-size:26px; font-weight:900; color:var(--text-primary); letter-spacing:-0.03em; }
        .card-subtitle { font-size:14px; color:var(--text-secondary); margin-top:6px; line-height:1.6; }
        .error-box { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); color:#fca5a5; border-radius:12px; padding:12px 16px; font-size:13px; margin-bottom:18px; }
        .success-box { background:rgba(52,211,153,0.08); border:1px solid rgba(52,211,153,0.25); color:#6ee7b7; border-radius:12px; padding:12px 16px; font-size:13px; margin-bottom:18px; }
        .form-area { display:flex; flex-direction:column; gap:20px; }
        .input-group { position:relative; }
        .input-group label { display:block; font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px; transition:color 0.3s; }
        .input-group.focused label { color:#14b8a6; }
        .input-wrapper { display:flex; align-items:center; background:var(--input-bg); border:1px solid var(--input-border); border-radius:13px; overflow:hidden; transition:all 0.35s; }
        .input-group.focused .input-wrapper { border-color:rgba(20,184,166,0.5); background:var(--input-focus-bg); box-shadow:0 0 0 3px rgba(20,184,166,0.1); }
        .input-icon { padding:0 10px 0 14px; font-size:16px; }
        .input-wrapper input { flex:1; background:transparent; border:none; outline:none; color:var(--text-primary); font-size:15px; padding:15px 0; font-family:'Inter',sans-serif; }
        .input-wrapper input::placeholder { color:var(--text-secondary); opacity:0.5; }
        .toggle-btn { background:none; border:none; cursor:pointer; font-size:16px; padding:0 14px; }
        .input-glow-line { height:2px; border-radius:2px; background:linear-gradient(90deg,#14b8a6,#f97316); transform:scaleX(0); transform-origin:left; transition:transform 0.4s cubic-bezier(0.4,0,0.2,1); margin-top:2px; }
        .input-group.focused .input-glow-line { transform:scaleX(1); }
        .strength-row { display:flex; align-items:center; gap:10px; margin-top:8px; }
        .strength-track { flex:1; height:3px; background:var(--card-border); border-radius:10px; overflow:hidden; }
        .strength-fill { height:100%; border-radius:10px; transition:width 0.4s ease,background 0.4s ease; }
        .strength-fill.weak { width:33%; background:#ef4444; }
        .strength-fill.medium { width:66%; background:#f59e0b; }
        .strength-fill.strong { width:100%; background:#10b981; }
        .strength-label { font-size:11px; white-space:nowrap; }
        .strength-label.weak { color:#ef4444; } .strength-label.medium { color:#f59e0b; } .strength-label.strong { color:#10b981; }
        .submit-btn { position:relative; overflow:hidden; width:100%; padding:16px; background:linear-gradient(135deg,#14b8a6,#0d9488); border:none; border-radius:14px; cursor:pointer; color:white; font-size:15px; font-weight:700; font-family:'Inter',sans-serif; box-shadow:0 4px 30px rgba(20,184,166,0.35),inset 0 1px 0 rgba(255,255,255,0.15); transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-3px); box-shadow:0 10px 40px rgba(20,184,166,0.5); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .btn-inner { display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-arrow { display:inline-block; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .submit-btn:hover .btn-arrow { transform:translateX(5px); }
        .loading-inner { display:flex; align-items:center; justify-content:center; gap:10px; }
        .loader-ring { display:inline-block; width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:white; animation:spin 0.7s linear infinite; }
        .switch-auth { text-align:center; margin-top:26px; font-size:13px; }
        .switch-link { color:#14b8a6; font-weight:700; text-decoration:none; transition:color 0.2s; }
        .switch-link:hover { color:#2dd4bf; }
      `}</style>
    </div>
  );
}
