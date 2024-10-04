import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import './Chat.css';

const Chat = ({ conversationId = 'mock-conversation-id' }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  // Lista med olika fraser som Patrik kan svara med
  const fakeChatReplies = [
    "Tja tja, hur mår du?",
    "Hallå!! Svara då!!",
    "Sover du eller?! 😴",
    "Hur var din dag?",
    "Ska vi ses snart?",
    "Jag funderar på vad vi kan hitta på i helgen!",
    "Såg du den nya filmen på bio?",
    "Vad tänker du på?",
    "Hur går det med jobbet?",
    "Har du några roliga planer till helgen?"
  ];

  // Funktion för att välja ett slumpmässigt svar från Patrik
  const getRandomReply = () => {
    return fakeChatReplies[Math.floor(Math.random() * fakeChatReplies.length)];
  };

  useEffect(() => {
    // Hämta användarnamn och avatar från localStorage
    const savedUsername = localStorage.getItem('username');
    const savedAvatar = localStorage.getItem('avatar');
    
    setUsername(savedUsername || 'användare');
    setAvatar(savedAvatar || 'https://i.pravatar.cc/100');

    // Hämta meddelanden från servern vid inloggning
    const fetchMessages = async () => {
      try {
        const response = await fetch('https://chatify-api.up.railway.app/messages', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);  // Sätt alla meddelanden från servern
        } else {
          console.error('Failed to fetch messages:', response.status);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [conversationId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const sanitizedMessage = DOMPurify.sanitize(newMessage);

    if (!sanitizedMessage.trim()) {
      alert('Message cannot be empty.');
      return;
    }

    const payload = {
      text: sanitizedMessage,
      ...(conversationId && conversationId !== 'mock-conversation-id' && { conversationId }),
    };

    try {
      const response = await fetch('https://chatify-api.up.railway.app/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newMessageData = await response.json();
        
        // Här hämtar vi avatar och username från localStorage igen
        const savedAvatar = localStorage.getItem('avatar');
        const savedUsername = localStorage.getItem('username');

        setMessages([...messages, { 
          ...newMessageData.latestMessage, 
          username: savedUsername,  // Använd det sparade användarnamnet
          avatar: savedAvatar || 'https://i.pravatar.cc/100',  // Använd den sparade avataren
        }]);
        
        setNewMessage('');

        // Visa slumpmässiga Patrik-meddelanden varje gång användaren skickar ett nytt meddelande
        setTimeout(() => {
          const randomReply = getRandomReply(); // Få ett slumpmässigt svar från Patrik
          const fakeReply = {
            id: `fake-${Date.now()}`,
            text: randomReply,
            username: 'Patrik',  // Byt namn från Johnny till Patrik
            avatar: 'https://i.pravatar.cc/100?img=14',
            conversationId: null,
          };
          setMessages((prevMessages) => [...prevMessages, fakeReply]);
        }, 1000); // 1 sekunds fördröjning
      } else {
        const errorData = await response.json();
        console.error(`Failed to send message: ${response.status}`, errorData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`https://chatify-api.up.railway.app/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        setMessages(messages.filter((message) => message.id !== messageId));
      } else {
        console.error(`Failed to delete message: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="chat-page">
      <h2>Hej {username || 'användare'}!</h2>
      {avatar && <img src={avatar} alt="User Avatar" />}  {/* Visa avataren om den finns */}

      <div className="messages-container">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={message.id || `temp-${index}`} className={`message ${message.username === 'Patrik' ? 'patrik-message' : 'user-message'}`}>
              {message.username !== 'Patrik' && (
                <button onClick={() => handleDeleteMessage(message.id)}>Radera</button>
              )}
              <img src={message.avatar || "https://i.pravatar.cc/100"} alt="Avatar" />
              <p><strong>{message.username || 'Du'}</strong>: {message.text || 'Message text missing'}</p>
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
