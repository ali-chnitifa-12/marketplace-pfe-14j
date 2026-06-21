const express = require('express');
const { Op } = require('sequelize');
const Annonce = require('../models/Annonce');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ─── GET: Obtenir toutes les annonces (avec filtres et recherche) ──────────
router.get('/', async (req, res) => {
  try {
    const { search, categorie, minPrix, maxPrix, etat } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { titre: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (categorie) {
      whereClause.categorie = categorie;
    }
    
    if (etat) {
      whereClause.etat = etat;
    }
    
    if (minPrix || maxPrix) {
      whereClause.prix = {};
      if (minPrix) whereClause.prix[Op.gte] = parseFloat(minPrix);
      if (maxPrix) whereClause.prix[Op.lte] = parseFloat(maxPrix);
    }

    const annonces = await Annonce.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'nom', 'photo']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(annonces);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des annonces.' });
  }
});

// ─── GET: Obtenir une seule annonce par ID ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const annonce = await Annonce.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'nom', 'photo', 'email', 'telephone']
      }]
    });
    
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce introuvable.' });
    }
    
    res.json(annonce);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'annonce.' });
  }
});

const upload = require('../middlewares/upload');

// ─── POST: Créer une annonce (Protégé) ─────────────────────────────────────
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // Vérifier si l'utilisateur est bien un vendeur (optionnel si un admin peut aussi vendre)
    if (req.user.role !== 'admin') {
      const user = await User.findByPk(req.user.id);
      if (user.typeCompte !== 'vendeur') {
        return res.status(403).json({ message: 'Seuls les comptes "Vendeur" peuvent publier des annonces.' });
      }
    }

    const { titre, description, prix, etat, categorie, latitude, longitude, typeAnnonce } = req.body;
    let images = [];

    // Si on reçoit un fichier uploadé
    if (req.file) {
      images.push(`http://localhost:5000/uploads/${req.file.filename}`);
    } 
    // Sinon si l'utilisateur passe une URL (rétrocompatibilité pour le seeding)
    else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // "AI" Moderation simulation
    const forbiddenWords = ['arnaque', 'insulte', 'faux', 'escroc'];
    const textToCheck = (titre + ' ' + description).toLowerCase();
    const isFlagged = forbiddenWords.some(word => textToCheck.includes(word));

    const nouvelleAnnonce = await Annonce.create({
      titre,
      description,
      prix: parseFloat(prix),
      etat,
      categorie,
      typeAnnonce: typeAnnonce || 'Fixe',
      isFlagged,
      images,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      userId: req.user.id
    });

    res.status(201).json(nouvelleAnnonce);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création de l\'annonce.' });
  }
});

// ─── PUT: Modifier une annonce (Protégé) ───────────────────────────────────
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const annonce = await Annonce.findByPk(req.params.id);
    
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce introuvable.' });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (annonce.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette annonce.' });
    }

    const { titre, description, prix, etat, categorie, images, statut } = req.body;
    
    await annonce.update({
      titre: titre || annonce.titre,
      description: description || annonce.description,
      prix: prix || annonce.prix,
      etat: etat || annonce.etat,
      categorie: categorie || annonce.categorie,
      images: images || annonce.images,
      statut: statut || annonce.statut
    });

    res.json(annonce);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification de l\'annonce.' });
  }
});

// ─── DELETE: Supprimer une annonce (Protégé) ───────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const annonce = await Annonce.findByPk(req.params.id);
    
    if (!annonce) {
      return res.status(404).json({ message: 'Annonce introuvable.' });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (annonce.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette annonce.' });
    }

    await annonce.destroy();
    res.json({ message: 'Annonce supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'annonce.' });
  }
});

module.exports = router;
