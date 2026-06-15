const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
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

    res.json({ totalUsers, totalAdmins, totalBanned, totalActive });
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

module.exports = router;
