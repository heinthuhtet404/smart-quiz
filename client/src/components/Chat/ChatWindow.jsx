import MessageInput from './MessageInput';
import React, { useState } from 'react';
import './ChatWindow.css'; // Assuming you have a CSS file for styling
import kokoImg from '../../assets/images/ko-ko.jpg';
import youImg from '../../assets/images/You.jpg';
import heinImg from '../../assets/images/hein.jpg';

const ChatWindow = () => {
  const dummyMessages = [
    { sender: 'Ko Ko', text: 'Hi!', imgUrl: kokoImg },
    { sender: 'You', text: 'Hello, how are you?', imgUrl: youImg },
    { sender: 'hein', text: 'I’m good, thanks!', imgUrl: heinImg },
    { sender: 'Ko Ko', text: 'What about you?', imgUrl: kokoImg },
    { sender: 'You', text: 'I’m doing well, just working on a project.', imgUrl: youImg },
    { sender: 'hein', text: 'That sounds interesting!', imgUrl: heinImg },
    { sender: 'Ko Ko', text: 'Yeah, it is. What are you up to?', imgUrl: kokoImg },
    { sender: 'You', text: 'Just relaxing and catching up with friends.', imgUrl: youImg },
    { sender: 'hein', text: 'Nice! Let’s hang out soon.', imgUrl: heinImg },
  ];
  const [messages, setMessages] = useState(dummyMessages);

  const handleSend = (newMessageText) => {
    const newMessage = {
      sender: 'You',
      text: newMessageText,
      imgUrl: youImg,
    };
    setMessages([...messages, newMessage]);
  }

  return (
    <div className="chat-window">
      <div className="message-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'You' ? 'my-message' : 'other-message'}`}
          >
            <img src={message.imgUrl} alt={message.sender} className="message-img" />
            <p className={`message-text ${message.sender === 'You' ? 'my-message-text' : 'other-message-text'}`}>{message.text}</p>
          </div>
        ))}
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
};




export default ChatWindow;
