const express = require('express');
const router = express.Router();
const Offre = require('../models/Offre');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const protect = require('../middlewares/authMiddleware');

// Get all offers for a specific user's ads (Seller dashboard)
router.get('/recues', protect, async (req, res) => {
  try {
    const annonces = await Annonce.findAll({ where: { userId: req.user.id } });
    const annonceIds = annonces.map(a => a.id);
    
    const offres = await Offre.findAll({
      where: { annonceId: annonceIds },
      include: [
        { model: User, as: 'acheteur', attributes: ['id', 'nom', 'email', 'telephone'] },
        { model: Annonce, as: 'annonce', attributes: ['id', 'titre', 'prix', 'images'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(offres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des offres', error: error.message });
  }
});

// Get all offers made by the current user (Buyer dashboard)
router.get('/emises', protect, async (req, res) => {
  try {
    const offres = await Offre.findAll({
      where: { acheteurId: req.user.id },
      include: [
        { 
          model: Annonce, 
          as: 'annonce', 
          attributes: ['id', 'titre', 'prix', 'images', 'userId'],
          include: [
            { model: User, attributes: ['id', 'nom', 'email', 'telephone'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(offres);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
});

// Make an offer on an ad
router.post('/', protect, async (req, res) => {
  try {
    const { annonceId, prixPropose } = req.body;
    
    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });
    if (annonce.userId === req.user.id) return res.status(400).json({ message: 'Vous ne pouvez pas faire d\'offre sur votre propre annonce' });
    
    // Check if offer exists and is pending
    const existing = await Offre.findOne({
      where: { acheteurId: req.user.id, annonceId, statut: 'En attente' }
    });
    if (existing) return res.status(400).json({ message: 'Vous avez déjà une offre en attente sur cette annonce' });
    
    const offre = await Offre.create({
      prixPropose,
      annonceId,
      acheteurId: req.user.id
    });
    
    res.status(201).json(offre);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
});

// Accept or Reject an offer
router.put('/:id/statut', protect, async (req, res) => {
  try {
    const { statut } = req.body; // 'Acceptée' or 'Refusée'
    
    const offre = await Offre.findByPk(req.params.id, {
      include: [{ model: Annonce, as: 'annonce' }]
    });
    
    if (!offre) return res.status(404).json({ message: 'Offre introuvable' });
    
    // Ensure the current user is the owner of the ad
    if (offre.annonce.userId !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    offre.statut = statut;
    await offre.save();
    
    res.json(offre);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
});

// Modifier le prix d'une offre émise (seulement si En attente)
router.put('/:id', protect, async (req, res) => {
  try {
    const { prixPropose } = req.body;
    const offre = await Offre.findByPk(req.params.id);
    if (!offre) return res.status(404).json({ message: 'Offre introuvable' });
    if (offre.acheteurId !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });
    if (offre.statut !== 'En attente') return res.status(400).json({ message: 'Impossible de modifier une offre déjà traitée' });
    
    offre.prixPropose = prixPropose;
    await offre.save();
    res.json(offre);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
});

// Annuler/Supprimer une offre émise (seulement si En attente)
router.delete('/:id', protect, async (req, res) => {
  try {
    const offre = await Offre.findByPk(req.params.id);
    if (!offre) return res.status(404).json({ message: 'Offre introuvable' });
    if (offre.acheteurId !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });
    if (offre.statut !== 'En attente') return res.status(400).json({ message: 'Impossible de supprimer une offre déjà traitée' });
    
    await offre.destroy();
    res.json({ message: 'Offre annulée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error: error.message });
  }
});

module.exports = router;
