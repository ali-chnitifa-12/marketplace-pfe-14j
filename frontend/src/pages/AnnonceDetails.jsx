import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AnnonceDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States for features
  const [isFavori, setIsFavori] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  
  const [offrePrix, setOffrePrix] = useState('');
  const [showOffreModal, setShowOffreModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const fetchAnnonceAndData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`http://localhost:5000/api/annonces/${id}`);
      setAnnonce(res.data);

      if (res.data.User?.id) {
        const revRes = await axios.get(`http://localhost:5000/api/reviews/vendeur/${res.data.User.id}`);
        setReviews(revRes.data.reviews);
        setAvgRating(revRes.data.avgRating);
      }

      if (token) {
        const favRes = await axios.get('http://localhost:5000/api/favoris', { headers });
        setIsFavori(favRes.data.some(f => f.annonceId === parseInt(id)));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Annonce introuvable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnonceAndData();
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

  const toggleFavori = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert('Veuillez vous connecter');
      if (isFavori) {
        await axios.delete(`http://localhost:5000/api/favoris/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setIsFavori(false);
      } else {
        await axios.post('http://localhost:5000/api/favoris', { annonceId: id }, { headers: { Authorization: `Bearer ${token}` } });
        setIsFavori(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMakeOffre = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/offres', {
        annonceId: id, prixPropose: parseFloat(offrePrix)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowOffreModal(false);
      setActionMsg('Offre envoyée avec succès !');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const [showCommandeModal, setShowCommandeModal] = useState(false);
  const [commandeData, setCommandeData] = useState({ adresseLivraison: '', telephone: '', modeLivraison: 'Domicile', pointRelaisId: '' });
  
  const handleMakeCommande = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/commandes', {
        annonceId: id, ...commandeData
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowCommandeModal(false);
      setActionMsg('Commande confirmée (Paiement à la livraison) !');
      setTimeout(() => { setActionMsg(''); fetchAnnonceAndData(); }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const [showEnchereModal, setShowEnchereModal] = useState(false);
  const [encherePrix, setEncherePrix] = useState('');

  const handleMakeEnchere = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/encheres', {
        annonceId: id, montant: parseFloat(encherePrix)
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowEnchereModal(false);
      setActionMsg('Enchère placée avec succès !');
      setTimeout(() => { setActionMsg(''); fetchAnnonceAndData(); }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/reviews', {
        vendeurId: annonce.userId, rating: reviewRating, comment: reviewText
      }, { headers: { Authorization: `Bearer ${token}` } });
      setReviewText('');
      fetchAnnonceAndData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

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

  const waLink = annonce.User?.telephone 
    ? `https://wa.me/${annonce.User.telephone.replace(/[^0-9]/g, '')}?text=Bonjour, je suis intéressé par votre annonce "${annonce.titre}" sur Products Marketplace.` 
    : '#';

  return (
    <div ref={containerRef} className="details-page">
      <div className="grid-bg" />
      
      <div className="details-nav">
        <Link to="/" className="back-link">← Retour au catalogue</Link>
        {actionMsg && <div className="action-msg">{actionMsg}</div>}
      </div>

      <div ref={contentRef} className="details-content">
        <div className="left-column">
          <div className="details-image-section">
            <button className={`fav-btn ${isFavori ? 'active' : ''}`} onClick={toggleFavori}>
              {isFavori ? '❤️' : '🤍'}
            </button>
            {annonce.images && annonce.images.length > 0 ? (
              <img src={annonce.images[0]} alt={annonce.titre} className="main-image" />
            ) : (
              <div className="no-image-large">
                <span className="no-image-icon">📷</span>
                <p>Pas d'image disponible</p>
              </div>
            )}
          </div>

          <div className="details-description">
            <h3>Description du produit</h3>
            <p>{annonce.description}</p>
          </div>
          
          {annonce.latitude && annonce.longitude && (
            <div className="details-map-section">
              <h3>Localisation du produit</h3>
              <div className="map-container">
                <MapContainer center={[annonce.latitude, annonce.longitude]} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '16px' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[annonce.latitude, annonce.longitude]}>
                    <Popup>
                      Lieu approximatif du produit.
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          <div className="details-meta">
            <p>Publié le : {new Date(annonce.createdAt).toLocaleDateString('fr-FR')}</p>
            <p>Référence : #{annonce.id}</p>
          </div>
        </div>

        <div className="right-column">
          <div className="info-header">
            <span className="badge-category">{annonce.categorie}</span>
            <span className={`badge-etat ${annonce.statut?.toLowerCase() || 'disponible'}`}>{annonce.statut || annonce.etat}</span>
          </div>

          <h1 className="details-title">{annonce.titre}</h1>
          <div className="details-price">{annonce.prix.toFixed(2)} DH</div>

          <div className="action-buttons">
            {annonce.statut !== 'Vendu' && user && user.id !== annonce.userId && (
              <>
                <a href={waLink} target="_blank" rel="noreferrer" className="contact-btn">
                  <span>💬</span> WhatsApp
                </a>
                {annonce.typeAnnonce === 'Enchere' ? (
                  <button onClick={() => setShowEnchereModal(true)} className="offer-btn">
                    <span>🔨</span> Placer une enchère
                  </button>
                ) : (
                  <>
                    <button onClick={() => setShowCommandeModal(true)} className="offer-btn" style={{background: '#14b8a6', color: 'white', borderColor: '#14b8a6'}}>
                      <span>🛒</span> Acheter direct
                    </button>
                    <button onClick={() => setShowOffreModal(true)} className="offer-btn">
                      <span>💰</span> Négocier
                    </button>
                  </>
                )}
              </>
            )}
            {!user && <p className="text-small">Connectez-vous pour contacter le vendeur ou acheter.</p>}
          </div>

          <div className="details-seller-card">
            <div className="seller-avatar">
              {annonce.User?.photo ? <img src={annonce.User.photo} alt="" style={{width:'100%', borderRadius:'50%'}}/> : getInitials(annonce.User?.nom)}
            </div>
            <div className="seller-info">
              <h4>{annonce.User?.nom}</h4>
              <p>Vendeur vérifié • ⭐ {avgRating} ({reviews.length} avis)</p>
            </div>
          </div>

          <div className="reviews-section">
            <h3>Avis sur le vendeur</h3>
            <div className="reviews-list">
              {reviews.slice(0, 3).map(r => (
                <div key={r.id} className="review-item">
                  <strong>{r.reviewer?.nom}</strong>
                  <span className="stars">{'⭐'.repeat(r.rating)}</span>
                  <p>{r.comment}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-small">Aucun avis pour le moment.</p>}
            </div>

            {user && user.id !== annonce.userId && (
              <form onSubmit={handlePostReview} className="review-form">
                <h4>Laisser un avis</h4>
                <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Étoiles</option>)}
                </select>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Votre commentaire..." required rows="2" />
                <button type="submit">Publier</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {showOffreModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h2>Proposer un prix</h2>
            <p>Prix actuel : <strong>{annonce.prix} DH</strong></p>
            <form onSubmit={handleMakeOffre}>
              <input type="number" value={offrePrix} onChange={e => setOffrePrix(e.target.value)} placeholder="Votre offre (DH)" required min="1" />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowOffreModal(false)} className="btn-cancel">Annuler</button>
                <button type="submit" className="btn-submit">Envoyer l'offre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCommandeModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
            <h2>🛒 Finaliser la commande</h2>
            <p>Total à payer à la livraison : <strong>{annonce.prix} DH</strong></p>
            <form onSubmit={handleMakeCommande}>
              <select value={commandeData.modeLivraison} onChange={e => setCommandeData({...commandeData, modeLivraison: e.target.value})} style={{width:'100%', padding:'15px', marginBottom:'15px', borderRadius:'12px', background:'var(--input-bg)', border:'1px solid var(--input-border)', color:'var(--text-primary)'}}>
                <option value="Domicile">Livraison à Domicile</option>
                <option value="Point Relais">Livraison en Point Relais</option>
              </select>
              
              {commandeData.modeLivraison === 'Point Relais' && (
                <select value={commandeData.pointRelaisId} onChange={e => setCommandeData({...commandeData, pointRelaisId: e.target.value})} required style={{width:'100%', padding:'15px', marginBottom:'15px', borderRadius:'12px', background:'var(--input-bg)', border:'1px solid var(--input-border)', color:'var(--text-primary)'}}>
                  <option value="">-- Choisissez un Point Relais --</option>
                  <option value="Relais 1 (Gare Casa Voyageurs)">Gare Casa Voyageurs (Casablanca)</option>
                  <option value="Relais 2 (Gare Rabat Agdal)">Gare Rabat Agdal (Rabat)</option>
                  <option value="Relais 3 (Marjane Marrakech)">Marjane Menara (Marrakech)</option>
                </select>
              )}

              <input type="text" value={commandeData.adresseLivraison} onChange={e => setCommandeData({...commandeData, adresseLivraison: e.target.value})} placeholder="Adresse complète" required />
              <input type="tel" value={commandeData.telephone} onChange={e => setCommandeData({...commandeData, telephone: e.target.value})} placeholder="Numéro de téléphone" required />
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCommandeModal(false)} className="btn-cancel">Annuler</button>
                <button type="submit" className="btn-submit" style={{background:'#14b8a6'}}>Commander</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEnchereModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h2>🔨 Placer une enchère</h2>
            <p>Prix de départ : <strong>{annonce.prix} DH</strong></p>
            <form onSubmit={handleMakeEnchere}>
              <input type="number" value={encherePrix} onChange={e => setEncherePrix(e.target.value)} placeholder="Votre enchère (DH)" required min={annonce.prix + 1} />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEnchereModal(false)} className="btn-cancel">Annuler</button>
                <button type="submit" className="btn-submit" style={{background:'#f97316'}}>Enchérir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .details-page { min-height: 100vh; background-color: transparent; font-family: 'Inter', sans-serif; color: var(--text-primary); padding: 40px 20px; position: relative; }
        .grid-bg { position: fixed; inset: 0; background-image: radial-gradient(var(--grid-dots) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
        .loading-center, .error-center { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .spinner { font-size: 24px; display: inline-block; animation: spin 1s linear infinite; margin-bottom: 10px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .details-nav { max-width: 1100px; margin: 0 auto 30px; position: relative; z-index: 10; display: flex; justify-content: space-between; }
        .back-link { color: var(--text-secondary); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .back-link:hover { color: var(--text-primary); }
        .action-msg { background: rgba(34,197,94,0.2); color: #4ade80; padding: 6px 12px; border-radius: 8px; font-size: 13px; }

        .details-content { max-width: 1100px; margin: 0 auto; position: relative; z-index: 10; display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; }
        .glass-card { background: var(--card-bg); backdrop-filter: blur(20px); border: 1px solid var(--card-border); border-radius: 24px; padding: 32px; }

        .details-image-section { border-radius: 24px; overflow: hidden; background: var(--card-bg-hover); aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 30px; border: 1px solid var(--card-border); }
        .main-image { width: 100%; height: 100%; object-fit: cover; }
        .no-image-large { text-align: center; color: var(--text-secondary); }
        .no-image-large .no-image-icon { font-size: 64px; opacity: 0.3; display: block; margin-bottom: 10px; }
        
        .fav-btn { position: absolute; top: 20px; right: 20px; background: var(--overlay-bg); border: none; font-size: 24px; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(5px); transition: 0.2s; }
        .fav-btn:hover { transform: scale(1.1); }
        .fav-btn.active { background: rgba(239,68,68,0.2); }

        .info-header { display: flex; gap: 10px; margin-bottom: 16px; }
        .badge-category { background: rgba(249,115,22,0.15); color: #fdba74; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge-etat { background: rgba(20,184,166,0.15); color: #5eead4; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; }
        .badge-etat.vendu { background: rgba(239,68,68,0.2); color: #f87171; text-decoration: line-through; }

        .details-title { font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }
        .details-price { font-size: 36px; font-weight: 900; color: #2dd4bf; margin-bottom: 32px; }

        .action-buttons { display: flex; gap: 15px; margin-bottom: 30px; }
        .contact-btn { flex: 1; background: linear-gradient(135deg, #25D366, #128C7E); color: white; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(37,211,102,0.3); transition: 0.2s; }
        .contact-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(37,211,102,0.4); }
        .offer-btn { flex: 1; background: var(--card-bg-hover); border: 1px solid var(--card-border-light); color: var(--text-primary); display: flex; align-items: center; justify-content: center; gap: 10px; padding: 16px; border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; transition: 0.2s; }
        .offer-btn:hover { background: var(--card-border); }
        .text-small { font-size: 13px; color: var(--text-secondary); }

        .details-seller-card { display: flex; align-items: center; gap: 16px; background: var(--card-bg); border: 1px solid var(--card-border); padding: 20px; border-radius: 20px; margin-bottom: 30px; }
        .seller-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #14b8a6); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; overflow: hidden; color: white; }
        .seller-info h4 { font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--text-primary); }
        .seller-info p { font-size: 13px; color: var(--text-secondary); margin: 0; }

        .reviews-section { background: var(--card-bg); padding: 24px; border-radius: 20px; border: 1px solid var(--card-border); }
        .reviews-section h3 { font-size: 16px; margin-bottom: 20px; border-bottom: 1px solid var(--card-border); padding-bottom: 10px; color: var(--text-primary); }
        .reviews-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; }
        .review-item { background: var(--card-bg-hover); padding: 15px; border-radius: 12px; }
        .review-item strong { display: block; font-size: 14px; margin-bottom: 5px; color: var(--text-primary); }
        .stars { font-size: 12px; margin-bottom: 8px; display: block; }
        .review-item p { font-size: 14px; color: var(--text-secondary); margin: 0; }
        
        .review-form { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--card-border); }
        .review-form h4 { font-size: 14px; margin-bottom: 15px; color: var(--text-primary); }
        .review-form select, .review-form textarea { width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 8px; padding: 10px; color: var(--text-primary); margin-bottom: 10px; font-family: 'Inter', sans-serif; }
        .review-form button { background: #f97316; color: #fff; border: none; padding: 10px 15px; border-radius: 8px; font-weight: 600; cursor: pointer; }

        .details-description h3 { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: var(--text-primary); }
        .details-description p { font-size: 16px; color: var(--text-secondary); line-height: 1.7; white-space: pre-wrap; margin-bottom: 32px; }
        
        .details-map-section { margin-bottom: 32px; }
        .details-map-section h3 { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: var(--text-primary); }
        .map-container { border-radius: 16px; overflow: hidden; border: 1px solid var(--card-border); }

        .details-meta { font-size: 13px; color: var(--text-secondary); display: flex; justify-content: space-between; border-top: 1px solid var(--card-border); padding-top: 20px; }

        .modal-overlay { position: fixed; inset: 0; background: var(--overlay-bg); backdrop-filter: blur(5px); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .modal-content { width: 100%; max-width: 400px; padding: 40px; text-align: center; }
        .modal-content h2 { margin-bottom: 10px; color: var(--text-primary); }
        .modal-content p { color: var(--text-secondary); margin-bottom: 20px; }
        .modal-content input { width: 100%; padding: 15px; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 12px; color: var(--text-primary); font-size: 18px; text-align: center; margin-bottom: 20px; outline: none; }
        .modal-content input:focus { border-color: #14b8a6; }
        .modal-actions { display: flex; gap: 10px; }
        .btn-cancel { flex: 1; padding: 12px; background: transparent; border: 1px solid var(--text-secondary); color: var(--text-secondary); border-radius: 10px; cursor: pointer; }
        .btn-submit { flex: 1; padding: 12px; background: #14b8a6; border: none; color: #fff; border-radius: 10px; font-weight: 700; cursor: pointer; }

        @media (max-width: 900px) {
          .details-content { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>
    </div>
  );
}
