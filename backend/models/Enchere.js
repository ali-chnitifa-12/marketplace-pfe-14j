const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Annonce = require('./Annonce');

const Enchere = sequelize.define('Enchere', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  montant: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  enchrisseurId: {
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
User.hasMany(Enchere, { foreignKey: 'enchrisseurId', onDelete: 'CASCADE' });
Enchere.belongsTo(User, { foreignKey: 'enchrisseurId', as: 'enchrisseur' });

Annonce.hasMany(Enchere, { foreignKey: 'annonceId', onDelete: 'CASCADE' });
Enchere.belongsTo(Annonce, { foreignKey: 'annonceId' });

module.exports = Enchere;
