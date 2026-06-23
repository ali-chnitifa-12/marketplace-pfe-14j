import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ChatbotWidget() {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 1, sender: 'bot',
    text: "Marhaban! 🌟 Je suis votre assistant IA. Posez-moi vos questions sur les achats, ventes, enchères ou la livraison !"
  }]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef  = useRef(null);
  const inputRef    = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen]);

  if (!user) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chatbot', { message: userMsg.text });
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Oups, je rencontre des difficultés. Réessayez bientôt !" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="chatbot-widget">
      {/* Floating Button */}
      <button className={`chat-fab ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)} aria-label="Toggle chat">
        <span className="fab-icon">{isOpen ? '✕' : '💬'}</span>
        {!isOpen && <span className="fab-pulse" />}
        {!isOpen && <span className="fab-pulse delay" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="bot-avatar">
              <span>🤖</span>
              <span className="online-dot" />
            </div>
            <div className="bot-info">
              <h4>Assistant IA</h4>
              <p>En ligne • répond instantanément</p>
            </div>
            <button className="header-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={msg.id} className={`msg-row ${msg.sender}`} style={{ animationDelay: `${i * 0.04}s` }}>
                {msg.sender === 'bot' && <div className="msg-bot-avatar">🤖</div>}
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="msg-row bot">
                <div className="msg-bot-avatar">🤖</div>
                <div className="msg-bubble typing">
                  <span className="wave-dot" style={{ animationDelay: '0s' }} />
                  <span className="wave-dot" style={{ animationDelay: '0.15s' }} />
                  <span className="wave-dot" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              placeholder="Posez votre question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !inputText.trim()} className="send-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </form>
        </div>
      )}

      <style>{`
        .chatbot-widget { position:fixed; bottom:28px; right:28px; z-index:9999; font-family:'Inter',sans-serif; }

        /* FAB */
        .chat-fab {
          position:relative; width:58px; height:58px; border-radius:50%;
          background:linear-gradient(135deg,#f97316,#ea580c);
          color:white; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 30px rgba(249,115,22,0.45);
          transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
          z-index:1;
        }
        .chat-fab:hover { transform:scale(1.1); box-shadow:0 12px 40px rgba(249,115,22,0.6); }
        .chat-fab.open { background:linear-gradient(135deg,#475569,#334155); box-shadow:0 8px 30px rgba(0,0,0,0.3); }
        .fab-icon { font-size:22px; transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .chat-fab:hover .fab-icon { transform:scale(1.15); }

        /* Breathing pulse rings */
        .fab-pulse {
          position:absolute; inset:-6px; border-radius:50%;
          border:2px solid rgba(249,115,22,0.4);
          animation:fabPulse 2.5s ease-out infinite;
          pointer-events:none;
        }
        .fab-pulse.delay { animation-delay:1.2s; }
        @keyframes fabPulse {
          0% { transform:scale(1); opacity:0.7; }
          100% { transform:scale(1.8); opacity:0; }
        }

        /* Chat Window */
        .chat-window {
          position:absolute; bottom:72px; right:0;
          width:360px; height:500px;
          display:flex; flex-direction:column;
          background:rgba(5,8,22,0.97);
          backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:22px; overflow:hidden;
          box-shadow:0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.1);
          animation:chatSpring 0.45s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        .light-mode .chat-window { background:rgba(248,250,252,0.97); border-color:rgba(0,0,0,0.1); }
        @keyframes chatSpring {
          from { opacity:0; transform:translateY(20px) scale(0.92); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        /* Header */
        .chat-header {
          display:flex; align-items:center; gap:12px; padding:16px 18px;
          background:linear-gradient(135deg,rgba(249,115,22,0.08),rgba(20,184,166,0.06));
          border-bottom:1px solid rgba(255,255,255,0.06);
          flex-shrink:0;
        }
        .bot-avatar { position:relative; width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#f97316,#14b8a6); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .online-dot { position:absolute; bottom:0; right:0; width:10px; height:10px; border-radius:50%; background:#10b981; border:2px solid rgba(5,8,22,1); animation:blink 2s ease-in-out infinite; }
        .light-mode .online-dot { border-color:white; }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .bot-info { flex:1; }
        .bot-info h4 { margin:0; font-size:14px; font-weight:700; color:var(--text-primary); }
        .bot-info p { margin:2px 0 0; font-size:11px; color:#10b981; }
        .header-close { background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:14px; padding:4px; border-radius:6px; transition:all 0.2s; }
        .header-close:hover { background:rgba(239,68,68,0.15); color:#f87171; }

        /* Messages */
        .chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
        .chat-messages::-webkit-scrollbar { width:4px; }
        .chat-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }

        .msg-row { display:flex; align-items:flex-end; gap:8px; animation:msgIn 0.3s cubic-bezier(0.34,1.3,0.64,1) both; }
        @keyframes msgIn {
          from { opacity:0; transform:translateY(10px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .msg-row.bot { justify-content:flex-start; }
        .msg-row.user { justify-content:flex-end; }
        .msg-bot-avatar { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#f97316,#14b8a6); display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
        .msg-bubble { max-width:76%; padding:11px 14px; border-radius:16px; font-size:13.5px; line-height:1.55; color:var(--text-primary); }
        .msg-row.bot .msg-bubble { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07); border-bottom-left-radius:4px; }
        .msg-row.user .msg-bubble { background:linear-gradient(135deg,#f97316,#ea580c); color:white; border-bottom-right-radius:4px; box-shadow:0 4px 15px rgba(249,115,22,0.25); }
        .light-mode .msg-row.bot .msg-bubble { background:rgba(0,0,0,0.05); border-color:rgba(0,0,0,0.08); }

        /* Wave typing */
        .msg-bubble.typing { display:flex; gap:5px; padding:14px 18px; align-items:center; }
        .wave-dot { width:7px; height:7px; border-radius:50%; background:var(--text-secondary); display:inline-block; animation:wave 1.4s ease-in-out infinite; }

        /* Input */
        .chat-input-area { border-top:1px solid rgba(255,255,255,0.06); padding:12px 14px; display:flex; gap:8px; background:rgba(0,0,0,0.15); flex-shrink:0; }
        .light-mode .chat-input-area { background:rgba(0,0,0,0.04); border-top-color:rgba(0,0,0,0.08); }
        .chat-input-area input { flex:1; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:var(--text-primary); border-radius:12px; padding:10px 14px; font-size:13.5px; outline:none; font-family:'Inter',sans-serif; transition:all 0.3s; }
        .chat-input-area input:focus { border-color:rgba(249,115,22,0.4); box-shadow:0 0 0 3px rgba(249,115,22,0.08); background:rgba(255,255,255,0.07); }
        .light-mode .chat-input-area input { background:white; border-color:rgba(0,0,0,0.12); }
        .send-btn { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg,#f97316,#ea580c); color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow:0 4px 12px rgba(249,115,22,0.3); }
        .send-btn:hover:not(:disabled) { transform:scale(1.1); box-shadow:0 6px 20px rgba(249,115,22,0.45); }
        .send-btn:disabled { background:rgba(255,255,255,0.08); box-shadow:none; cursor:not-allowed; }
        .send-btn:disabled svg { opacity:0.3; }
      `}</style>
    </div>
  );
}
