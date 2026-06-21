const express = require('express');
const Enchere = require('../models/Enchere');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Faire une enchère
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { annonceId, montant } = req.body;
    
    const annonce = await Annonce.findByPk(annonceId);
    if (!annonce) return res.status(404).json({ message: 'Annonce introuvable' });
    
    if (annonce.typeAnnonce !== 'Enchere') {
      return res.status(400).json({ message: 'Cette annonce n\'accepte pas les enchères' });
    }

    if (annonce.userId === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas enchérir sur votre propre annonce' });
    }

    if (annonce.statut !== 'Disponible') {
      return res.status(400).json({ message: 'Cette annonce n\'est plus disponible' });
    }

    // Récupérer la plus haute enchère
    const highestBid = await Enchere.max('montant', { where: { annonceId } });
    const currentPrice = highestBid ? highestBid : annonce.prix;

    if (montant <= currentPrice) {
      return res.status(400).json({ message: `Le montant doit être supérieur à ${currentPrice} DH` });
    }

    const enchere = await Enchere.create({
      annonceId,
      enchrisseurId: req.user.id,
      montant
    });

    res.status(201).json(enchere);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de l\'enchère' });
  }
});

// Récupérer les enchères d'une annonce
router.get('/annonce/:id', async (req, res) => {
  try {
    const encheres = await Enchere.findAll({
      where: { annonceId: req.params.id },
      include: [{ model: User, as: 'enchrisseur', attributes: ['nom', 'photo'] }],
      order: [['montant', 'DESC']]
    });
    res.json(encheres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur' });
  }
});

module.exports = router;
