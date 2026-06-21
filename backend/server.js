const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
require('./models');

const app = express();

app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/annonces', require('./routes/annonces'));
app.use('/api/users', require('./routes/users'));
app.use('/api/favoris', require('./routes/favoris'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/offres', require('./routes/offres'));

// Test route
app.get('/', (req, res) => {
  res.send('Marketplace PFE API is running...');
});

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize.sync({ alter: true }) // use alter in dev to update schema
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });
