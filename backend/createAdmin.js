const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    
    // Check if an admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@market.com' } });
    if (existingAdmin) {
      console.log('Admin account already exists: admin@market.com / admin123');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      nom: 'Super Admin',
      email: 'admin@market.com',
      motDePasse: hashedPassword,
      typeCompte: 'acheteur', // Type compte doesn't matter much for admin
      role: 'admin'
    });

    console.log('Admin account created successfully!');
    console.log('Email: admin@market.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
