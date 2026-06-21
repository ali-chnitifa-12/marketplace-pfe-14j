const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/User');
const Annonce = require('./models/Annonce');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    console.log('🔄 Nettoyage de la base de données...');
    await Annonce.destroy({ where: {} });
    // Optionnel : nettoyer les utilisateurs sauf l'admin
    // await User.destroy({ where: { role: 'user' } }); 

    console.log('👥 Création de faux utilisateurs...');
    const password = await bcrypt.hash('password123', 10);
    
    const usersData = [
      { nom: 'Ahmed Vendeur', email: 'ahmed@market.com', typeCompte: 'vendeur', telephone: '0611223344', photo: 'https://i.pravatar.cc/150?u=ahmed' },
      { nom: 'Sara Vendeuse', email: 'sara@market.com', typeCompte: 'vendeur', telephone: '0655443322', photo: 'https://i.pravatar.cc/150?u=sara' },
      { nom: 'Karim Vendeur', email: 'karim@market.com', typeCompte: 'vendeur', telephone: '0677889900', photo: 'https://i.pravatar.cc/150?u=karim' },
      { nom: 'Yasmine Acheteur', email: 'yasmine@market.com', typeCompte: 'acheteur', telephone: '0600112233', photo: 'https://i.pravatar.cc/150?u=yasmine' }
    ];

    const createdUsers = [];
    for (let u of usersData) {
      let user = await User.findOne({ where: { email: u.email } });
      if (!user) {
        user = await User.create({ ...u, motDePasse: password, role: 'user' });
      }
      if (u.typeCompte === 'vendeur') {
        createdUsers.push(user);
      }
    }

    console.log('📦 Création de fausses annonces...');
    const categories = ['Électronique', 'Vêtements', 'Maison', 'Véhicules', 'Services'];
    const etats = ['Neuf', 'Très bon état', 'Bon état', 'Satisfaisant', 'Pour pièces'];
    
    const annoncesData = [
      { titre: 'MacBook Pro M2', prix: 15000, cat: 'Électronique', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' },
      { titre: 'iPhone 14 Pro', prix: 9000, cat: 'Électronique', img: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c' },
      { titre: 'Canapé en cuir', prix: 2500, cat: 'Maison', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc' },
      { titre: 'Renault Clio 4', prix: 85000, cat: 'Véhicules', img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2' },
      { titre: 'Veste Zara Homme', prix: 300, cat: 'Vêtements', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea' },
      { titre: 'PlayStation 5', prix: 5500, cat: 'Électronique', img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db' },
      { titre: 'Table en bois massif', prix: 1200, cat: 'Maison', img: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7' },
      { titre: 'Montre Casio Vintage', prix: 400, cat: 'Vêtements', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' },
      { titre: 'Service de réparation PC', prix: 150, cat: 'Services', img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b' },
      { titre: 'Vélo de montagne BTWIN', prix: 1200, cat: 'Véhicules', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e' },
      { titre: 'AirPods Pro', prix: 1800, cat: 'Électronique', img: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434' },
      { titre: 'Appareil Photo Canon', prix: 4500, cat: 'Électronique', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32' },
      { titre: 'Guitare Acoustique', prix: 800, cat: 'Maison', img: 'https://images.unsplash.com/photo-1550985543-f47f38aee18e' },
      { titre: 'Tapis Marocain', prix: 1500, cat: 'Maison', img: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88' },
      { titre: 'Cours de Mathématiques', prix: 100, cat: 'Services', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b' },
      { titre: 'Casque Audio Sony', prix: 2000, cat: 'Électronique', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb' },
      { titre: 'Chaussures Nike Air', prix: 600, cat: 'Vêtements', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
      { titre: 'Peugeot 208', prix: 95000, cat: 'Véhicules', img: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24' },
      { titre: 'Livre de Programmation', prix: 150, cat: 'Maison', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765' },
      { titre: 'Machine à café', prix: 500, cat: 'Maison', img: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6' },
      { titre: 'Dacia Logan', prix: 65000, cat: 'Véhicules', img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888' }
    ];

    for (let i = 0; i < annoncesData.length; i++) {
      const ad = annoncesData[i];
      const vendeur = createdUsers[i % createdUsers.length];
      
      // Coordonnées approximatives au Maroc (entre Tanger et Agadir)
      const lat = 31 + Math.random() * 4; // 31 to 35
      const lng = -9 + Math.random() * 4; // -9 to -5

      await Annonce.create({
        titre: ad.titre,
        description: `Voici une excellente occasion pour acheter ce produit : ${ad.titre}. Il est en parfait état de fonctionnement. N'hésitez pas à me contacter pour plus de détails.`,
        prix: ad.prix,
        etat: etats[Math.floor(Math.random() * etats.length)],
        categorie: ad.cat,
        images: [ad.img + '?w=800&q=80'],
        latitude: lat,
        longitude: lng,
        userId: vendeur.id
      });
    }

    console.log(`✅ Base de données remplie avec succès ! (${annoncesData.length} annonces créées)`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors du seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
