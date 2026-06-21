const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Annonce = require('./Annonce');

const Favori = sequelize.define('Favori', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
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
User.hasMany(Favori, { foreignKey: 'userId', onDelete: 'CASCADE' });
Favori.belongsTo(User, { foreignKey: 'userId' });

Annonce.hasMany(Favori, { foreignKey: 'annonceId', onDelete: 'CASCADE' });
Favori.belongsTo(Annonce, { foreignKey: 'annonceId' });

module.exports = Favori;
