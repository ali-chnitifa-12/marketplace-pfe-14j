const express = require('express');
const router = express.Router();
const User = require('../models/User');
const protect = require('../middlewares/authMiddleware');

// Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['motDePasse'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { nom, telephone, photo } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    if (nom) user.nom = nom;
    if (telephone !== undefined) user.telephone = telephone;
    if (photo) user.photo = photo;
    
    await user.save();
    
    res.json({
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      typeCompte: user.typeCompte,
      telephone: user.telephone,
      photo: user.photo
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
});

module.exports = router;
