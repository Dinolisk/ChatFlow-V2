import React, { useEffect, useState, useCallback, useRef } from 'react';
import DOMPurify from 'dompurify';
import { supabase } from '../supabaseClient';
import './Chat.css';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

function mapMessageRow(row, currentUserId) {
  return {
    id: row.id,
    text: row.text,
    username: row.user_id === currentUserId ? 'Du' : row.username || 'Användare',
    avatar: row.avatar || 'https://i.pravatar.cc/100',
    user_id: row.user_id,
  };
}

async function getAIReply(userMessage) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'Du är en vänlig chattbot som heter Patrik. Svara kort och avslappnat på svenska, max 2 meningar.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error('AI API error:', err);
    throw new Error(err?.error?.message ?? 'API-fel');
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? 'Hmm, jag vet inte riktigt vad jag ska svara på det 😅';
}

const welcomeMessage = {
  id: 'welcome',
  text: 'Hej! 👋 Jag heter Patrik och är din AI-assistent. Du kan chatta med mig, ställa frågor eller bara slå en signal. Vad kan jag hjälpa dig med idag?',
  username: 'Patrik',
  avatar: 'https://i.pravatar.cc/100?img=14',
  user_id: null,
};

const Chat = () => {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [viewerId, setViewerId] = useState(null);
  const [patrikTyping, setPatrikTyping] = useState(false);
  const bottomRef = useRef(null);

  const refreshLocalProfile = useCallback(() => {
    setUsername(localStorage.getItem('username') || 'användare');
    setAvatar(localStorage.getItem('avatar') || 'https://i.pravatar.cc/100');
  }, []);

  useEffect(() => { refreshLocalProfile(); }, [refreshLocalProfile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let channel;
    let cancelled = false;

    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;

      const uid = user?.id ?? null;
      setViewerId(uid);

      const { data: rows, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (cancelled) return;
      if (error) { console.error('Failed to fetch messages:', error); return; }

      const fetched = (rows ?? []).map((row) => mapMessageRow(row, uid));
      setMessages(fetched.length > 0 ? fetched : [welcomeMessage]);

      channel = supabase
        .channel(`public:messages:${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const row = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, mapMessageRow(row, uid)];
          });
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
          const id = payload.old?.id;
          if (id) setMessages((prev) => prev.filter((m) => m.id !== id));
        })
        .subscribe();
    };

    run();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const sanitized = DOMPurify.sanitize(newMessage);
    if (!sanitized.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('Du måste vara inloggad.'); return; }

    const displayName = user.user_metadata?.username || user.email?.split('@')[0] || 'Du';
    const avatarUrl = user.user_metadata?.avatar_url || localStorage.getItem('avatar') || 'https://i.pravatar.cc/100';

    const { data: inserted, error } = await supabase
      .from('messages')
      .insert({ text: sanitized, user_id: user.id, username: displayName, avatar: avatarUrl })
      .select()
      .single();

    if (error) { console.error('Failed to send message:', error); return; }

    setMessages((prev) => prev.some((m) => m.id === inserted.id) ? prev : [...prev, mapMessageRow(inserted, user.id)]);
    setNewMessage('');

    setPatrikTyping(true);
    try {
      const replyText = await getAIReply(sanitized);
      const fakeReply = {
        id: `fake-${Date.now()}`,
        text: replyText,
        username: 'Patrik',
        avatar: 'https://i.pravatar.cc/100?img=14',
        user_id: null,
      };
      setMessages((prev) => [...prev, fakeReply]);
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setPatrikTyping(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (String(messageId).startsWith('fake-')) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      return;
    }
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) { console.error('Error deleting message:', error); return; }
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  return (
    <div className="chat-page">
      <div className="chat-topbar">
        {avatar && <img src={avatar} alt="Avatar" />}
        <h2>Hej, {username}!</h2>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <p className="empty-state">Inga meddelanden än — säg hej! 👋</p>
        )}
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
              <img src={message.avatar || 'https://i.pravatar.cc/100'} alt="Avatar" />
              <div className="bubble">
                <strong>{message.username || 'Du'}</strong>
                {message.text}
              </div>
            </div>
          );
        })}
        {patrikTyping && (
          <div className="message patrik-message">
            <img src="https://i.pravatar.cc/100?img=14" alt="Patrik" />
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
