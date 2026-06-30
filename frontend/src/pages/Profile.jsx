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
  const [mesCommandes, setMesCommandes] = useState([]);
  const [commandesRecues, setCommandesRecues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offresEnvoyees, setOffresEnvoyees] = useState([]);
  const [mesEncheres, setMesEncheres] = useState([]);
  const [editingOffreId, setEditingOffreId] = useState(null);
  const [editOffrePrix, setEditOffrePrix] = useState('');
  const [editingEnchereId, setEditingEnchereId] = useState(null);
  const [editEnchereMontant, setEditEnchereMontant] = useState('');

  // Ad CRUD states
  const [editingAnnonceId, setEditingAnnonceId] = useState(null);
  const [editTitre, setEditTitre] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrix, setEditPrix] = useState('');
  const [editCategorie, setEditCategorie] = useState('');
  const [editEtat, setEditEtat] = useState('');
  const [editStatut, setEditStatut] = useState('');

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

      const resCmd = await axios.get('http://localhost:5000/api/commandes/mes-achats', { headers });
      setMesCommandes(resCmd.data);

      const resOffresEnv = await axios.get('http://localhost:5000/api/offres/emises', { headers });
      setOffresEnvoyees(resOffresEnv.data);

      const resEncheres = await axios.get('http://localhost:5000/api/encheres/mes-encheres', { headers });
      setMesEncheres(resEncheres.data);
      
      if (user?.typeCompte === 'vendeur') {
        const resAnn = await axios.get(`http://localhost:5000/api/annonces?userId=${user.id}`);
        const allAnn = await axios.get('http://localhost:5000/api/annonces');
        setMesAnnonces(allAnn.data.filter(a => a.userId === user.id));
        
        const resOffres = await axios.get('http://localhost:5000/api/offres/recues', { headers });
        setOffresRecues(resOffres.data);

        const resCmdRecues = await axios.get('http://localhost:5000/api/commandes/mes-ventes', { headers });
        setCommandesRecues(resCmdRecues.data);
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

  const handleUpdateOffre = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/offres/${id}`, { prixPropose: parseFloat(editOffrePrix) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingOffreId(null);
      fetchData(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteOffre = async (id) => {
    if (!window.confirm("Annuler cette offre définitivement ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/offres/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleUpdateEnchere = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/encheres/${id}`, { montant: parseFloat(editEnchereMontant) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingEnchereId(null);
      fetchData(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteEnchere = async (id) => {
    if (!window.confirm("Retirer votre enchère ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/encheres/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleStartEditAnnonce = (a) => {
    setEditingAnnonceId(a.id);
    setEditTitre(a.titre);
    setEditDescription(a.description);
    setEditPrix(a.prix);
    setEditCategorie(a.categorie);
    setEditEtat(a.etat);
    setEditStatut(a.statut);
  };

  const handleUpdateAnnonce = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/annonces/${editingAnnonceId}`, {
        titre: editTitre,
        description: editDescription,
        prix: parseFloat(editPrix),
        categorie: editCategorie,
        etat: editEtat,
        statut: editStatut
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingAnnonceId(null);
      fetchData(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la modification de l'annonce");
    }
  };

  const handleDeleteAnnonce = async (id) => {
    if (!window.confirm("Supprimer cette annonce définitivement ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/annonces/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression de l'annonce");
    }
  };

  const handleUpdateCommandeStatut = async (id, statut) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/commandes/${id}/statut`, { statut }, {
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
          <button className={activeTab === 'achats' ? 'active' : ''} onClick={() => setActiveTab('achats')}>Mes Achats</button>
          <button className={activeTab === 'offresEnvoyees' ? 'active' : ''} onClick={() => setActiveTab('offresEnvoyees')}>Offres Envoyées</button>
          <button className={activeTab === 'mesEncheres' ? 'active' : ''} onClick={() => setActiveTab('mesEncheres')}>Mes Enchères</button>
          {user?.typeCompte === 'vendeur' && (
            <>
              <button className={activeTab === 'annonces' ? 'active' : ''} onClick={() => setActiveTab('annonces')}>Mes Annonces</button>
              <button className={activeTab === 'offres' ? 'active' : ''} onClick={() => setActiveTab('offres')}>Offres Reçues</button>
              <button className={activeTab === 'ventes' ? 'active' : ''} onClick={() => setActiveTab('ventes')}>Commandes Reçues</button>
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
                  <div key={a.id} className="mini-card">
                    <Link to={`/annonce/${a.id}`}>
                      <img src={a.images[0] || 'https://via.placeholder.com/150'} alt="" />
                    </Link>
                    <div className="mini-card-info">
                      <Link to={`/annonce/${a.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h4 style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.titre}</h4>
                      </Link>
                      <p className="price" style={{ margin: '5px 0' }}>{a.prix} DH</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        <span className={`statut ${a.statut.toLowerCase()}`}>{a.statut}</span>
                        <span className="statut" style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.2)' }}>
                          {a.typeAnnonce === 'Enchere' ? '🔨 Enchère' : '💰 Fixe'}
                        </span>
                      </div>
                      
                      <div className="annonce-card-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--card-border)', paddingTop: '8px' }}>
                        <button onClick={() => handleStartEditAnnonce(a)} className="btn-accept" style={{ padding: '6px 8px', fontSize: '12px', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>✏️ Modifier</button>
                        <button onClick={() => handleDeleteAnnonce(a.id)} className="btn-reject" style={{ padding: '6px 8px', fontSize: '12px', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>🗑️ Supprimer</button>
                      </div>
                    </div>
                  </div>
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

          {activeTab === 'achats' && (
            <div className="achats-tab">
              <h2>Mes Achats (Commandes passées)</h2>
              {mesCommandes.length === 0 ? <p>Aucun achat pour le moment.</p> : (
                <div className="commandes-list">
                  {mesCommandes.map(cmd => (
                    <div key={cmd.id} className="commande-item">
                      <div className="commande-details">
                        <h4>Annonce : <Link to={`/annonce/${cmd.Annonce?.id}`}>{cmd.Annonce?.titre}</Link></h4>
                        <p className="price">Prix : <strong>{cmd.prixTotal} DH</strong></p>
                        <p>Vendeur : {cmd.Annonce?.User?.nom || 'Inconnu'} ({cmd.Annonce?.User?.telephone || 'Pas de tel'})</p>
                        <p>Adresse de livraison : {cmd.adresseLivraison}</p>
                        <p>Mode de livraison : {cmd.modeLivraison} {cmd.modeLivraison === 'Point Relais' && `(ID Point: ${cmd.pointRelaisId})`}</p>
                      </div>
                      <div className="commande-status-col">
                        <span className={`badge ${cmd.statut.toLowerCase().replace(' ', '-')}`}>{cmd.statut}</span>
                        {cmd.Annonce?.User?.telephone && (
                          <a href={`https://wa.me/${cmd.Annonce.User.telephone.replace('+', '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-small">
                            Contacter Vendeur
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ventes' && (
            <div className="ventes-tab">
              <h2>Commandes reçues</h2>
              {commandesRecues.length === 0 ? <p>Aucune commande reçue pour le moment.</p> : (
                <div className="commandes-list">
                  {commandesRecues.map(cmd => (
                    <div key={cmd.id} className="commande-item">
                      <div className="commande-details">
                        <h4>Annonce : <Link to={`/annonce/${cmd.Annonce?.id}`}>{cmd.Annonce?.titre}</Link></h4>
                        <p className="price">Prix : <strong>{cmd.prixTotal} DH</strong></p>
                        <p>Acheteur : {cmd.acheteur?.nom} ({cmd.telephone || 'Pas de tel'})</p>
                        <p>Adresse de livraison : {cmd.adresseLivraison}</p>
                        <p>Mode de livraison : {cmd.modeLivraison} {cmd.modeLivraison === 'Point Relais' && `(ID Point: ${cmd.pointRelaisId})`}</p>
                      </div>
                      <div className="commande-actions-col">
                        <span className={`badge ${cmd.statut.toLowerCase().replace(' ', '-')}`}>{cmd.statut}</span>
                        <div className="status-update">
                          <label>Modifier le statut :</label>
                          <select 
                            value={cmd.statut} 
                            onChange={(e) => handleUpdateCommandeStatut(cmd.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="En attente">En attente</option>
                            <option value="Expédiée">Expédiée</option>
                            <option value="Livrée">Livrée</option>
                            <option value="Annulée">Annulée</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'offresEnvoyees' && (
            <div className="offres-tab">
              <h2>Vos offres envoyées</h2>
              {offresEnvoyees.length === 0 ? <p>Aucune offre envoyée pour le moment.</p> : (
                <div className="offres-list">
                  {offresEnvoyees.map(o => (
                    <div key={o.id} className="offre-item">
                      <div className="offre-details">
                        <h4>Annonce : {o.annonce?.titre}</h4>
                        <p className="offre-prix">
                          Prix proposé : <strong>{o.prixPropose} DH</strong> (Original : {o.annonce?.prix} DH)
                        </p>
                        {o.statut === 'Acceptée' && o.annonce?.User && (
                          <div className="seller-contact-info" style={{ marginTop: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ margin: 0 }}>👤 Vendeur : <strong>{o.annonce.User.nom}</strong> {o.annonce.User.telephone && `• 📞 ${o.annonce.User.telephone}`}</p>
                          </div>
                        )}
                      </div>
                      <div className="offre-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <span className={`badge ${o.statut.toLowerCase()}`}>{o.statut}</span>
                        
                        {o.statut === 'En attente' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {editingOffreId === o.id ? (
                              <>
                                <input 
                                  type="number" 
                                  value={editOffrePrix} 
                                  onChange={e => setEditOffrePrix(e.target.value)} 
                                  style={{ width: '80px', padding: '4px', borderRadius: '4px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} 
                                />
                                <button onClick={() => handleUpdateOffre(o.id)} className="btn-accept" style={{ padding: '4px 8px' }}>Sauver</button>
                                <button onClick={() => setEditingOffreId(null)} className="btn-reject" style={{ padding: '4px 8px' }}>X</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditingOffreId(o.id); setEditOffrePrix(o.prixPropose); }} className="btn-accept" style={{ padding: '6px 12px', fontSize: '12px' }}>Modifier</button>
                                <button onClick={() => handleDeleteOffre(o.id)} className="btn-reject" style={{ padding: '6px 12px', fontSize: '12px' }}>Annuler</button>
                              </>
                            )}
                          </div>
                        )}

                        {o.statut === 'Acceptée' && o.annonce?.User?.telephone && (
                          <a 
                            href={`https://wa.me/${o.annonce.User.telephone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-whatsapp-small"
                          >
                            Contacter Vendeur
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mesEncheres' && (
            <div className="offres-tab">
              <h2>Vos enchères placées</h2>
              {mesEncheres.length === 0 ? <p>Aucune enchère placée pour le moment.</p> : (
                <div className="offres-list">
                  {mesEncheres.map(e => (
                    <div key={e.id} className="offre-item">
                      <div className="offre-details">
                        <h4>Annonce : {e.Annonce?.titre}</h4>
                        <p className="offre-prix">
                          Votre enchère : <strong>{e.montant} DH</strong> (Prix départ : {e.Annonce?.prix} DH)
                        </p>
                      </div>
                      <div className="offre-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <span className={`badge ${e.Annonce?.statut === 'Disponible' ? 'acceptée' : 'refusée'}`}>
                          {e.Annonce?.statut === 'Disponible' ? 'En Cours' : 'Terminée'}
                        </span>
                        
                        {e.Annonce?.statut === 'Disponible' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {editingEnchereId === e.id ? (
                              <>
                                <input 
                                  type="number" 
                                  value={editEnchereMontant} 
                                  onChange={e => setEditEnchereMontant(e.target.value)} 
                                  style={{ width: '80px', padding: '4px', borderRadius: '4px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)' }} 
                                />
                                <button onClick={() => handleUpdateEnchere(e.id)} className="btn-accept" style={{ padding: '4px 8px' }}>Miser</button>
                                <button onClick={() => setEditingEnchereId(null)} className="btn-reject" style={{ padding: '4px 8px' }}>X</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditingEnchereId(e.id); setEditEnchereMontant(e.montant); }} className="btn-accept" style={{ padding: '6px 12px', fontSize: '12px' }}>Surenchérir</button>
                                <button onClick={() => handleDeleteEnchere(e.id)} className="btn-reject" style={{ padding: '6px 12px', fontSize: '12px' }}>Retirer</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {editingAnnonceId && (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="modal-content glass-card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '15px' }}>✏️ Modifier l'annonce</h2>
                <form onSubmit={handleUpdateAnnonce} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group">
                    <label>Titre de l'annonce</label>
                    <input type="text" value={editTitre} onChange={e => setEditTitre(e.target.value)} required style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label>Prix (DH)</label>
                      <input type="number" value={editPrix} onChange={e => setEditPrix(e.target.value)} required min="0" step="0.01" style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', padding: '12px 16px', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Statut</label>
                      <select value={editStatut} onChange={e => setEditStatut(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="Disponible">Disponible</option>
                        <option value="Vendu">Vendu</option>
                        <option value="Annulé">Annulé</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label>Catégorie</label>
                      <select value={editCategorie} onChange={e => setEditCategorie(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="Électronique">📱 Électronique</option>
                        <option value="Vêtements">👕 Vêtements</option>
                        <option value="Maison">🏠 Maison & Déco</option>
                        <option value="Véhicules">🚗 Véhicules</option>
                        <option value="Services">🔧 Services</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>État du produit</label>
                      <select value={editEtat} onChange={e => setEditEtat(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', outline: 'none' }}>
                        <option value="Neuf">Neuf</option>
                        <option value="Très bon état">Très bon état</option>
                        <option value="Bon état">Bon état</option>
                        <option value="Satisfaisant">Satisfaisant</option>
                        <option value="Pour pièces">Pour pièces</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} required rows="4" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} />
                  </div>
                  <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setEditingAnnonceId(null)} className="btn-reject" style={{ flex: 1, padding: '12px', cursor: 'pointer' }}>Annuler</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', cursor: 'pointer' }}>Enregistrer</button>
                  </div>
                </form>
              </div>
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

        .commandes-list { display: flex; flex-direction: column; gap: 15px; }
        .commande-item { background: var(--card-bg-hover); border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
        .commande-details h4 { margin: 0 0 5px; color: #ea580c; }
        .commande-details h4 a { text-decoration: none; color: inherit; }
        .commande-details h4 a:hover { text-decoration: underline; }
        .commande-details p { margin: 0 0 5px; font-size: 14px; color: var(--text-secondary); }
        .commande-status-col, .commande-actions-col { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        .btn-whatsapp-small { background: #25d366; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .btn-whatsapp-small:hover { background: #128c7e; }
        .status-update { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .status-update label { font-size: 11px; color: var(--text-secondary); }
        .status-select { background: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-primary); padding: 4px 8px; border-radius: 6px; font-size: 13px; outline: none; }
        .status-select:focus { border-color: #f97316; }
        
        .badge.en-attente { background: rgba(249,115,22,0.2); color: #ea580c; }
        .badge.expédiée { background: rgba(59,130,246,0.2); color: #2563eb; }
        .badge.livrée { background: rgba(34,197,94,0.2); color: #16a34a; }
        .badge.annulée { background: rgba(239,68,68,0.2); color: #dc2626; }
      `}</style>
    </div>
  );
}
