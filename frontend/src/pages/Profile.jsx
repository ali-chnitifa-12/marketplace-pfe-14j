import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('infos');
  const [favoris, setFavoris] = useState([]);
  const [mesAnnonces, setMesAnnonces] = useState([]);
  const [offresRecues, setOffresRecues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [nom, setNom] = useState(user?.nom || '');
  const [telephone, setTelephone] = useState(user?.telephone || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const resFav = await axios.get('http://localhost:5000/api/favoris', { headers });
      setFavoris(resFav.data);
      
      if (user?.typeCompte === 'vendeur') {
        const resAnn = await axios.get(`http://localhost:5000/api/annonces?userId=${user.id}`);
        // Alternatively filter from all, but backend /api/annonces handles it if we pass userId?
        // Wait, standard route is to filter frontend or create a specific route.
        // Let's filter on frontend for simplicity here from all annonces:
        const allAnn = await axios.get('http://localhost:5000/api/annonces');
        setMesAnnonces(allAnn.data.filter(a => a.userId === user.id));
        
        const resOffres = await axios.get('http://localhost:5000/api/offres/recues', { headers });
        setOffresRecues(resOffres.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', {
        nom, telephone, photo
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Update local context
      const updatedUser = { ...user, nom: res.data.nom, telephone: res.data.telephone, photo: res.data.photo };
      login(updatedUser, token); // assuming login can update state
      setUpdateMsg('Profil mis à jour avec succès !');
      setTimeout(() => setUpdateMsg(''), 3000);
    } catch (err) {
      setUpdateMsg('Erreur lors de la mise à jour.');
    }
  };

  const handleStatutOffre = async (id, statut) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/offres/${id}/statut`, { statut }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const p = name.trim().split(' ');
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.charAt(0).toUpperCase();
  };

  if (loading) return <div className="profile-page"><div className="grid-bg"/><h2>Chargement...</h2></div>;

  return (
    <div className="profile-page">
      <div className="grid-bg" />
      <div className="profile-container">
        
        {/* Header */}
        <div className="profile-header glass-card">
          <div className="avatar-large">
            {photo ? <img src={photo} alt="Avatar" /> : <span>{getInitials(user?.nom)}</span>}
          </div>
          <div className="user-details">
            <h1>{user?.nom}</h1>
            <p>{user?.email}</p>
            <span className={`badge ${user?.typeCompte}`}>{user?.typeCompte}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs">
          <button className={activeTab === 'infos' ? 'active' : ''} onClick={() => setActiveTab('infos')}>Mes Infos</button>
          <button className={activeTab === 'favoris' ? 'active' : ''} onClick={() => setActiveTab('favoris')}>Mes Favoris</button>
          {user?.typeCompte === 'vendeur' && (
            <>
              <button className={activeTab === 'annonces' ? 'active' : ''} onClick={() => setActiveTab('annonces')}>Mes Annonces</button>
              <button className={activeTab === 'offres' ? 'active' : ''} onClick={() => setActiveTab('offres')}>Offres Reçues</button>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="tab-content glass-card">
          
          {activeTab === 'infos' && (
            <div className="infos-tab">
              <h2>Paramètres du compte</h2>
              {updateMsg && <div className="alert">{updateMsg}</div>}
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label>Nom complet</label>
                  <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Téléphone (WhatsApp)</label>
                  <input type="text" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+212600000000" />
                </div>
                <div className="form-group">
                  <label>URL Photo de Profil</label>
                  <input type="text" value={photo} onChange={(e) => setPhoto(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary">Enregistrer les modifications</button>
              </form>
            </div>
          )}

          {activeTab === 'favoris' && (
            <div className="favoris-tab">
              <h2>Annonces sauvegardées</h2>
              {favoris.length === 0 ? <p>Aucun favori pour le moment.</p> : (
                <div className="grid-list">
                  {favoris.map(f => (
                    <Link to={`/annonce/${f.Annonce.id}`} key={f.id} className="mini-card">
                      <img src={f.Annonce.images[0] || 'https://via.placeholder.com/150'} alt="" />
                      <div className="mini-card-info">
                        <h4>{f.Annonce.titre}</h4>
                        <p className="price">{f.Annonce.prix} DH</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'annonces' && (
            <div className="annonces-tab">
              <h2>Gérer mes annonces</h2>
              <div className="grid-list">
                {mesAnnonces.map(a => (
                  <Link to={`/annonce/${a.id}`} key={a.id} className="mini-card">
                    <img src={a.images[0] || 'https://via.placeholder.com/150'} alt="" />
                    <div className="mini-card-info">
                      <h4>{a.titre}</h4>
                      <p className="price">{a.prix} DH</p>
                      <span className={`statut ${a.statut.toLowerCase()}`}>{a.statut}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'offres' && (
            <div className="offres-tab">
              <h2>Offres reçues sur vos annonces</h2>
              {offresRecues.length === 0 ? <p>Aucune offre pour l'instant.</p> : (
                <div className="offres-list">
                  {offresRecues.map(o => (
                    <div key={o.id} className="offre-item">
                      <div className="offre-details">
                        <h4>Annonce : {o.annonce?.titre}</h4>
                        <p>Acheteur : {o.acheteur?.nom} ({o.acheteur?.telephone || 'Pas de tel'})</p>
                        <p className="offre-prix">Prix proposé : <strong>{o.prixPropose} DH</strong> (Original : {o.annonce?.prix} DH)</p>
                      </div>
                      <div className="offre-actions">
                        {o.statut === 'En attente' ? (
                          <>
                            <button onClick={() => handleStatutOffre(o.id, 'Acceptée')} className="btn-accept">Accepter</button>
                            <button onClick={() => handleStatutOffre(o.id, 'Refusée')} className="btn-reject">Refuser</button>
                          </>
                        ) : (
                          <span className={`badge ${o.statut.toLowerCase()}`}>{o.statut}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        .profile-page { min-height: 100vh; background-color: transparent; color: var(--text-primary); padding: 40px 20px; position: relative; font-family: 'Inter', sans-serif; }
        .grid-bg { position: fixed; inset: 0; background-image: radial-gradient(var(--grid-dots) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
        .profile-container { max-width: 900px; margin: 0 auto; position: relative; z-index: 10; }
        
        .glass-card { background: var(--card-bg); backdrop-filter: blur(20px); border: 1px solid var(--card-border); border-radius: 20px; padding: 30px; }
        
        .profile-header { display: flex; align-items: center; gap: 24px; margin-bottom: 30px; }
        .avatar-large { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #14b8a6); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 800; overflow: hidden; color: white; }
        .avatar-large img { width: 100%; height: 100%; object-fit: cover; }
        .user-details h1 { font-size: 28px; margin: 0 0 5px; color: var(--text-primary); }
        .user-details p { color: var(--text-secondary); margin: 0 0 10px; }
        .badge { padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge.vendeur { background: rgba(249,115,22,0.2); color: #ea580c; }
        .badge.acheteur { background: rgba(20,184,166,0.2); color: #0d9488; }
        .badge.acceptée { background: rgba(34,197,94,0.2); color: #16a34a; }
        .badge.refusée { background: rgba(239,68,68,0.2); color: #dc2626; }

        .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--card-border); padding-bottom: 10px; overflow-x: auto; }
        .tabs button { background: transparent; border: none; color: var(--text-secondary); font-size: 15px; font-weight: 600; padding: 10px 20px; cursor: pointer; border-radius: 100px; transition: 0.2s; white-space: nowrap; }
        .tabs button:hover { color: var(--text-primary); background: var(--card-bg-hover); }
        .tabs button.active { background: rgba(249,115,22,0.15); color: #ea580c; }

        .tab-content h2 { margin-bottom: 20px; font-size: 22px; border-bottom: 1px solid var(--card-border); padding-bottom: 10px; color: var(--text-primary); }
        
        .profile-form { display: flex; flex-direction: column; gap: 20px; max-width: 500px; }
        .form-group label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
        .form-group input { width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); padding: 12px 16px; border-radius: 10px; color: var(--text-primary); outline: none; transition: 0.2s; }
        .form-group input:focus { border-color: #f97316; background: var(--input-focus-bg); }
        .btn-primary { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; padding: 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .alert { background: rgba(34,197,94,0.1); color: #16a34a; padding: 10px; border-radius: 8px; margin-bottom: 15px; border: 1px solid rgba(34,197,94,0.2); }

        .grid-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
        .mini-card { background: var(--card-bg-hover); border-radius: 12px; overflow: hidden; text-decoration: none; color: var(--text-primary); transition: transform 0.2s; border: 1px solid var(--card-border); }
        .mini-card:hover { transform: translateY(-5px); border-color: var(--card-border-light); }
        .mini-card img { width: 100%; height: 120px; object-fit: cover; }
        .mini-card-info { padding: 12px; }
        .mini-card-info h4 { margin: 0 0 5px; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary); }
        .price { color: #2dd4bf; font-weight: 700; margin: 0; }
        .statut { display: inline-block; margin-top: 5px; font-size: 11px; padding: 2px 8px; border-radius: 4px; background: var(--card-bg); color: var(--text-secondary); border: 1px solid var(--card-border); }
        .statut.vendu { background: rgba(239,68,68,0.1); color: #dc2626; border-color: rgba(239,68,68,0.2); }

        .offres-list { display: flex; flex-direction: column; gap: 15px; }
        .offre-item { background: var(--card-bg-hover); border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
        .offre-details h4 { margin: 0 0 5px; color: #ea580c; }
        .offre-details p { margin: 0 0 5px; font-size: 14px; color: var(--text-secondary); }
        .offre-prix strong { color: #2dd4bf; font-size: 16px; }
        .offre-actions { display: flex; gap: 10px; }
        .btn-accept { background: rgba(34,197,94,0.1); color: #16a34a; border: 1px solid rgba(34,197,94,0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-reject { background: rgba(239,68,68,0.1); color: #dc2626; border: 1px solid rgba(239,68,68,0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .btn-accept:hover { background: rgba(34,197,94,0.2); }
        .btn-reject:hover { background: rgba(239,68,68,0.2); }
      `}</style>
    </div>
  );
}
