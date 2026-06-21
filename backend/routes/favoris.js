const express = require('express');
const router = express.Router();
const Favori = require('../models/Favori');
const Annonce = require('../models/Annonce');
const { protect } = require('../middleware/authMiddleware');

// Get all favoris for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const favoris = await Favori.findAll({
      where: { userId: req.user.id },
      include: [
        { model: Annonce }
      ]
    });
    res.json(favoris);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des favoris', error: error.message });
  }
});

// Add a favori
router.post('/', protect, async (req, res) => {
  try {
    const { annonceId } = req.body;
    
    // Check if it already exists
    const existing = await Favori.findOne({
      where: { userId: req.user.id, annonceId }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Cette annonce est déjà dans vos favoris' });
    }
    
    const favori = await Favori.create({
      userId: req.user.id,
      annonceId
    });
    
    res.status(201).json(favori);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout aux favoris', error: error.message });
  }
});

// Remove a favori
router.delete('/:annonceId', protect, async (req, res) => {
  try {
    const deleted = await Favori.destroy({
      where: { userId: req.user.id, annonceId: req.params.annonceId }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Favori non trouvé' });
    }
    
    res.json({ message: 'Favori supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
});

module.exports = router;
