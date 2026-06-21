import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalBanned: 0,
    totalActive: 0,
    totalAnnonces: 0,
    totalFlaggedAnnonces: 0,
    totalCommandes: 0,
    annoncesParCategorie: []
  });
  const [users, setUsers] = useState([]);
  const [flaggedAnnonces, setFlaggedAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, flaggedRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers }),
        axios.get('http://localhost:5000/api/admin/users', { headers }),
        axios.get('http://localhost:5000/api/admin/annonces/flagged', { headers })
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFlaggedAnnonces(flaggedRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleBan = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/users/${id}/ban`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleRole = async (id, currentRole) => {
    try {
      const token = localStorage.getItem('token');
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await axios.put(`http://localhost:5000/api/admin/users/${id}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur définitivement ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleApproveAnnonce = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/annonces/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDeleteAnnonce = async (id) => {
    if (!window.confirm("Supprimer cette annonce définitivement ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/annonces/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  if (loading) return <div className="admin-page"><div className="grid-bg"/><h2>Chargement du Dashboard...</h2></div>;

  // Chart configs
  const categoryLabels = stats.annoncesParCategorie?.map(item => item.categorie) || [];
  const categoryCounts = stats.annoncesParCategorie?.map(item => item.count) || [];

  const barChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Aucune annonce'],
    datasets: [
      {
        label: 'Annonces par Catégorie',
        data: categoryCounts.length > 0 ? categoryCounts : [0],
        backgroundColor: 'rgba(249, 115, 22, 0.6)',
        borderColor: '#ea580c',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Comptes Actifs', 'Comptes Bannis'],
    datasets: [
      {
        data: [stats.totalActive || 0, stats.totalBanned || 0],
        backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)'],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0', // text primary in dark mode style
          font: { family: 'Inter', size: 12 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="grid-bg" />
      <div className="admin-container">
        
        <div className="admin-header">
          <div>
            <h1>Dashboard Administrateur</h1>
            <p>Connecté en tant que {user?.nom}</p>
          </div>
          <button onClick={logout} className="btn-logout">Déconnexion</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Utilisateurs</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Comptes Actifs</h3>
            <p className="stat-value text-green">{stats.totalActive}</p>
          </div>
          <div className="stat-card">
            <h3>Comptes Bannis</h3>
            <p className="stat-value text-red">{stats.totalBanned}</p>
          </div>
          <div className="stat-card">
            <h3>Annonces</h3>
            <p className="stat-value text-orange">{stats.totalAnnonces || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Commandes</h3>
            <p className="stat-value text-teal">{stats.totalCommandes || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Annonces Signalées</h3>
            <p className="stat-value text-pink">{stats.totalFlaggedAnnonces || 0}</p>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-card">
            <h3>Distribution des Annonces par Catégorie</h3>
            <div className="chart-wrapper">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
          <div className="chart-card">
            <h3>Répartition des Utilisateurs</h3>
            <div className="chart-wrapper">
              <Pie data={pieChartData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#e2e8f0',
                      font: { family: 'Inter', size: 12 }
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        <div className="users-section glass-card" style={{ marginBottom: '40px' }}>
          <h2>Modération (Annonces Signalées par l'anti-spam IA)</h2>
          {flaggedAnnonces.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Aucune annonce signalée pour le moment.</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Vendeur</th>
                    <th>Prix</th>
                    <th>Catégorie</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedAnnonces.map(a => (
                    <tr key={a.id}>
                      <td>
                        <Link to={`/annonce/${a.id}`} style={{ color: '#ea580c', fontWeight: 600, textDecoration: 'none' }}>
                          {a.titre}
                        </Link>
                      </td>
                      <td>{a.User?.nom || 'Inconnu'}</td>
                      <td>{a.prix} DH</td>
                      <td>{a.categorie}</td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleApproveAnnonce(a.id)} className="btn-approve">
                            Approuver
                          </button>
                          <button onClick={() => handleDeleteAnnonce(a.id)} className="btn-delete">
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="users-section glass-card">
          <h2>Gestion des Utilisateurs</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>{u.nom}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                    <td>
                      {u.isBanned 
                        ? <span className="badge banned">Banni</span> 
                        : <span className="badge active">Actif</span>}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {u.id !== user?.id && (
                          <>
                            <button onClick={() => handleRole(u.id, u.role)} className="btn-role">
                              {u.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                            </button>
                            <button onClick={() => handleBan(u.id)} className={`btn-ban ${u.isBanned ? 'unban' : ''}`}>
                              {u.isBanned ? 'Débannir' : 'Bannir'}
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="btn-delete">Supprimer</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        
        .admin-page { min-height: 100vh; background-color: transparent; color: var(--text-primary); padding: 40px 20px; font-family: 'Inter', sans-serif; }
        .grid-bg { position: fixed; inset: 0; background-image: radial-gradient(var(--grid-dots) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
        .admin-container { max-width: 1200px; margin: 0 auto; position: relative; z-index: 10; }
        
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .admin-header h1 { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #a78bfa, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 5px; }
        .btn-logout { background: rgba(239,68,68,0.1); color: #dc2626; border: 1px solid rgba(239,68,68,0.2); padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-logout:hover { background: rgba(239,68,68,0.2); }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: var(--card-bg); border: 1px solid var(--card-border); padding: 24px; border-radius: 20px; text-align: center; }
        .stat-card h3 { font-size: 13px; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
        .stat-value { font-size: 36px; font-weight: 900; margin: 0; }
        .text-purple { color: #8b5cf6; }
        .text-green { color: #10b981; }
        .text-red { color: #ef4444; }
        .text-orange { color: #f97316; }
        .text-teal { color: #14b8a6; }
        .text-pink { color: #ec4899; }

        .charts-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .chart-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 24px; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 320px; }
        .chart-card h3 { font-size: 16px; margin-bottom: 20px; color: var(--text-primary); text-align: center; }
        .chart-wrapper { width: 100%; height: 260px; position: relative; display: flex; align-items: center; justify-content: center; }

        .glass-card { background: var(--card-bg); backdrop-filter: blur(20px); border: 1px solid var(--card-border); border-radius: 24px; padding: 30px; }
        .users-section h2 { margin-bottom: 20px; font-size: 20px; color: var(--text-primary); }

        .table-responsive { overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th, .admin-table td { padding: 16px; text-align: left; border-bottom: 1px solid var(--card-border); color: var(--text-primary); }
        .admin-table th { color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .admin-table td { font-size: 14px; }

        .badge { padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; }
        .badge.admin { background: rgba(139,92,246,0.15); color: #8b5cf6; }
        .badge.user { background: var(--card-bg-hover); color: var(--text-secondary); border: 1px solid var(--card-border); }
        .badge.active { background: rgba(16,185,129,0.15); color: #10b981; }
        .badge.banned { background: rgba(239,68,68,0.15); color: #ef4444; }

        .action-buttons { display: flex; gap: 8px; }
        .action-buttons button { border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-role { background: rgba(139,92,246,0.1); color: #8b5cf6; }
        .btn-ban { background: rgba(245,158,11,0.1); color: #d97706; }
        .btn-ban.unban { background: rgba(16,185,129,0.1); color: #10b981; }
        .btn-approve { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .btn-delete { background: rgba(239,68,68,0.1); color: #ef4444; }
        .action-buttons button:hover { filter: brightness(0.9); }
      `}</style>
    </div>
  );
}
