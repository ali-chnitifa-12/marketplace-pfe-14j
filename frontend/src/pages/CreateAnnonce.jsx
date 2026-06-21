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
  const [typeAnnonce, setTypeAnnonce] = useState('Fixe');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('description', description);
      formData.append('prix', prix);
      formData.append('etat', etat);
      formData.append('categorie', categorie);
      formData.append('typeAnnonce', typeAnnonce);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (latitude && longitude) {
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
      }

      await axios.post('http://localhost:5000/api/annonces', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
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

            <div className="form-group half">
              <label>Type de vente</label>
              <select value={typeAnnonce} onChange={(e) => setTypeAnnonce(e.target.value)}>
                <option value="Fixe">Prix Fixe</option>
                <option value="Enchere">Enchère</option>
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
            <label>Image du produit (PC)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange} 
            />
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <img src={imagePreview} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
              </div>
            )}
            <small className="help-text">Sélectionnez une image depuis votre ordinateur.</small>
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
          min-height: 100vh; background-color: transparent; font-family: 'Inter', sans-serif;
          display: flex; justify-content: center; align-items: flex-start;
          padding: 60px 20px; position: relative;
        }
        .grid-bg {
          position: fixed; inset: 0; background-image: radial-gradient(var(--grid-dots) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        
        .form-card {
          width: 100%; max-width: 600px;
          background: var(--card-bg); backdrop-filter: blur(20px);
          border: 1px solid var(--card-border); border-radius: 24px;
          padding: 40px; position: relative; z-index: 10;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1), inset 0 1px 0 var(--card-border-light);
        }

        .geo-btn { width: 100%; padding: 14px; background: rgba(20,184,166,0.1); border: 1px dashed rgba(20,184,166,0.4); color: #5eead4; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .geo-btn:hover { background: rgba(20,184,166,0.2); }
        .geo-btn.success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.4); color: #4ade80; border-style: solid; }

        .back-link { color: var(--text-secondary); text-decoration: none; font-size: 13px; font-weight: 500; display: inline-block; margin-bottom: 24px; transition: color 0.2s; }
        .back-link:hover { color: var(--text-primary); }

        .form-header { margin-bottom: 30px; }
        .form-header h2 { font-size: 28px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
        .form-header p { color: var(--text-secondary); font-size: 14px; }

        .error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; padding: 12px 16px; border-radius: 12px; font-size: 13px; margin-bottom: 24px; }

        .annonce-form { display: flex; flex-direction: column; gap: 20px; }
        .form-row { display: flex; gap: 16px; }
        .form-group.half { flex: 1; }

        .form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
        .form-group input, .form-group textarea, .form-group select {
          width: 100%; background: var(--input-bg);
          border: 1px solid var(--input-border); border-radius: 12px;
          padding: 14px 16px; color: var(--text-primary); font-size: 15px; font-family: 'Inter', sans-serif;
          transition: all 0.2s; outline: none;
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
          border-color: rgba(249,115,22,0.5); background: var(--input-focus-bg);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        .form-group select { appearance: none; cursor: pointer; }
        .help-text { display: block; margin-top: 6px; font-size: 11px; color: var(--text-secondary); }

        .etat-selector { display: flex; flex-wrap: wrap; gap: 8px; }
        .etat-option {
          background: var(--card-bg); border: 1px solid var(--card-border);
          padding: 8px 14px; border-radius: 100px; font-size: 13px; color: var(--text-secondary);
          cursor: pointer; transition: all 0.2s; font-weight: 500;
        }
        .etat-option:hover { background: var(--card-bg-hover); color: var(--text-primary); }
        .etat-option.selected {
          background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.5); color: #ea580c; font-weight: 700;
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
