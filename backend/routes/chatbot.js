const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Le message est requis.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Clé API OpenAI non configurée.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful virtual assistant for "Products Marketplace", a premium Moroccan marketplace web application. 
Explain details of this website which was built for a university PFE project by a team of 7 students. 
Here is what the platform supports:
1. Core E-commerce: browse ads, advanced search and filters.
2. Orders & Cash on Delivery: buy directly and track order status (En attente, Expédiée, Livrée, Annulée).
3. Delivery & Points Relais: pick home delivery or select a point relais on an interactive map.
4. Negotiation & WhatsApp: dynamic click-to-chat button to negotiate with sellers.
5. Gamification: rate sellers using stars ⭐ and write reviews.
6. Auctions (Bidding): bid on auction ads with a countdown.
7. Admin Dashboard & AI Moderation: back-office charts, ban/role/delete users, and automatic spam check that flags fraudulent posts.
8. Theme switcher: premium Light and Dark Mode toggle.

Answer in Moroccan Darija (using Moroccan Arabic or Latin Franco) or French, matching the user's language. Keep answers concise, helpful, and friendly.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('OpenAI Error:', data);
      return res.status(500).json({ message: "Erreur de l'API OpenAI." });
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Chatbot route error:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
