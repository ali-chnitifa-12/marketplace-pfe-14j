const express = require('express');
const { Op } = require('sequelize');
const Enchere = require('../models/Enchere');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const Commande = require('../models/Commande');

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

// Récupérer les enchères de l'utilisateur connecté
router.get('/mes-encheres', authMiddleware, async (req, res) => {
  try {
    const encheres = await Enchere.findAll({
      where: { enchrisseurId: req.user.id },
      include: [{
        model: Annonce,
        attributes: ['id', 'titre', 'prix', 'images', 'statut'],
        include: [{ model: User, attributes: ['id', 'nom', 'telephone'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(encheres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération de vos enchères' });
  }
});

// Modifier le montant d'une enchère (doit être supérieur à l'enchère la plus haute, hors celle-ci)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { montant } = req.body;
    const enchere = await Enchere.findByPk(req.params.id, { include: [Annonce] });
    if (!enchere) return res.status(404).json({ message: 'Enchère introuvable' });
    if (enchere.enchrisseurId !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });
    if (enchere.Annonce.statut !== 'Disponible') return res.status(400).json({ message: 'L\'annonce n\'est plus active' });

    // Trouver le montant maximum actuel en excluant cette ligne
    const highestBid = await Enchere.max('montant', { 
      where: { 
        annonceId: enchere.annonceId,
        id: { [Op.ne]: enchere.id }
      } 
    });
    const currentPrice = highestBid ? highestBid : enchere.Annonce.prix;

    if (montant <= currentPrice) {
      return res.status(400).json({ message: `Le montant doit être supérieur à ${currentPrice} DH` });
    }

    enchere.montant = montant;
    await   enchere.save();
    res.json(enchere);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification de l\'enchère' });
  }
});

// Supprimer/Annuler une enchère
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const enchere = await Enchere.findByPk(req.params.id, { include: [Annonce] });
    if (!enchere) return res.status(404).json({ message: 'Enchère introuvable' });
    if (enchere.enchrisseurId !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });
    if (enchere.Annonce.statut !== 'Disponible') return res.status(400).json({ message: 'L\'annonce n\'est plus active' });

    await enchere.destroy();
    res.json({ message: 'Enchère annulée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'enchère' });
  }
});

// Récupérer les enchères reçues (pour le vendeur)
router.get('/recues', authMiddleware, async (req, res) => {
  try {
    const annonces = await Annonce.findAll({ where: { userId: req.user.id }, attributes: ['id'] });
    const annonceIds = annonces.map(a => a.id);
    const encheres = await Enchere.findAll({
      where: { annonceId: annonceIds },
      include: [
        { model: User, as: 'enchrisseur', attributes: ['id', 'nom', 'telephone', 'email'] },
        { model: Annonce, attributes: ['id', 'titre', 'prix', 'statut'] }
      ]
    });
    res.json(encheres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur' });
  }
});

// Accepter une enchère et créer la commande correspondante
router.post('/:id/accepter', authMiddleware, async (req, res) => {
  try {
    const enchere = await Enchere.findByPk(req.params.id, { include: [Annonce] });
    if (!enchere) return res.status(404).json({ message: 'Enchère introuvable' });
    if (enchere.Annonce.userId !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });
    if (enchere.Annonce.statut !== 'Disponible') return res.status(400).json({ message: 'Annonce non disponible' });

    // Créer la commande
    const commande = await Commande.create({
      annonceId: enchere.annonceId,
      acheteurId: enchere.enchrisseurId,
      adresseLivraison: '',
      telephone: '',
      modeLivraison: 'Domicile',
      prixTotal: enchere.montant,
      statut: 'En attente'
    });

    // Mettre à jour le statut de l'annonce
    await enchere.Annonce.update({ statut: 'Vendu' });

    res.json({ commande, message: 'Enchère acceptée et commande créée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur' });
  }
});

module.exports = router;
