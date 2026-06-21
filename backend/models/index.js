const sequelize = require('../config/database');

const User = require('./User');
const Annonce = require('./Annonce');
const Favori = require('./Favori');
const Review = require('./Review');
const Offre = require('./Offre');
const Commande = require('./Commande');
const Enchere = require('./Enchere');

module.exports = {
  sequelize,
  User,
  Annonce,
  Favori,
  Review,
  Offre,
  Commande,
  Enchere
};
