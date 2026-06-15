import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const titleRef = useRef(null);
  const fieldsRef = useRef([]);
  const btnRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  const addToFields = (el) => {
    if (el && !fieldsRef.current.includes(el)) fieldsRef.current.push(el);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: 30, y: -20, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -40, y: 30, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.7 });
      gsap.to(orb3Ref.current, { x: 20, y: 20, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });

      gsap.fromTo(cardRef.current,
        { scale: 0.85, opacity: 0, rotationY: -12 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 1, ease: 'back.out(1.7)' }
      );
      gsap.fromTo(titleRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );
      gsap.fromTo(fieldsRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo(btnRef.current,
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.9, ease: 'back.out(2)' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(card, { rotationY: x / 32, rotationX: -y / 32, duration: 0.5, ease: 'power2.out', transformPerspective: 1000 });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setStatus('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setStatus('success');
      setMessage(res.data.message);
      gsap.fromTo(cardRef.current,
        { borderColor: 'rgba(52,211,153,0.2)' },
        { borderColor: 'rgba(52,211,153,0.6)', duration: 0.4, yoyo: true, repeat: 3 }
      );
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Une erreur est survenue.');
      gsap.fromTo(cardRef.current,
        { x: -12 },
        { x: 12, duration: 0.08, yoyo: true, repeat: 7, ease: 'linear', onComplete: () => gsap.set(cardRef.current, { x: 0 }) }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="fp-page" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div ref={orb3Ref} className="orb orb-3" />
      <div className="grid-bg" />

      <div ref={cardRef} className="glass-card">
        {/* Logo */}
        <div ref={addToFields} className="logo-area">
          <div className="logo-icon">🛒</div>
          <span className="logo-text">Marketplace PFE</span>
        </div>

        {/* Icon */}
        <div ref={titleRef} className="lock-icon-area">
          <div className="lock-circle">🔐</div>
          <h1 className="card-title">Mot de passe oublié ?</h1>
          <p className="card-subtitle">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {/* Feedback message */}
        {message && (
          <div ref={addToFields} className={status === 'success' ? 'success-box' : 'error-box'}>
            {status === 'success' ? '✅' : '⚠️'} {message}
          </div>
        )}

        {/* Form (hidden after success) */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="form-area">
            <div ref={addToFields} className={`input-group ${focused ? 'focused' : ''}`}>
              <label>Adresse email</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="vous@email.com"
                  required
                />
              </div>
            </div>

            <button ref={btnRef} type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? '⟳ Envoi en cours...' : 'Envoyer le lien →'}
            </button>
          </form>
        )}

        <div ref={addToFields} className="switch-auth">
          <Link to="/login" className="switch-link">← Retour à la connexion</Link>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-page {
          min-height: 100vh; background: #050816;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; overflow: hidden;
          position: relative; padding: 20px;
        }

        .grid-bg {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
          background-size: 50px 50px; pointer-events: none;
        }

        .orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%); top: -100px; left: -100px; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%); bottom: -80px; right: -60px; }
        .orb-3 { width: 280px; height: 280px; background: radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%); top: 40%; left: 55%; }

        .glass-card {
          position: relative; z-index: 10;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px; padding: 48px;
          width: 100%; max-width: 460px;
          box-shadow: 0 0 0 1px rgba(124,58,237,0.15), 0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
          transform-style: preserve-3d;
        }

        .logo-area { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .logo-icon { font-size: 26px; }
        .logo-text { font-size: 16px; font-weight: 700; background: linear-gradient(135deg, #a78bfa, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        .lock-icon-area { text-align: center; margin-bottom: 28px; }
        .lock-circle { font-size: 48px; margin-bottom: 16px; }
        .card-title { font-size: 26px; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }
        .card-subtitle { font-size: 14px; color: #64748b; line-height: 1.6; }

        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: 12px; padding: 12px 16px; font-size: 13px; margin-bottom: 16px; }
        .success-box { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); color: #6ee7b7; border-radius: 12px; padding: 12px 16px; font-size: 13px; margin-bottom: 16px; }

        .form-area { display: flex; flex-direction: column; gap: 20px; }

        .input-group label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }
        .input-wrapper { display: flex; align-items: center; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; overflow: hidden; transition: border-color 0.3s, box-shadow 0.3s; }
        .input-group.focused .input-wrapper { border-color: rgba(124,58,237,0.6); box-shadow: 0 0 0 3px rgba(124,58,237,0.12), 0 0 20px rgba(124,58,237,0.1); }
        .input-icon { padding: 14px 14px 14px 18px; font-size: 16px; }
        .input-wrapper input { flex: 1; background: transparent; border: none; outline: none; color: #e2e8f0; font-size: 15px; padding: 14px 18px 14px 0; font-family: 'Inter', sans-serif; }
        .input-wrapper input::placeholder { color: #334155; }

        .submit-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #7c3aed, #6d28d9); border: none; border-radius: 14px; cursor: pointer; color: white; font-size: 15px; font-weight: 700; font-family: 'Inter', sans-serif; box-shadow: 0 4px 25px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15); transition: transform 0.2s, box-shadow 0.2s; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 35px rgba(124,58,237,0.55); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .switch-auth { text-align: center; margin-top: 24px; font-size: 13px; }
        .switch-link { color: #a78bfa; font-weight: 600; text-decoration: none; transition: color 0.2s; }
        .switch-link:hover { color: #c4b5fd; }
      `}</style>
    </div>
  );
}
