const express = require('express');
const Commande = require('../models/Commande');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Créer une commande
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { annonceId, adresseLivraison, telephone, modeLivraison, pointRelaisId } = req.body;
    
    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });
    
    // On ne peut pas commander sa propre annonce
    if (annonce.userId === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas commander votre propre annonce' });
    }

    if (annonce.statut !== 'Disponible') {
      return res.status(400).json({ message: 'Cette annonce n\'est plus disponible' });
    }

    const commande = await Commande.create({
      annonceId,
      acheteurId: req.user.id,
      adresseLivraison,
      telephone,
      modeLivraison,
      pointRelaisId,
      prixTotal: annonce.prix,
      statut: 'En attente'
    });

    // Mettre à jour le statut de l'annonce
    await annonce.update({ statut: 'Vendu' });

    res.status(201).json(commande);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de la commande' });
  }
});

// Récupérer les commandes de l'utilisateur (achats)
router.get('/mes-achats', authMiddleware, async (req, res) => {
  try {
    const commandes = await Commande.findAll({
      where: { acheteurId: req.user.id },
      include: [{ model: Annonce, include: [{ model: User, attributes: ['nom', 'email', 'telephone'] }] }]
    });
    res.json(commandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur' });
  }
});

// Récupérer les commandes reçues (ventes)
router.get('/mes-ventes', authMiddleware, async (req, res) => {
  try {
    const annonces = await Annonce.findAll({
      where: { userId: req.user.id },
      attributes: ['id']
    });
    const annonceIds = annonces.map(a => a.id);

    const commandes = await Commande.findAll({
      where: { annonceId: annonceIds },
      include: [
        { model: Annonce },
        { model: User, as: 'acheteur', attributes: ['nom', 'email'] }
      ]
    });
    res.json(commandes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur' });
  }
});

// Mettre à jour le statut
router.put('/:id/statut', authMiddleware, async (req, res) => {
  try {
    const { statut } = req.body; // 'En attente', 'Expédiée', 'Livrée', 'Annulée'
    const commande = await Commande.findByPk(req.params.id, {
      include: [{ model: Annonce }]
    });

    if (!commande) return res.status(404).json({ message: 'Introuvable' });

    if (commande.Annonce.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await commande.update({ statut });
    res.json(commande);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur' });
  }
});

module.exports = router;
