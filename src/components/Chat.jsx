import React, { useEffect, useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { supabase } from '../supabaseClient';
import './Chat.css';

function mapMessageRow(row, currentUserId) {
  return {
    id: row.id,
    text: row.text,
    username: row.user_id === currentUserId ? 'Du' : row.username || 'Användare',
    avatar: row.avatar || 'https://i.pravatar.cc/100',
    user_id: row.user_id,
  };
}

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [viewerId, setViewerId] = useState(null);

  const fakeChatReplies = [
    'Tja tja, hur mår du?',
    'Hallå!! Svara då!!',
    'Sover du eller?! 😴',
    'Hur var din dag?',
    'Ska vi ses snart?',
    'Jag funderar på vad vi kan hitta på i helgen!',
    'Såg du den nya filmen på bio?',
    'Vad tänker du på?',
    'Hur går det med jobbet?',
    'Har du några roliga planer till helgen?',
  ];

  const getRandomReply = () => fakeChatReplies[Math.floor(Math.random() * fakeChatReplies.length)];

  const refreshLocalProfile = useCallback(() => {
    const savedUsername = localStorage.getItem('username');
    const savedAvatar = localStorage.getItem('avatar');
    setUsername(savedUsername || 'användare');
    setAvatar(savedAvatar || 'https://i.pravatar.cc/100');
  }, []);

  useEffect(() => {
    refreshLocalProfile();
  }, [refreshLocalProfile]);

  useEffect(() => {
    let channel;

    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setViewerId(uid);

      const { data: rows, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch messages:', error);
        return;
      }

      setMessages((rows ?? []).map((row) => mapMessageRow(row, uid)));

      channel = supabase
        .channel('public:messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const row = payload.new;
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, mapMessageRow(row, uid)];
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'messages' },
          (payload) => {
            const id = payload.old?.id;
            if (!id) return;
            setMessages((prev) => prev.filter((m) => m.id !== id));
          }
        )
        .subscribe();
    };

    run();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const sanitizedMessage = DOMPurify.sanitize(newMessage);

    if (!sanitizedMessage.trim()) {
      alert('Message cannot be empty.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert('Du måste vara inloggad.');
      return;
    }

    const displayName =
      user.user_metadata?.username || user.email?.split('@')[0] || 'Du';
    const avatarUrl = user.user_metadata?.avatar_url || localStorage.getItem('avatar') || 'https://i.pravatar.cc/100';

    const { data: inserted, error } = await supabase
      .from('messages')
      .insert({
        text: sanitizedMessage,
        user_id: user.id,
        username: displayName,
        avatar: avatarUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to send message:', error);
      return;
    }

    setMessages((prev) => {
      if (prev.some((m) => m.id === inserted.id)) return prev;
      return [...prev, mapMessageRow(inserted, user.id)];
    });
    setNewMessage('');

    setTimeout(() => {
      const randomReply = getRandomReply();
      const fakeReply = {
        id: `fake-${Date.now()}`,
        text: randomReply,
        username: 'Patrik',
        avatar: 'https://i.pravatar.cc/100?img=14',
        user_id: null,
      };
      setMessages((prevMessages) => [...prevMessages, fakeReply]);
    }, 1000);
  };

  const handleDeleteMessage = async (messageId) => {
    if (String(messageId).startsWith('fake-')) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      return;
    }

    const { error } = await supabase.from('messages').delete().eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      return;
    }

    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  return (
    <div className="chat-page">
      <h2>Hej {username || 'användare'}!</h2>
      {avatar && <img src={avatar} alt="User Avatar" />}
      <div className="messages-container">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={message.id || `temp-${index}`}
              className={`message ${message.username === 'Patrik' ? 'patrik-message' : 'user-message'}`}
            >
              {message.user_id && message.user_id === viewerId && message.username !== 'Patrik' && (
                <button type="button" onClick={() => handleDeleteMessage(message.id)}>
                  Radera
                </button>
              )}
              <img src={message.avatar || 'https://i.pravatar.cc/100'} alt="Avatar" />
              <p>
                <strong>{message.username || 'Du'}</strong>: {message.text || 'Message text missing'}
              </p>
            </div>
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Skicka</button>
      </form>
    </div>
  );
};

export default Chat;
