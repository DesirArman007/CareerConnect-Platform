import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { generateCareerAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I\'m your AI Career Agent. Ask me about salary trends, resume tips, or finding a role at a specific company.' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await generateCareerAdvice(userMsg);

    setLoading(false);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
  };

  return (
    <>
      {/* Trigger Button */}
      <div className="fixed bottom-6 right-4 md:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border border-white/10
            ${isOpen ? 'bg-surface hover:bg-surface-hover text-white rotate-90' : 'bg-accent hover:bg-accent-hover text-white animate-bounce'}
          `}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-[400px] h-[500px] max-h-[calc(100vh-8rem)] bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden animate-fade-in-up origin-bottom-right">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">WorkRaze AI Agent</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-accent text-white rounded-br-none'
                      : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'}
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl rounded-bl-none px-4 py-3 border border-white/5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask for career advice..."
                className="w-full bg-surface border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="absolute right-1.5 top-1.5 p-1.5 bg-accent hover:bg-accent-hover text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};