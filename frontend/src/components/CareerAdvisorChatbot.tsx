import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { userService } from '../services/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CareerAdvisorChatbotProps {
  currentUser: UserProfile;
  triggerToast: (title: string, text: string, type: 'success' | 'info' | 'error') => void;
}

function parseMarkdown(text: string, isAI: boolean): React.ReactNode[] {
  const lines = text.split('\n');
  let inList = false;
  const listItems: React.ReactNode[] = [];
  const elements: React.ReactNode[] = [];

  const renderInline = (str: string, key: string) => {
    let html = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace bold: **text**
    // We add font-bold text-inherit to keep text color visible and inherit parent bubble color
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-inherit bg-transparent">$1</strong>');
    
    // Replace italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-inherit bg-transparent">$1</em>');
    
    // Replace inline code: `code`
    // We customize the background and text color based on who is sending the message
    if (isAI) {
      // AI message (light bubble): use light grey bg with brand-800 purple text
      html = html.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 text-brand-800 font-mono text-[10.5px] rounded border border-slate-200/60">$1</code>');
    } else {
      // User message (dark purple bubble): use white transparent bg with white text
      html = html.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-white/20 text-white font-mono text-[10.5px] rounded border border-white/10">$1</code>');
    }

    return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) {
        inList = true;
      }
      listItems.push(
        <li key={`li-${index}`} className="ml-4 list-disc pl-0.5 mb-1 text-xs">
          {renderInline(trimmed.substring(2), `inline-${index}`)}
        </li>
      );
    } else {
      if (inList) {
        elements.push(
          <ul key={`ul-${index}`} className="my-1.5 space-y-0.5">
            {[...listItems]}
          </ul>
        );
        listItems.length = 0;
        inList = false;
      }
      if (trimmed) {
        elements.push(
          <p key={`p-${index}`} className="mb-2 text-xs leading-relaxed">
            {renderInline(line, `inline-${index}`)}
          </p>
        );
      } else {
        elements.push(<div key={`br-${index}`} className="h-2" />);
      }
    }
  });

  if (inList) {
    elements.push(
      <ul key={`ul-end`} className="my-1.5 space-y-0.5">
        {[...listItems]}
      </ul>
    );
  }

  return elements;
}

export default function CareerAdvisorChatbot({ currentUser, triggerToast }: CareerAdvisorChatbotProps) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = sessionStorage.getItem('spsu_chatbot_open');
    return saved === 'true';
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('spsu_chatbot_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        role: 'assistant',
        content: `Hello ${currentUser.name}! I am your SPSU AI Career Advisor. Ask me anything about engineering/design placements, optimizing your semester GPAs, interview prep tactics, or polishing your cover letter pitch!`
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Monitor user switch to reset chat state if user logouts/logins as another student
  useEffect(() => {
    const savedUserId = sessionStorage.getItem('spsu_chatbot_user_id');
    if (savedUserId !== currentUser.id) {
      sessionStorage.setItem('spsu_chatbot_user_id', currentUser.id);
      sessionStorage.removeItem('spsu_chatbot_open');
      sessionStorage.removeItem('spsu_chatbot_messages');
      setIsOpen(false);
      setMessages([
        {
          role: 'assistant',
          content: `Hello ${currentUser.name}! I am your SPSU AI Career Advisor. Ask me anything about engineering/design placements, optimizing your semester GPAs, interview prep tactics, or polishing your cover letter pitch!`
        }
      ]);
    }
  }, [currentUser.id, currentUser.name]);

  useEffect(() => {
    sessionStorage.setItem('spsu_chatbot_open', String(isOpen));
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem('spsu_chatbot_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message to state
    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send chat context to backend Groq/Simulation
      const data = await userService.chat(userMessage, messages);
      setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      triggerToast('AI Offline', 'Could not establish connection with Career Advisor AI.', 'error');
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Apologies, my coordination signals are currently offline. Please check your backend Groq connection.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-50 border border-brand-100"
        title="AI Career Advisor"
      >
        {isOpen ? (
          <i className="fa-solid fa-xmark text-lg" />
        ) : (
          <div className="relative">
            <i className="fa-solid fa-robot text-lg animate-bounce" />
            <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-brand-600" />
          </div>
        )}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[520px] max-h-[75vh] bg-white border border-brand-100 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden purple-glow animate-fadeInUp">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-editorial to-brand-700 p-4 text-white flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10 shadow-inner">
                <i className="fa-solid fa-wand-magic-sparkles text-sm" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold font-serif font-display leading-tight">SPSU Career Advisor AI</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-mono text-brand-100 uppercase tracking-widest">Active & Online</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-brand-100 hover:text-white cursor-pointer"
            >
              <i className="fa-solid fa-chevron-down text-xs" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf5ff]/40">
            {messages.map((msg, index) => {
              const isAI = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed text-left shadow-xs ${
                      isAI
                        ? 'bg-white border border-brand-100 text-text-main rounded-tl-sm'
                        : 'bg-brand-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {parseMarkdown(msg.content, isAI)}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-brand-100 p-3.5 rounded-2xl rounded-tl-sm shadow-xs flex items-center gap-2 text-xs text-text-light font-mono">
                  <i className="fa-solid fa-spinner fa-spin text-brand-600" />
                  <span>Advisor is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-brand-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about resume updates or interview prep..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-brand-50/50 border border-brand-100 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm ${
                inputText.trim() && !isLoading
                  ? 'bg-brand-600 hover:bg-brand-700 text-white hover:scale-102'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <i className="fa-solid fa-paper-plane text-xs" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
