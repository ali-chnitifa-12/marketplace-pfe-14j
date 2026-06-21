import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ChatbotWidget() {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Marhaban! 🌟 Je suis votre assistant virtuel IA. Posez-moi vos questions sur le fonctionnement du site (achats, ventes, enchères, livraison) et je vous expliquerai tout !"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!user) return null; // Only show if logged in

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chatbot', { message: userMsg.text });
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: res.data.reply };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg = { id: Date.now() + 1, sender: 'bot', text: "Oups, je rencontre des difficultés pour répondre en ce moment. Réessayez bientôt !" };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-widget">
      {/* Floating Button */}
      <button className={`chat-btn ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '❌' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window glass-card">
          <div className="chat-header">
            <div className="chat-avatar">🤖</div>
            <div className="chat-header-info">
              <h4>Assistant IA</h4>
              <p className="status-online"><span className="dot"></span>En ligne</p>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row bot">
                <div className="message-bubble loading">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-area">
            <input
              type="text"
              placeholder="Posez votre question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !inputText.trim()}>
              ➔
            </button>
          </form>
        </div>
      )}

      <style>{`
        .chatbot-widget { position: fixed; bottom: 30px; right: 30px; z-index: 9999; font-family: 'Inter', sans-serif; }
        .chat-btn { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #ea580c); color: white; border: none; font-size: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(249, 115, 22, 0.4); transition: transform 0.3s, box-shadow 0.3s; outline: none; }
        .chat-btn:hover { transform: scale(1.1); box-shadow: 0 8px 32px rgba(249, 115, 22, 0.6); }
        .chat-btn.active { background: #1e293b; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
        
        .chat-window { position: absolute; bottom: 80px; right: 0; width: 360px; height: 500px; display: flex; flex-direction: column; background: var(--card-bg); backdrop-filter: blur(20px); border: 1px solid var(--card-border); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.3); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .chat-header { background: rgba(249, 115, 22, 0.1); border-bottom: 1px solid var(--card-border); padding: 15px 20px; display: flex; align-items: center; gap: 12px; }
        .chat-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #14b8a6); display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .chat-header-info h4 { margin: 0; font-size: 15px; color: var(--text-primary); }
        .status-online { margin: 2px 0 0; font-size: 11px; color: #10b981; display: flex; align-items: center; gap: 4px; font-weight: 600; }
        .status-online .dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block; animation: blink 1.5s infinite; }

        @keyframes blink {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        .message-row { display: flex; width: 100%; }
        .message-row.bot { justify-content: flex-start; }
        .message-row.user { justify-content: flex-end; }
        
        .message-bubble { max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; color: var(--text-primary); }
        .message-row.bot .message-bubble { background: var(--card-bg-hover); border: 1px solid var(--card-border); border-bottom-left-radius: 4px; }
        .message-row.user .message-bubble { background: linear-gradient(135deg, #f97316, #ea580c); color: white; border-bottom-right-radius: 4px; }

        /* Typing loader */
        .message-bubble.loading { display: flex; gap: 4px; padding: 14px 20px; }
        .message-bubble.loading .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-secondary); animation: bounce 1.4s infinite ease-in-out both; }
        .message-bubble.loading .dot:nth-child(1) { animation-delay: -0.32s; }
        .message-bubble.loading .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        .chat-input-area { border-top: 1px solid var(--card-border); padding: 15px; display: flex; gap: 10px; background: rgba(0,0,0,0.1); }
        .chat-input-area input { flex: 1; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-primary); border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .chat-input-area input:focus { border-color: #f97316; }
        .chat-input-area button { width: 40px; height: 40px; border-radius: 10px; background: #f97316; color: white; border: none; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .chat-input-area button:hover { background: #ea580c; }
        .chat-input-area button:disabled { background: var(--card-border); cursor: not-allowed; }
      `}</style>
    </div>
  );
}
