const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Annonce = require('./Annonce');

const Commande = sequelize.define('Commande', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  adresseLivraison: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  modeLivraison: {
    type: DataTypes.ENUM('Domicile', 'Point Relais'),
    defaultValue: 'Domicile',
    allowNull: false,
  },
  pointRelaisId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  modePaiement: {
    type: DataTypes.STRING,
    defaultValue: 'Cash on Delivery',
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('En attente', 'Expédiée', 'Livrée', 'Annulée'),
    defaultValue: 'En attente',
    allowNull: false,
  },
  prixTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  acheteurId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  annonceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Annonce,
      key: 'id'
    }
  }
}, {
  timestamps: true,
});

// Relationships
User.hasMany(Commande, { foreignKey: 'acheteurId', as: 'commandes', onDelete: 'CASCADE' });
Commande.belongsTo(User, { foreignKey: 'acheteurId', as: 'acheteur' });

Annonce.hasMany(Commande, { foreignKey: 'annonceId', onDelete: 'CASCADE' });
Commande.belongsTo(Annonce, { foreignKey: 'annonceId' });

module.exports = Commande;
