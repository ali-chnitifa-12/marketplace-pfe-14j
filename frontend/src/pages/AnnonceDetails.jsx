import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';

export default function AnnonceDetails() {
  const { id } = useParams();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/annonces/${id}`);
        setAnnonce(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Annonce introuvable');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonce();
  }, [id]);

  useEffect(() => {
    if (!loading && annonce) {
      const ctx = gsap.context(() => {
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, annonce]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="details-page loading-center">
        <div className="grid-bg" />
        <span className="spinner">⟳</span> Chargement...
      </div>
    );
  }

  if (error || !annonce) {
    return (
      <div className="details-page error-center">
        <div className="grid-bg" />
        <div className="error-box">⚠️ {error}</div>
        <Link to="/" className="back-btn">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="details-page">
      <div className="grid-bg" />
      
      <div className="details-nav">
        <Link to="/" className="back-link">← Retour au catalogue</Link>
      </div>

      <div ref={contentRef} className="details-content">
        <div className="details-image-section">
          {annonce.images && annonce.images.length > 0 ? (
            <img src={annonce.images[0]} alt={annonce.titre} className="main-image" />
          ) : (
            <div className="no-image-large">
              <span className="no-image-icon">📷</span>
              <p>Pas d'image disponible</p>
            </div>
          )}
        </div>

        <div className="details-info-section">
          <div className="info-header">
            <span className="badge-category">{annonce.categorie}</span>
            <span className="badge-etat">{annonce.etat}</span>
          </div>

          <h1 className="details-title">{annonce.titre}</h1>
          <div className="details-price">{annonce.prix.toFixed(2)} DH</div>

          <div className="details-seller-card">
            <div className="seller-avatar">{getInitials(annonce.User?.nom)}</div>
            <div className="seller-info">
              <h4>{annonce.User?.nom}</h4>
              <p>Vendeur vérifié</p>
            </div>
            {/* Placeholder pour l'Étudiant 4 (Négociation & WhatsApp) */}
            <button className="contact-btn" disabled title="Bientôt disponible (Étudiant 4)">
              <span>💬</span> Contacter
            </button>
          </div>

          <div className="details-description">
            <h3>Description du produit</h3>
            <p>{annonce.description}</p>
          </div>

          <div className="details-meta">
            <p>Publié le : {new Date(annonce.createdAt).toLocaleDateString('fr-FR')}</p>
            <p>Référence : #{annonce.id}</p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .details-page {
          min-height: 100vh; background: #050816; font-family: 'Inter', sans-serif;
          color: #f1f5f9; padding: 40px 20px; position: relative;
        }
        .grid-bg {
          position: fixed; inset: 0; background-image: radial-gradient(rgba(20,184,166,0.08) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none; z-index: 0;
        }
        .loading-center, .error-center { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .spinner { font-size: 24px; display: inline-block; animation: spin 1s linear infinite; margin-bottom: 10px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .details-nav { max-width: 1000px; margin: 0 auto 30px; position: relative; z-index: 10; }
        .back-link { color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .back-link:hover { color: #f1f5f9; }

        .details-content {
          max-width: 1000px; margin: 0 auto; position: relative; z-index: 10;
          display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
          background: rgba(255,255,255,0.02); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 32px;
        }

        .details-image-section { border-radius: 16px; overflow: hidden; background: rgba(0,0,0,0.3); aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; }
        .main-image { width: 100%; height: 100%; object-fit: cover; }
        .no-image-large { text-align: center; color: #475569; }
        .no-image-large .no-image-icon { font-size: 64px; opacity: 0.3; display: block; margin-bottom: 10px; }

        .info-header { display: flex; gap: 10px; margin-bottom: 16px; }
        .badge-category { background: rgba(249,115,22,0.15); color: #fdba74; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge-etat { background: rgba(20,184,166,0.15); color: #5eead4; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; }

        .details-title { font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
        .details-price { font-size: 28px; font-weight: 900; color: #2dd4bf; margin-bottom: 32px; }

        .details-seller-card {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          padding: 16px; border-radius: 16px; margin-bottom: 32px;
        }
        .seller-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #14b8a6); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; }
        .seller-info { flex: 1; }
        .seller-info h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .seller-info p { font-size: 12px; color: #94a3b8; }
        .contact-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8;
          padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: not-allowed;
          display: flex; align-items: center; gap: 8px;
        }

        .details-description h3 { font-size: 16px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; margin-bottom: 16px; }
        .details-description p { font-size: 15px; color: #cbd5e1; line-height: 1.6; white-space: pre-wrap; margin-bottom: 32px; }

        .details-meta { font-size: 12px; color: #64748b; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; }

        @media (max-width: 800px) {
          .details-content { grid-template-columns: 1fr; gap: 24px; padding: 20px; }
          .details-title { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
