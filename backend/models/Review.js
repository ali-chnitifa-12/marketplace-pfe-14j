const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  vendeurId: {
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
User.hasMany(Review, { foreignKey: 'reviewerId', as: 'givenReviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'reviewerId', as: 'reviewer' });

User.hasMany(Review, { foreignKey: 'vendeurId', as: 'receivedReviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'vendeurId', as: 'vendeur' });

module.exports = Review;
