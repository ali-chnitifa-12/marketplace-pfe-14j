const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Annonce = require('../models/Annonce');
const Commande = require('../models/Commande');
const sequelize = require('../config/database');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// ─── Get all users ─────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { nom: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'nom', 'email', 'role', 'isBanned', 'photo', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
  }
});

// ─── Get stats ─────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalBanned = await User.count({ where: { isBanned: true } });
    const totalActive = await User.count({ where: { isBanned: false } });

    const totalAnnonces = await Annonce.count();
    const totalFlaggedAnnonces = await Annonce.count({ where: { isFlagged: true } });
    const totalCommandes = await Commande.count();

    // Group ads by category
    const categories = await Annonce.findAll({
      attributes: ['categorie', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['categorie']
    });

    const annoncesParCategorie = categories.map(c => ({
      categorie: c.getDataValue('categorie'),
      count: parseInt(c.getDataValue('count') || 0, 10)
    }));

    // Taux de conversion
    const tauxConversion = totalAnnonces > 0 ? parseFloat(((totalCommandes / totalAnnonces) * 100).toFixed(1)) : 0;

    // Chiffre d'Affaire Total (Statut != Annulée)
    const validCommandes = await Commande.findAll({
      where: { statut: { [Op.ne]: 'Annulée' } },
      attributes: ['prixTotal']
    });
    const chiffreAffaireTotal = validCommandes.reduce((acc, cmd) => acc + cmd.prixTotal, 0);

    // Ventes par Statut
    const statuts = await Commande.findAll({
      attributes: ['statut', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['statut']
    });
    const ventesParStatut = statuts.map(s => ({
      statut: s.getDataValue('statut'),
      count: parseInt(s.getDataValue('count') || 0, 10)
    }));

    // Top Vendeurs (Performances)
    const allCommandesWithVendeur = await Commande.findAll({
      where: { statut: { [Op.ne]: 'Annulée' } },
      include: [{
        model: Annonce,
        attributes: ['id', 'userId'],
        include: [{ model: User, attributes: ['id', 'nom', 'email', 'photo'] }]
      }]
    });

    const vendeursStatsMap = {};
    allCommandesWithVendeur.forEach(cmd => {
      const vendeur = cmd.Annonce?.User;
      if (vendeur) {
        if (!vendeursStatsMap[vendeur.id]) {
          vendeursStatsMap[vendeur.id] = { 
            id: vendeur.id, 
            nom: vendeur.nom, 
            email: vendeur.email, 
            photo: vendeur.photo, 
            totalVentes: 0, 
            totalRevenus: 0 
          };
        }
        vendeursStatsMap[vendeur.id].totalVentes += 1;
        vendeursStatsMap[vendeur.id].totalRevenus += cmd.prixTotal;
      }
    });

    const topVendeurs = Object.values(vendeursStatsMap)
      .sort((a, b) => b.totalRevenus - a.totalRevenus)
      .slice(0, 5); // top 5

    res.json({
      totalUsers,
      totalAdmins,
      totalBanned,
      totalActive,
      totalAnnonces,
      totalFlaggedAnnonces,
      totalCommandes,
      annoncesParCategorie,
      tauxConversion,
      chiffreAffaireTotal,
      ventesParStatut,
      topVendeurs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques.' });
  }
});

// ─── Change user role ──────────────────────────────────────────────────────
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Utilisez "user" ou "admin".' });
    }

    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas modifier votre propre rôle.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    await user.update({ role });
    res.json({ message: `Rôle mis à jour en "${role}" avec succès.`, user: { id: user.id, nom: user.nom, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du changement de rôle.' });
  }
});

// ─── Ban / Unban user ──────────────────────────────────────────────────────
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from banning themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous bannir vous-même.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const newBanStatus = !user.isBanned;
    await user.update({ isBanned: newBanStatus });

    res.json({
      message: newBanStatus ? `${user.nom} a été banni.` : `${user.nom} a été débanni.`,
      user: { id: user.id, nom: user.nom, isBanned: newBanStatus }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du ban/unban.' });
  }
});

// ─── Delete user ───────────────────────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    await user.destroy();
    res.json({ message: `Utilisateur "${user.nom}" supprimé avec succès.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
});

// ─── Get flagged annonces ──────────────────────────────────────────────────
router.get('/annonces/flagged', async (req, res) => {
  try {
    const annonces = await Annonce.findAll({
      where: { isFlagged: true },
      include: [{ model: User, attributes: ['nom', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(annonces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des annonces signalées.' });
  }
});

// ─── Approve (unflag) annonce ──────────────────────────────────────────────
router.put('/annonces/:id/approve', async (req, res) => {
  try {
    const annonce = await Annonce.findByPk(req.params.id);
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce introuvable.' });
    }
    await annonce.update({ isFlagged: false });
    res.json({ message: 'Annonce approuvée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'approbation.' });
  }
});

// ─── Delete annonce ────────────────────────────────────────────────────────
router.delete('/annonces/:id', async (req, res) => {
  try {
    const annonce = await Annonce.findByPk(req.params.id);
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce introuvable.' });
    }
    await annonce.destroy();
    res.json({ message: 'Annonce supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;
