import React, { useEffect, useState, useRef } from 'react';
import DOMPurify from 'dompurify';
import { supabase } from '../supabaseClient';
import './Chat.css';

// Deterministic avatar based on user ID — same every time
function userAvatar(userId) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${userId}&backgroundColor=6366f1`;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function getAIReply(userMessage, history) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage, history }),
  });

  if (response.status === 429) throw new Error('rate_limit');
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error ?? 'API-fel');
  }

  const data = await response.json();
  if (!data.reply) throw new Error('empty_response');
  return data.reply;
}

const PATRIK_AVATAR = 'https://api.dicebear.com/9.x/thumbs/svg?seed=Patrik&backgroundColor=8b5cf6';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [viewerId, setViewerId] = useState(null);
  const [patrikTyping, setPatrikTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setViewerId(user.id);

      const displayName = user.user_metadata?.username || user.email?.split('@')[0] || 'användare';
      const av = userAvatar(user.id);
      setUsername(displayName);
      setAvatar(av);
      localStorage.setItem('username', displayName);
      localStorage.setItem('avatar', av);

      setMessages([{
        id: 'welcome',
        text: `Hej, ${displayName}! 👋 Jag heter Patrik och är din AI-assistent. Du kan chatta med mig, ställa frågor eller bara slå en signal. Vad kan jag hjälpa dig med idag?`,
        username: 'Patrik',
        avatar: PATRIK_AVATAR,
        user_id: null,
      }]);
    };
    run();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const sanitized = DOMPurify.sanitize(newMessage);
    if (!sanitized.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Du måste vara inloggad.'); return; }

    const av = userAvatar(user.id);
    const displayName = user.user_metadata?.username || user.email?.split('@')[0] || 'Du';

    const userMsg = {
      id: `user-${Date.now()}`,
      text: sanitized,
      username: 'Du',
      avatar: av,
      user_id: user.id,
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage('');

    const MAX_HISTORY = 3;
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.username === 'Patrik' ? 'assistant' : 'user',
        content: m.text,
      }))
      .slice(-MAX_HISTORY);

    setPatrikTyping(true);
    try {
      const replyText = await getAIReply(sanitized, history);
      setMessages((prev) => [...prev, {
        id: `patrik-${Date.now()}`,
        text: replyText,
        username: 'Patrik',
        avatar: PATRIK_AVATAR,
        user_id: null,
      }]);
    } catch (err) {
      const isRateLimit = err.message === 'rate_limit';
      setMessages((prev) => [...prev, {
        id: `patrik-${Date.now()}`,
        text: isRateLimit
          ? 'Uff, jag får för många frågor just nu! Vänta någon sekund och försök igen. 😅'
          : 'Något gick fel, försök igen lite senare.',
        username: 'Patrik',
        avatar: PATRIK_AVATAR,
        user_id: null,
      }]);
    } finally {
      setPatrikTyping(false);
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  return (
    <div className="chat-page">


      <div className="messages-container">
        {messages.map((message, index) => {
          const isOwn = message.user_id === viewerId;
          const isPatrik = message.username === 'Patrik';
          return (
            <div
              key={message.id || `temp-${index}`}
              className={`message ${isPatrik ? 'patrik-message' : 'user-message'}`}
            >
              {isOwn && !isPatrik && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  Radera
                </button>
              )}
              <img src={message.avatar} alt="Avatar" />
              <div className="bubble">
                <strong>{message.username}</strong>
                {message.text}
              </div>
            </div>
          );
        })}
        {patrikTyping && (
          <div className="message patrik-message">
            <img src={PATRIK_AVATAR} alt="Patrik" />
            <div className="bubble typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-form" onSubmit={handleSendMessage}>
        <input
          className="chat-input"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Skriv ett meddelande…"
          autoComplete="off"
        />
        <button type="submit" className="send-btn" aria-label="Skicka">
          ➤
        </button>
      </form>
    </div>
  );
};

export default Chat;
