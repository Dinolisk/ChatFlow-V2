import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import './Chat.css';

const Chat = ({ setIsAuthenticated }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('authToken'); // Fetch the auth token

    // Fetch messages from the API
    useEffect(() => {
        const fetchMessages = async () => {
            if (!token) {
                console.error('Token is missing');
                return;
            }
            try {
                const response = await fetch('https://chatify-api.up.railway.app/messages', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                } else {
                    console.error('Failed to fetch messages:', response.status);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };
        fetchMessages();
    }, [token]);

    // Create new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const sanitizedMessage = DOMPurify.sanitize(newMessage);
    
        if (!sanitizedMessage.trim()) {
            alert('Message cannot be empty.');
            return;
        }
    
        try {
            const response = await fetch('https://chatify-api.up.railway.app/messages', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: sanitizedMessage }),
            });
    
            if (response.ok) {
                const newMessageData = await response.json();
    
                // Log the entire response to check its structure
                console.log('New message response:', newMessageData);
    
                // Use the latestMessage field from the response
                if (newMessageData.latestMessage && newMessageData.latestMessage.text) {
                    setMessages([...messages, newMessageData.latestMessage]); // Add the latest message to the list
                } else {
                    console.error('New message data is missing the text field.');
                }
    
                setNewMessage(''); // Clear the input field
            } else {
                console.error('Failed to send message:', response.status);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Delete a message
    const handleDeleteMessage = async (messageId) => {
        try {
            const response = await fetch(`https://chatify-api.up.railway.app/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setMessages(messages.filter((message) => message.id !== messageId));
            } else {
                console.error('Failed to delete message:', response.status);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    return (
        <div className="chat-page">
            <h2>ChatFlow V2.2</h2>
            <div className="messages-container">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <div
                            key={message.id ? message.id : `temp-${index}`} // Ensure each message has a unique key
                            className="message"
                        >
                            {/* Display the actual message text */}
                            {message.text ? <p>{message.text}</p> : <p>Message text missing</p>}  
                            <button onClick={() => handleDeleteMessage(message.id)}>Delete</button>
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
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;
