const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Annonce = require('./Annonce');

const Offre = sequelize.define('Offre', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  prixPropose: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('En attente', 'Acceptée', 'Refusée'),
    defaultValue: 'En attente',
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
User.hasMany(Offre, { foreignKey: 'acheteurId', onDelete: 'CASCADE' });
Offre.belongsTo(User, { foreignKey: 'acheteurId', as: 'acheteur' });

Annonce.hasMany(Offre, { foreignKey: 'annonceId', onDelete: 'CASCADE' });
Offre.belongsTo(Annonce, { foreignKey: 'annonceId', as: 'annonce' });

module.exports = Offre;
