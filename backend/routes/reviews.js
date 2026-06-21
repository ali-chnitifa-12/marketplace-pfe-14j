const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all reviews for a specific vendeur
router.get('/vendeur/:id', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { vendeurId: req.params.id },
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'nom', 'photo'] }],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
      : 0;
      
    res.json({ reviews, avgRating: avgRating.toFixed(1), totalCount: reviews.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Post a new review
router.post('/', protect, async (req, res) => {
  try {
    const { vendeurId, rating, comment } = req.body;
    
    if (req.user.id == vendeurId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous évaluer vous-même' });
    }
    
    // Check if review already exists
    const existing = await Review.findOne({
      where: { reviewerId: req.user.id, vendeurId }
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Vous avez déjà évalué ce vendeur' });
    }
    
    const review = await Review.create({
      rating,
      comment,
      reviewerId: req.user.id,
      vendeurId
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'avis', error: error.message });
  }
});

module.exports = router;
