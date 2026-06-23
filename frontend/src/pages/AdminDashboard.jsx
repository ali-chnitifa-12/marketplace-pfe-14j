import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import gsap from 'gsap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

/* Animated count-up hook */
function useCountUp(target, duration = 1.5) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

/* Stat card with count-up */
function StatCard({ label, value, color, icon, delay = 0 }) {
  const ref = useRef(null);
  const [animate, setAnimate] = useState(false);
  const count = useCountUp(animate ? value : 0, 1.2);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
      gsap.fromTo(ref.current, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.7)' });
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={ref} className="stat-card" style={{ opacity: 0 }}>
      <div className="stat-icon" style={{ background: `${color}18`, color }}>{icon}</div>
      <p className="stat-value" style={{ color }}>{count.toLocaleString()}</p>
      <h3>{label}</h3>
      <div className="stat-bar" style={{ background: `${color}30` }}>
        <div className="stat-bar-fill" style={{ background: color, width: '100%', animation: `statFill 1s ${delay/1000 + 0.3}s both ease-out` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const headerRef    = useRef(null);
  const tableRef     = useRef(null);

  const [stats, setStats] = useState({ totalUsers:0, totalAdmins:0, totalBanned:0, totalActive:0, totalAnnonces:0, totalFlaggedAnnonces:0, totalCommandes:0, annoncesParCategorie:[] });
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
      setStats(statsRes.data); setUsers(usersRes.data); setFlaggedAnnonces(flaggedRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        gsap.fromTo('.chart-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, delay: 0.8, ease: 'power3.out' });
        gsap.fromTo('.admin-table tr', { x: -20, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.05, delay: 1.0, duration: 0.4, ease: 'power2.out' });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleBan = async (id) => {
    try { const token = localStorage.getItem('token'); await axios.put(`http://localhost:5000/api/admin/users/${id}/ban`, {}, { headers: { Authorization: `Bearer ${token}` } }); fetchAdminData(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };
  const handleRole = async (id, currentRole) => {
    try { const token = localStorage.getItem('token'); const newRole = currentRole === 'admin' ? 'user' : 'admin'; await axios.put(`http://localhost:5000/api/admin/users/${id}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } }); fetchAdminData(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur définitivement ?")) return;
    try { const token = localStorage.getItem('token'); await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchAdminData(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };
  const handleApproveAnnonce = async (id) => {
    try { const token = localStorage.getItem('token'); await axios.put(`http://localhost:5000/api/admin/annonces/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } }); fetchAdminData(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };
  const handleDeleteAnnonce = async (id) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    try { const token = localStorage.getItem('token'); await axios.delete(`http://localhost:5000/api/admin/annonces/${id}`, { headers: { Authorization: `Bearer ${token}` } }); fetchAdminData(); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  if (loading) return (
    <div className="admin-page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.1)', borderTop:'2px solid #8b5cf6', animation:'spin 0.8s linear infinite', margin:'0 auto 20px' }} />
        <p style={{ color:'#64748b', fontSize:'14px' }}>Chargement du Dashboard...</p>
      </div>
    </div>
  );

  const categoryLabels = stats.annoncesParCategorie?.map(i => i.categorie) || [];
  const categoryCounts = stats.annoncesParCategorie?.map(i => i.count) || [];
  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' } }
    }
  };

  return (
    <div ref={containerRef} className="admin-page">
      <div className="grid-bg" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="admin-container">

        {/* Header */}
        <div ref={headerRef} className="admin-header" style={{ opacity:0 }}>
          <div>
            <h1>Dashboard Admin</h1>
            <p>Connecté en tant que <strong>{user?.nom}</strong></p>
          </div>
          <div style={{ display:'flex', gap:'12px' }}>
            <Link to="/" className="btn-home">🏠 Accueil</Link>
            <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout">⏻ Déconnexion</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard label="Utilisateurs"    value={stats.totalUsers}          color="#8b5cf6" icon="👥" delay={0}   />
          <StatCard label="Comptes Actifs"  value={stats.totalActive}          color="#10b981" icon="✅" delay={80}  />
          <StatCard label="Comptes Bannis"  value={stats.totalBanned}          color="#ef4444" icon="🚫" delay={160} />
          <StatCard label="Annonces"        value={stats.totalAnnonces || 0}   color="#f97316" icon="📢" delay={240} />
          <StatCard label="Commandes"       value={stats.totalCommandes || 0}  color="#14b8a6" icon="📦" delay={320} />
          <StatCard label="Signalées"       value={stats.totalFlaggedAnnonces || 0} color="#ec4899" icon="🚩" delay={400} />
        </div>

        {/* Charts */}
        <div className="charts-container">
          <div className="chart-card">
            <h3>📊 Annonces par Catégorie</h3>
            <div className="chart-wrap">
              <Bar data={{ labels: categoryLabels.length ? categoryLabels : ['Aucune'], datasets: [{ label: 'Annonces', data: categoryCounts.length ? categoryCounts : [0], backgroundColor: 'rgba(249,115,22,0.6)', borderColor: '#ea580c', borderWidth: 2, borderRadius: 8 }] }} options={chartOpts} />
            </div>
          </div>
          <div className="chart-card">
            <h3>🥧 Répartition Utilisateurs</h3>
            <div className="chart-wrap">
              <Pie data={{ labels: ['Actifs', 'Bannis'], datasets: [{ data: [stats.totalActive || 0, stats.totalBanned || 0], backgroundColor: ['rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)'], borderColor: ['#10b981', '#ef4444'], borderWidth: 2 }] }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } } }} />
            </div>
          </div>
        </div>

        {/* Flagged Annonces */}
        {flaggedAnnonces.length > 0 && (
          <div className="section-card" style={{ marginBottom:'30px' }}>
            <h2>🚩 Annonces Signalées par l'anti-spam IA</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Titre</th><th>Vendeur</th><th>Prix</th><th>Catégorie</th><th>Actions</th></tr></thead>
                <tbody>
                  {flaggedAnnonces.map(a => (
                    <tr key={a.id}>
                      <td><Link to={`/annonce/${a.id}`} style={{ color:'#f97316', fontWeight:700, textDecoration:'none' }}>{a.titre}</Link></td>
                      <td>{a.User?.nom || 'Inconnu'}</td>
                      <td><strong>{a.prix} DH</strong></td>
                      <td>{a.categorie}</td>
                      <td><div className="action-btns">
                        <button onClick={() => handleApproveAnnonce(a.id)} className="btn-approve">Approuver</button>
                        <button onClick={() => handleDeleteAnnonce(a.id)} className="btn-delete">Supprimer</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div ref={tableRef} className="section-card">
          <h2>👥 Gestion des Utilisateurs</h2>
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color:'var(--text-secondary)', fontSize:'12px' }}>#{u.id}</td>
                    <td style={{ fontWeight:600 }}>{u.nom}</td>
                    <td style={{ color:'var(--text-secondary)', fontSize:'13px' }}>{u.email}</td>
                    <td><span className={`badge role-${u.role}`}>{u.role}</span></td>
                    <td><span className={`badge ${u.isBanned ? 'banned' : 'active'}`}>{u.isBanned ? 'Banni' : 'Actif'}</span></td>
                    <td>
                      {u.id !== user?.id && (
                        <div className="action-btns">
                          <button onClick={() => handleRole(u.id, u.role)} className="btn-role">{u.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}</button>
                          <button onClick={() => handleBan(u.id)} className={`btn-ban ${u.isBanned ? 'unban' : ''}`}>{u.isBanned ? 'Débannir' : 'Bannir'}</button>
                          <button onClick={() => handleDelete(u.id)} className="btn-delete">Supprimer</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        .admin-page { min-height:100vh; background-color:transparent; color:var(--text-primary); padding:40px 24px 60px; font-family:'Inter',sans-serif; position:relative; }
        .grid-bg { position:fixed; inset:0; background-image:radial-gradient(var(--grid-dots) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:0; }
        .orb { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; z-index:0; }
        .orb-a { width:600px; height:600px; background:radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%); top:-200px; left:-100px; }
        .orb-b { width:500px; height:500px; background:radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 70%); bottom:-150px; right:-100px; }
        .admin-container { max-width:1260px; margin:0 auto; position:relative; z-index:10; }

        .admin-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:40px; flex-wrap:wrap; gap:16px; }
        .admin-header h1 { font-size:32px; font-weight:900; letter-spacing:-0.03em; background:linear-gradient(135deg,#a78bfa,#7c3aed); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 4px; }
        .admin-header p { color:var(--text-secondary); font-size:14px; margin:0; }
        .btn-logout { background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.2); padding:10px 20px; border-radius:12px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; transition:all 0.25s; font-size:13px; }
        .btn-logout:hover { background:rgba(239,68,68,0.18); transform:translateY(-2px); }
        .btn-home { background:rgba(139,92,246,0.08); color:#a78bfa; border:1px solid rgba(139,92,246,0.2); padding:10px 18px; border-radius:12px; font-weight:700; font-size:13px; text-decoration:none; transition:all 0.25s; display:inline-flex; align-items:center; gap:6px; }
        .btn-home:hover { background:rgba(139,92,246,0.18); transform:translateY(-2px); }

        /* Stats Grid */
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:18px; margin-bottom:36px; }
        .stat-card { background:var(--card-bg); border:1px solid var(--card-border); padding:24px 20px; border-radius:20px; text-align:center; cursor:default; transition:transform 0.3s,box-shadow 0.3s,border-color 0.3s; position:relative; overflow:hidden; }
        .stat-card::after { content:''; position:absolute; inset:0; border-radius:20px; opacity:0; transition:opacity 0.4s; }
        .stat-card:hover { transform:translateY(-6px); box-shadow:0 20px 50px rgba(0,0,0,0.12); }
        .stat-icon { width:48px; height:48px; border-radius:14px; font-size:22px; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
        .stat-value { font-size:40px; font-weight:900; margin:0 0 6px; letter-spacing:-0.03em; }
        .stat-card h3 { font-size:12px; color:var(--text-secondary); font-weight:700; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 12px; }
        .stat-bar { height:3px; border-radius:10px; overflow:hidden; }
        .stat-bar-fill { height:100%; border-radius:10px; }
        @keyframes statFill { from{width:0%} to{width:100%} }

        /* Charts */
        .charts-container { display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:20px; margin-bottom:36px; }
        .chart-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:22px; padding:28px; min-height:320px; display:flex; flex-direction:column; }
        .chart-card h3 { font-size:16px; font-weight:700; color:var(--text-primary); margin:0 0 20px; }
        .chart-wrap { flex:1; position:relative; min-height:240px; }

        /* Tables */
        .section-card { background:var(--card-bg); border:1px solid var(--card-border); border-radius:22px; padding:30px; }
        .section-card h2 { font-size:20px; font-weight:800; color:var(--text-primary); margin:0 0 22px; }
        .table-responsive { overflow-x:auto; }
        .admin-table { width:100%; border-collapse:collapse; }
        .admin-table th,.admin-table td { padding:14px 16px; text-align:left; border-bottom:1px solid var(--card-border); color:var(--text-primary); }
        .admin-table th { color:var(--text-secondary); font-size:11px; text-transform:uppercase; letter-spacing:0.07em; font-weight:700; }
        .admin-table tr { transition:background 0.2s; }
        .admin-table tbody tr:hover { background:var(--card-bg-hover); }

        .badge { padding:4px 12px; border-radius:100px; font-size:11px; font-weight:800; text-transform:uppercase; display:inline-block; letter-spacing:0.03em; }
        .role-admin { background:rgba(139,92,246,0.15); color:#8b5cf6; }
        .role-user { background:var(--card-bg-hover); color:var(--text-secondary); border:1px solid var(--card-border); }
        .active { background:rgba(16,185,129,0.12); color:#10b981; }
        .banned { background:rgba(239,68,68,0.12); color:#ef4444; }

        .action-btns { display:flex; gap:6px; flex-wrap:wrap; }
        .action-btns button { border:none; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .action-btns button:hover { transform:translateY(-2px); }
        .btn-role { background:rgba(139,92,246,0.1); color:#8b5cf6; }
        .btn-ban { background:rgba(245,158,11,0.1); color:#d97706; }
        .btn-ban.unban { background:rgba(16,185,129,0.1); color:#10b981; }
        .btn-approve { background:rgba(16,185,129,0.1); color:#10b981; }
        .btn-delete { background:rgba(239,68,68,0.1); color:#ef4444; }
      `}</style>
    </div>
  );
}
