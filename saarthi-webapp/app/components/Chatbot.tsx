import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  botName?: string;
  welcomeMessage?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({
  botName = 'Saarthi',
  welcomeMessage = 'Hello! How can I help you today?',
  position = 'bottom-right',
  primaryColor = '#3b82f6'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getBotResponse = (input: string): string => {
    const responses = [
      "That's an interesting question! Let me help you with that.",
      "I understand what you're asking. Here's what I think...",
      "Thanks for reaching out! I'd be happy to assist you.",
      "Great question! Based on what you've shared...",
      "I'm here to help! Let me provide you with some information.",
      "That's a good point. Here's my perspective on that...",
    ];
    
    if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
      return `Hello! Nice to meet you. I'm ${botName}, and I'm here to help you with any questions you might have.`;
    }
    
    if (input.toLowerCase().includes('help')) {
      return "I'm here to assist you! You can ask me questions about our services, get support, or just have a conversation. What would you like to know?";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-200 rounded-t-lg"
            style={{ backgroundColor: '#006A60' }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" style={{ color: '#006A60' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{botName}</h3>
                <p className="text-white/80 text-xs">Online now</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'text-white rounded-br-none'
                      : 'rounded-bl-none'
                  }`}
                  style={message.sender === 'user' 
                    ? { backgroundColor: '#006A60' } 
                    : { backgroundColor: '#E3EAE7', color: '#006A60' }}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#006A60' }} />
                    )}
                    {message.sender === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-white" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg rounded-bl-none" style={{ backgroundColor: '#E3EAE7' }}>
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" style={{ color: '#006A60' }} />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#006A60' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#006A60', animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#006A60', animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#006A60' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className=" w-12 md:w-16 h-12 md:h-16 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group border-2 border-dashed"
        style={{ 
          backgroundColor: '#E3EAE7',
          borderColor: '#006A60'
        }}
      >
        {isOpen ? (
          <X className="w-7 h-7 transition-transform group-hover:scale-110" style={{ color: '#006A60' }} />
        ) : (
          <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" style={{ color: '#006A60' }} />
        )}
      </button>
    </div>
  );
};

export default Chatbot;