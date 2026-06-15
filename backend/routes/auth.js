const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);

    const newUser = await User.create({
      nom,
      email,
      motDePasse: hashedPassword,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });

    res.status(201).json({ token, user: { id: newUser.id, nom: newUser.nom, email: newUser.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });

    res.json({ token, user: { id: user.id, nom: user.nom, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

// Me (Get current user)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'nom', 'email', 'photo', 'createdAt'] });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
  }
});

module.exports = router;
