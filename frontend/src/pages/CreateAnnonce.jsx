import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function CreateAnnonce() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [etat, setEtat] = useState('Bon état');
  const [categorie, setCategorie] = useState('Électronique');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    // Rediriger si pas vendeur (protection côté client)
    if (user?.typeCompte !== 'vendeur' && user?.role !== 'admin') {
      navigate('/');
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { scale: 0.9, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/annonces', {
        titre,
        description,
        prix: parseFloat(prix),
        etat,
        categorie,
        images: imageUrl ? [imageUrl] : [],
        latitude,
        longitude
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      gsap.to(cardRef.current, { scale: 0.95, opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' });
      setTimeout(() => navigate('/'), 400);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'annonce');
      gsap.fromTo(cardRef.current, { x: -10 }, { x: 10, duration: 0.08, yoyo: true, repeat: 5 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="create-page">
      <div className="grid-bg" />
      
      <div ref={cardRef} className="glass-card form-card">
        <Link to="/" className="back-link">← Retour au catalogue</Link>
        
        <div className="form-header">
          <h2>Publier une annonce</h2>
          <p>Détaillez votre produit pour attirer plus d'acheteurs.</p>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="annonce-form">
          <div className="form-group">
            <label>Titre de l'annonce</label>
            <input 
              type="text" 
              value={titre} 
              onChange={(e) => setTitre(e.target.value)} 
              placeholder="Ex: iPhone 13 Pro Max 256Go"
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Prix (DH)</label>
              <input 
                type="number" 
                value={prix} 
                onChange={(e) => setPrix(e.target.value)} 
                placeholder="Ex: 8500"
                min="0"
                step="0.01"
                required 
              />
            </div>
            
            <div className="form-group half">
              <label>Catégorie</label>
              <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                <option value="Électronique">Électronique</option>
                <option value="Vêtements">Vêtements</option>
                <option value="Maison">Maison & Déco</option>
                <option value="Véhicules">Véhicules</option>
                <option value="Services">Services</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>État du produit</label>
            <div className="etat-selector">
              {['Neuf', 'Très bon état', 'Bon état', 'Satisfaisant', 'Pour pièces'].map(e => (
                <label key={e} className={`etat-option ${etat === e ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="etat" 
                    value={e} 
                    checked={etat === e} 
                    onChange={(evt) => setEtat(evt.target.value)} 
                    className="hidden-radio"
                  />
                  {e}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Décrivez l'état, les caractéristiques, les défauts éventuels..."
              rows="4"
              required 
            />
          </div>

          <div className="form-group">
            <label>Lien d'image (URL)</label>
            <input 
              type="url" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
              placeholder="https://exemple.com/image.jpg"
            />
            <small className="help-text">Pour le moment, collez une URL d'image publique.</small>
          </div>

          <div className="form-group">
            <label>Localisation (Optionnel)</label>
            <button 
              type="button" 
              className={`geo-btn ${latitude ? 'success' : ''}`}
              onClick={() => {
                if(navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setLatitude(pos.coords.latitude);
                      setLongitude(pos.coords.longitude);
                    },
                    (err) => alert('Erreur de localisation : ' + err.message)
                  );
                } else {
                  alert('La géolocalisation n\'est pas supportée par votre navigateur.');
                }
              }}
            >
              {latitude ? `✅ Localisation capturée (${latitude.toFixed(2)}, ${longitude.toFixed(2)})` : '📍 Ajouter ma localisation exacte'}
            </button>
            <small className="help-text">Permet aux acheteurs de voir où se trouve le produit sur une carte.</small>
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? 'Publication...' : 'Publier mon annonce →'}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .create-page {
          min-height: 100vh; background: #050816; font-family: 'Inter', sans-serif;
          display: flex; justify-content: center; align-items: flex-start;
          padding: 60px 20px; position: relative;
        }
        .grid-bg {
          position: fixed; inset: 0; background-image: radial-gradient(rgba(249,115,22,0.1) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        
        .form-card {
          width: 100%; max-width: 600px;
          background: rgba(255,255,255,0.02); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 24px;
          padding: 40px; position: relative; z-index: 10;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .geo-btn { width: 100%; padding: 14px; background: rgba(20,184,166,0.1); border: 1px dashed rgba(20,184,166,0.4); color: #5eead4; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .geo-btn:hover { background: rgba(20,184,166,0.2); }
        .geo-btn.success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.4); color: #4ade80; border-style: solid; }

        .back-link { color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 500; display: inline-block; margin-bottom: 24px; transition: color 0.2s; }
        .back-link:hover { color: #f1f5f9; }

        .form-header { margin-bottom: 30px; }
        .form-header h2 { font-size: 28px; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }
        .form-header p { color: #64748b; font-size: 14px; }

        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; padding: 12px 16px; border-radius: 12px; font-size: 13px; margin-bottom: 24px; }

        .annonce-form { display: flex; flex-direction: column; gap: 20px; }
        .form-row { display: flex; gap: 16px; }
        .form-group.half { flex: 1; }

        .form-group label { display: block; font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
        .form-group input, .form-group textarea, .form-group select {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
          padding: 14px 16px; color: #f1f5f9; font-size: 15px; font-family: 'Inter', sans-serif;
          transition: all 0.2s; outline: none;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
          border-color: rgba(249,115,22,0.5); background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        .form-group select { appearance: none; cursor: pointer; }
        .help-text { display: block; margin-top: 6px; font-size: 11px; color: #475569; }

        .etat-selector { display: flex; flex-wrap: wrap; gap: 8px; }
        .etat-option {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          padding: 8px 14px; border-radius: 100px; font-size: 13px; color: #cbd5e1;
          cursor: pointer; transition: all 0.2s; font-weight: 500;
        }
        .etat-option:hover { background: rgba(255,255,255,0.06); }
        .etat-option.selected {
          background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.5); color: #fdba74;
        }
        .hidden-radio { display: none; }

        .submit-btn {
          margin-top: 10px; width: 100%; padding: 16px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 700;
          cursor: pointer; box-shadow: 0 8px 25px rgba(249,115,22,0.3); transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(249,115,22,0.4); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 600px) { .form-row { flex-direction: column; } .create-page { padding: 20px 16px; } }
      `}</style>
    </div>
  );
}
