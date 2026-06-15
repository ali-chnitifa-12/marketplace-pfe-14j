const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ─── Nodemailer transporter ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ─── Register ──────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { nom, email, motDePasse, typeCompte } = req.body;

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
      typeCompte: typeCompte === 'vendeur' ? 'vendeur' : 'acheteur',
      // role defaults to 'user' via model definition
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: newUser.id, nom: newUser.nom, email: newUser.email, role: newUser.role, typeCompte: newUser.typeCompte }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'inscription." });
  }
});

// ─── Login ─────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ message: 'Votre compte a été suspendu. Contactez l\'administration.' });
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role, typeCompte: user.typeCompte }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

// ─── Me (Get current user) ─────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'nom', 'email', 'role', 'typeCompte', 'isBanned', 'photo', 'createdAt']
    });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil.' });
  }
});

// ─── Forgot Password ───────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Security: don't reveal if email exists
      return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
    }

    // Generate a secure token (valid 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await user.update({ resetToken, resetTokenExpiry });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Try to send email, fallback to console in dev
    try {
      await transporter.sendMail({
        from: `"Marketplace PFE" <${process.env.MAIL_USER}>`,
        to: email,
        subject: '🔐 Réinitialisation de votre mot de passe',
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; background: #050816; color: #e2e8f0; padding: 40px; border-radius: 20px;">
            <h2 style="color: #a78bfa;">Réinitialisation du mot de passe</h2>
            <p>Bonjour <strong>${user.nom}</strong>,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
            <a href="${resetUrl}" style="display:inline-block; margin: 24px 0; padding: 14px 28px; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; text-decoration: none; border-radius: 12px; font-weight: 700;">
              Réinitialiser mon mot de passe
            </a>
            <p style="color: #64748b; font-size: 13px;">Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
            <hr style="border-color: rgba(255,255,255,0.08); margin: 20px 0;">
            <p style="color: #475569; font-size: 12px;">Marketplace PFE — Projet de Fin d'Études</p>
          </div>
        `,
      });
      console.log(`✅ Reset email sent to: ${email}`);
    } catch (mailErr) {
      // Dev fallback: log the link to console
      console.warn('⚠️  Email not sent (check MAIL_USER/MAIL_PASS in .env). Reset link:');
      console.log(`🔗 ${resetUrl}`);
    }

    res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation.' });
  }
});

// ─── Reset Password ────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { motDePasse } = req.body;

    const user = await User.findOne({ where: { resetToken: token } });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré.' });
    }

    if (new Date() > new Date(user.resetTokenExpiry)) {
      await user.update({ resetToken: null, resetTokenExpiry: null });
      return res.status(400).json({ message: 'Ce lien a expiré. Veuillez refaire une demande.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);

    await user.update({
      motDePasse: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation.' });
  }
});

module.exports = router;
