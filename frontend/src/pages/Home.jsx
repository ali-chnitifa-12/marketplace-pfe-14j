import React, { useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const btnRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Orb floating animations
      gsap.to(orb1Ref.current, {
        x: 30, y: -20, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1
      });
      gsap.to(orb2Ref.current, {
        x: -40, y: 30, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5
      });
      gsap.to(orb3Ref.current, {
        x: 25, y: 25, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1
      });

      // Card entrance
      gsap.fromTo(cardRef.current,
        { scale: 0.85, opacity: 0, rotationY: -10 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 1, ease: 'back.out(1.5)' }
      );

      // Title animation
      gsap.fromTo(titleRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );

      // Content animation
      gsap.fromTo(contentRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'power3.out' }
      );

      // Button pop
      gsap.fromTo(btnRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, delay: 0.8, ease: 'back.out(2)' }
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
    gsap.to(card, {
      rotationY: x / 35,
      rotationX: -y / 35,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)'
    });
  };

  const handleLogout = () => {
    gsap.to(cardRef.current, { scale: 0.95, opacity: 0, duration: 0.4, ease: 'power2.in' });
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 400);
  };

  return (
    <div
      ref={containerRef}
      className="home-page"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Animated background orbs */}
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div ref={orb3Ref} className="orb orb-3" />

      {/* Grid lines background */}
      <div className="grid-bg" />

      <div ref={cardRef} className="glass-card">
        {/* Logo */}
        <div className="logo-area">
          <div className="logo-icon">📍</div>
          <span className="logo-text">Marketplace PFE</span>
        </div>

        <div ref={titleRef} className="card-title-area">
          <h1 className="card-title">Bienvenue !</h1>
          <p className="card-subtitle">Vous êtes connecté avec succès</p>
        </div>

        <div ref={contentRef} className="user-profile-section">
          <div className="profile-avatar">
            {user?.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <h2 className="user-name">{user?.nom || 'Utilisateur'}</h2>
            <p className="user-email">{user?.email || 'email@example.com'}</p>
          </div>
          <p className="status-notice">
            L'Étudiant 1 prendra le relais pour afficher la marketplace et la liste des annonces ici.
          </p>
        </div>

        <button
          ref={btnRef}
          onClick={handleLogout}
          className="logout-btn"
        >
          <span>Deconnexion ⏻</span>
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .home-page {
          min-height: 100vh;
          background: #050816;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          position: relative;
          padding: 20px;
        }

        .grid-bg {
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(20, 184, 166, 0.15) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
        }

        .orb {
          position: fixed; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%);
          top: -100px; left: -100px;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%);
          bottom: -80px; right: -60px;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(234,179,8,0.15) 0%, transparent 70%);
          top: 50%; left: 60%;
        }

        .glass-card {
          position: relative; z-index: 10;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 48px;
          width: 100%; max-width: 480px;
          box-shadow:
            0 0 0 1px rgba(20,184,166,0.15),
            0 25px 80px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.07);
          transform-style: preserve-3d;
          text-align: center;
        }

        .logo-area {
          display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 32px;
        }
        .logo-icon { font-size: 28px; }
        .logo-text {
          font-size: 17px; font-weight: 700;
          background: linear-gradient(135deg, #14b8a6, #f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .card-title-area { margin-bottom: 28px; }
        .card-title {
          font-size: 30px; font-weight: 800; color: #f1f5f9; line-height: 1.2;
        }
        .card-subtitle { font-size: 14px; color: #64748b; margin-top: 6px; }

        .user-profile-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .profile-avatar {
          width: 70px; height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #14b8a6);
          color: white;
          font-size: 28px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(249,115,22,0.3);
        }

        .user-details { text-align: center; }
        .user-name { font-size: 20px; font-weight: 700; color: #f1f5f9; }
        .user-email { font-size: 14px; color: #64748b; margin-top: 4px; }

        .status-notice {
          font-size: 12px;
          color: #475569;
          line-height: 1.6;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 14px;
          margin-top: 6px;
        }

        .logout-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none; border-radius: 14px; cursor: pointer;
          color: white; font-size: 15px; font-weight: 700;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 20px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(239,68,68,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .logout-btn:active { transform: translateY(0px); }
      `}</style>
    </div>
  );
}
