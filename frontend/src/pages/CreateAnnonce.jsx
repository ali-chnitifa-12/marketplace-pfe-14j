import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function CreateAnnonce() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [titre, setTitre]           = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix]             = useState('');
  const [etat, setEtat]             = useState('Bon état');
  const [categorie, setCategorie]   = useState('Électronique');
  const [typeAnnonce, setTypeAnnonce] = useState('Fixe');
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [latitude, setLatitude]     = useState(null);
  const [longitude, setLongitude]   = useState(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const containerRef = useRef(null);
  const cardRef      = useRef(null);
  const orb1Ref      = useRef(null);
  const orb2Ref      = useRef(null);

  useEffect(() => {
    if (user?.typeCompte !== 'vendeur' && user?.role !== 'admin') navigate('/');
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, { x: 60, y: -40, scale: 1.1, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(orb2Ref.current, { x: -50, y: 50, scale: 0.9, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
      gsap.fromTo(cardRef.current,
        { scale: 0.9, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      gsap.fromTo('.image-preview-box', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setUploadProgress(0);
    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(p => { if (p >= 90) { clearInterval(progressInterval); return p; } return p + 10; });
    }, 100);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('titre', titre);
      formData.append('description', description);
      formData.append('prix', prix);
      formData.append('etat', etat);
      formData.append('categorie', categorie);
      formData.append('typeAnnonce', typeAnnonce);
      if (imageFile) formData.append('image', imageFile);
      if (latitude && longitude) { formData.append('latitude', latitude); formData.append('longitude', longitude); }
      await axios.post('http://localhost:5000/api/annonces', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      clearInterval(progressInterval);
      setUploadProgress(100);
      gsap.to(cardRef.current, { scale: 0.95, opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' });
      setTimeout(() => navigate('/'), 400);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setError(err.response?.data?.message || "Erreur lors de la création de l'annonce");
      gsap.fromTo(cardRef.current, { x: -10 }, { x: 10, duration: 0.08, yoyo: true, repeat: 5 });
    } finally { setIsLoading(false); }
  };

  return (
    <div ref={containerRef} className="create-page">
      <div ref={orb1Ref} className="orb orb-1" />
      <div ref={orb2Ref} className="orb orb-2" />
      <div className="grid-bg" />

      <div ref={cardRef} className="glass-card form-card">
        <Link to="/" className="back-link">
          <span>←</span> Retour au catalogue
        </Link>

        <div className="form-header">
          <div className="form-header-icon">📢</div>
          <div>
            <h2>Publier une annonce</h2>
            <p>Détaillez votre produit pour attirer plus d'acheteurs.</p>
          </div>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="annonce-form">
          {/* Titre */}
          <div className="form-group">
            <label>Titre de l'annonce</label>
            <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: iPhone 13 Pro Max 256Go" required />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Prix (DH)</label>
              <input type="number" value={prix} onChange={(e) => setPrix(e.target.value)}
                placeholder="8500" min="0" step="0.01" required />
            </div>
            <div className="form-group half">
              <label>Catégorie</label>
              <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                <option value="Électronique">📱 Électronique</option>
                <option value="Vêtements">👕 Vêtements</option>
                <option value="Maison">🏠 Maison & Déco</option>
                <option value="Véhicules">🚗 Véhicules</option>
                <option value="Services">🔧 Services</option>
              </select>
            </div>
            <div className="form-group half">
              <label>Type de vente</label>
              <select value={typeAnnonce} onChange={(e) => setTypeAnnonce(e.target.value)}>
                <option value="Fixe">💰 Prix Fixe</option>
                <option value="Enchere">🔨 Enchère</option>
              </select>
            </div>
          </div>

          {/* Etat selector */}
          <div className="form-group">
            <label>État du produit</label>
            <div className="etat-selector">
              {['Neuf', 'Très bon état', 'Bon état', 'Satisfaisant', 'Pour pièces'].map(e => (
                <label key={e} className={`etat-option ${etat === e ? 'selected' : ''}`}>
                  <input type="radio" name="etat" value={e} checked={etat === e}
                    onChange={(evt) => setEtat(evt.target.value)} className="hidden-radio" />
                  {e}
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'état, les caractéristiques, les défauts éventuels..."
              rows="4" required />
          </div>

          {/* Image Upload — marching ants border */}
          <div className="form-group">
            <label>Image du produit</label>
            <label className={`upload-area ${imagePreview ? 'has-image' : ''}`}>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              {imagePreview ? (
                <div className="image-preview-box">
                  <img src={imagePreview} alt="Aperçu" />
                  <div className="image-overlay-btn">Changer l'image</div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📸</span>
                  <span className="upload-text">Cliquez pour ajouter une image</span>
                  <span className="upload-hint">PNG, JPG, WEBP — max 10 Mo</span>
                </div>
              )}
            </label>
          </div>

          {/* Geolocation */}
          <div className="form-group">
            <label>Localisation (Optionnel)</label>

            <button
              type="button"
              className={`geo-btn ${latitude ? 'success' : ''}`}
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setLatitude(pos.coords.latitude);
                      setLongitude(pos.coords.longitude);
                    },
                    (err) => alert('Erreur : ' + err.message)
                  );
                }
              }}
            >
              {latitude ? (
                <>
                  <span>✅</span>
                  Localisation capturée ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                </>
              ) : (
                <>
                  <span>📍</span>
                  Obtenir ma position actuelle
                </>
              )}
            </button>

            <small className="help-text">
              {latitude
                ? '📍 Localisation ajoutée avec succès.'
                : 'Permet aux acheteurs de voir le produit sur une carte.'}
            </small>
          </div>

          {/* Progress bar inside button */}
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? (
              <>
                <div className="btn-progress" style={{ width: `${uploadProgress}%` }} />
                <span style={{ position: 'relative', zIndex: 1 }}>Publication... {uploadProgress}%</span>
              </>
            ) : (
              <span>Publier mon annonce →</span>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .create-page { min-height:100vh; background-color:transparent; font-family:'Inter',sans-serif; display:flex; justify-content:center; align-items:flex-start; padding:60px 20px; position:relative; }
        .grid-bg { position:fixed; inset:0; background-image:radial-gradient(var(--grid-dots) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; }
        .orb { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
        .orb-1 { width:500px; height:500px; background:radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%); top:-120px; left:-100px; }
        .orb-2 { width:450px; height:450px; background:radial-gradient(circle,rgba(20,184,166,0.12) 0%,transparent 70%); bottom:-100px; right:-80px; }

        .form-card { width:100%; max-width:640px; background:var(--card-bg); backdrop-filter:blur(24px); border:1px solid var(--card-border); border-radius:26px; padding:44px; position:relative; z-index:10; box-shadow:0 24px 80px rgba(0,0,0,0.12),inset 0 1px 0 var(--card-border-light); }

        .back-link { display:inline-flex; align-items:center; gap:6px; color:var(--text-secondary); text-decoration:none; font-size:13px; font-weight:600; margin-bottom:28px; padding:7px 14px; border-radius:10px; background:var(--card-bg-hover); border:1px solid var(--card-border); transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .back-link:hover { color:var(--text-primary); transform:translateX(-3px); }

        .form-header { display:flex; align-items:center; gap:16px; margin-bottom:32px; }
        .form-header-icon { font-size:32px; width:56px; height:56px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(20,184,166,0.1)); border-radius:16px; flex-shrink:0; }
        .form-header h2 { font-size:26px; font-weight:900; color:var(--text-primary); margin:0; letter-spacing:-0.02em; }
        .form-header p { color:var(--text-secondary); font-size:14px; margin:4px 0 0; }

        .error-box { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); color:#fca5a5; padding:12px 16px; border-radius:12px; font-size:13px; margin-bottom:22px; }

        .annonce-form { display:flex; flex-direction:column; gap:22px; }
        .form-row { display:flex; gap:14px; }
        .form-group.half { flex:1; }
        .form-group label { display:block; font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.07em; }
        .form-group input,.form-group textarea,.form-group select { width:100%; background:var(--input-bg); border:1px solid var(--input-border); border-radius:12px; padding:13px 15px; color:var(--text-primary); font-size:14.5px; font-family:'Inter',sans-serif; transition:all 0.3s; outline:none; }
        .form-group input:focus,.form-group textarea:focus,.form-group select:focus { border-color:rgba(249,115,22,0.5); background:var(--input-focus-bg); box-shadow:0 0 0 3px rgba(249,115,22,0.1); }
        .form-group select { appearance:none; cursor:pointer; }
        .help-text { display:block; margin-top:6px; font-size:11px; color:var(--text-secondary); }

        .etat-selector { display:flex; flex-wrap:wrap; gap:8px; }
        .etat-option { background:var(--card-bg); border:1px solid var(--card-border); padding:8px 14px; border-radius:100px; font-size:13px; color:var(--text-secondary); cursor:pointer; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); font-weight:600; }
        .etat-option:hover { background:var(--card-bg-hover); color:var(--text-primary); transform:translateY(-2px); }
        .etat-option.selected { background:rgba(249,115,22,0.12); border-color:rgba(249,115,22,0.45); color:#ea580c; font-weight:800; }
        .hidden-radio { display:none; }

        /* Marching ants upload */
        .upload-area {
          display:block; cursor:pointer; border-radius:16px; overflow:hidden;
          background:repeating-linear-gradient(0deg,var(--card-bg),var(--card-bg) 4px,transparent 4px,transparent 8px),
                      repeating-linear-gradient(90deg,var(--card-bg),var(--card-bg) 4px,transparent 4px,transparent 8px),
                      repeating-linear-gradient(180deg,var(--card-bg),var(--card-bg) 4px,transparent 4px,transparent 8px),
                      repeating-linear-gradient(270deg,var(--card-bg),var(--card-bg) 4px,transparent 4px,transparent 8px);
          border:2px dashed rgba(249,115,22,0.35);
          transition:border-color 0.3s, background 0.3s;
          min-height:160px;
        }
        .upload-area:hover { border-color:rgba(249,115,22,0.6); background-color:rgba(249,115,22,0.03); }
        .upload-area.has-image { border-style:solid; border-color:rgba(20,184,166,0.4); }
        .upload-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px; gap:10px; }
        .upload-icon { font-size:40px; animation:breathe 3s ease-in-out infinite; }
        .upload-text { font-size:14px; font-weight:600; color:var(--text-primary); }
        .upload-hint { font-size:12px; color:var(--text-secondary); }
        .image-preview-box { position:relative; overflow:hidden; }
        .image-preview-box img { width:100%; max-height:220px; object-fit:cover; display:block; }
        .image-overlay-btn { position:absolute; inset:0; background:rgba(0,0,0,0.5); color:white; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; opacity:0; transition:opacity 0.3s; }
        .upload-area:hover .image-overlay-btn { opacity:1; }

        .geo-btn { width:100%; padding:14px; background:rgba(20,184,166,0.07); border:1px dashed rgba(20,184,166,0.35); color:#2dd4bf; border-radius:13px; cursor:pointer; font-weight:700; font-family:'Inter',sans-serif; transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); display:flex; align-items:center; justify-content:center; gap:8px; font-size:14px; }
        .geo-btn:hover { background:rgba(20,184,166,0.15); transform:translateY(-2px); }
        .geo-btn.success { background:rgba(34,197,94,0.08); border-color:rgba(34,197,94,0.4); color:#4ade80; border-style:solid; }

        /* Progress-bar button */
        .submit-btn { position:relative; overflow:hidden; margin-top:8px; width:100%; padding:17px; background:linear-gradient(135deg,#f97316,#ea580c); color:white; border:none; border-radius:16px; font-size:16px; font-weight:800; cursor:pointer; box-shadow:0 8px 30px rgba(249,115,22,0.35); transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); font-family:'Inter',sans-serif; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-3px); box-shadow:0 14px 40px rgba(249,115,22,0.5); }
        .submit-btn:disabled { cursor:not-allowed; }
        .btn-progress { position:absolute; top:0; left:0; height:100%; background:rgba(255,255,255,0.15); transition:width 0.15s ease; }

        @media (max-width:600px) { .form-row { flex-direction:column; } .create-page { padding:20px 16px; } }
      `}</style>
    </div>
  );
}
