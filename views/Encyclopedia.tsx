import React, { useState, useRef, useEffect } from 'react';
import { Plant, ChatMessage } from '../types';
import { VEGETABLES_DB } from '../constants';
import { sendMessageToPlant } from '../services/geminiService';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

export const Encyclopedia: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Olá! É um prazer ter você cuidando de mim hoje. O que você gostaria de saber sobre as minhas raízes ou as minhas amigas plantas? 🍅' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Gemini
    const responseText = await sendMessageToPlant(input);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
  };

  return (
    <div className="min-h-full bg-horta-light pb-24 px-4 pt-8">
      <h2 className="font-display text-3xl font-bold text-horta-dark mb-6 text-center">
        Guia do Cultivador
      </h2>

      {/* Cards Section */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {VEGETABLES_DB.map((veg) => (
          <div key={veg.name} className="bg-white rounded-3xl p-4 shadow-md flex items-center gap-4 border-b-4 border-gray-100">
            <div className={`w-20 h-20 ${veg.color} rounded-2xl flex items-center justify-center shrink-0`}>
              <img src={veg.image} alt={veg.name} className="w-full h-full object-cover rounded-2xl mix-blend-overlay opacity-80" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">{veg.name}</h3>
              <p className="text-gray-500 text-sm leading-tight mt-1">{veg.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat Section */}
      <div className="bg-white rounded-[32px] shadow-xl overflow-hidden border-4 border-horta-main flex flex-col h-[400px]">
        <div className="bg-horta-main p-4 flex items-center gap-2 text-white">
            <div className="bg-white/20 p-2 rounded-full">
                <Sparkles size={20} />
            </div>
            <span className="font-bold">Guia do Tutor de Plantas</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-horta-water text-white rounded-br-none' 
                    : 'bg-white text-black shadow-sm border border-gray-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white text-gray-400 px-4 py-2 rounded-2xl rounded-bl-none text-xs animate-pulse">
                 Sr. Tomatinho está florescendo uma resposta...
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="O que gostaria de saber hoje?"
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-horta-main text-black"
          />
          <button 
            onClick={handleSend}
            className="bg-horta-main text-white p-2 rounded-xl hover:bg-horta-dark transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};