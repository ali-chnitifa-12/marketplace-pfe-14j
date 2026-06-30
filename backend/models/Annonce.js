const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Annonce = sequelize.define('Annonce', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  prix: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  etat: {
    type: DataTypes.ENUM('Neuf', 'Très bon état', 'Bon état', 'Satisfaisant', 'Pour pièces'),
    allowNull: false,
  },
  categorie: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('Disponible', 'Vendu', 'Annulé'),
    defaultValue: 'Disponible',
    allowNull: false,
  },
  images: {
    // Storing image URLs or paths as a JSON string
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: [],
    get() {
      let value = this.getDataValue('images');
      while (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          break;
        }
      }
      return Array.isArray(value) ? value : [];
    },
    set(val) {
      if (typeof val === 'string') {
        try {
          this.setDataValue('images', JSON.parse(val));
        } catch (e) {
          this.setDataValue('images', val);
        }
      } else {
        this.setDataValue('images', val);
      }
    }
  },
  typeAnnonce: {
    type: DataTypes.ENUM('Fixe', 'Enchere'),
    defaultValue: 'Fixe',
    allowNull: false
  },
  isFlagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
});

// Relationships
User.hasMany(Annonce, { foreignKey: 'userId', onDelete: 'CASCADE' });
Annonce.belongsTo(User, { foreignKey: 'userId' });

module.exports = Annonce;
