import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  Calendar,
  Ticket,
  ShieldCheck,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { UserProfile, DepartmentEvent } from '../types';
import { safeFetchJson, generateClientAssistantReply } from '../lib/clientFallback';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionSuggestion?: {
    label: string;
    targetView: 'catalog' | 'calendar' | 'passes' | 'hod' | 'profile';
  };
}

interface CampusAIAssistantProps {
  currentUser?: UserProfile;
  activeView: string;
  events?: DepartmentEvent[];
  onNavigate: (view: any) => void;
}

const QUICK_PROMPTS = [
  'What events are on the page right now?',
  'Show countdown timers for events',
  'Explain all pages in this portal',
  'How do I print my Admit Slip?',
  'How do I customize my profile & photo?'
];

export const CampusAIAssistant: React.FC<CampusAIAssistantProps> = ({
  currentUser,
  activeView,
  events = [],
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${
        currentUser?.name ? currentUser.name : 'Vignan University Guest'
      }! I am your Vignan CampusFlow AI Assistant. I have complete real-time awareness of every event charter, venue, countdown timer, and workflow in this system.

Here is what you can ask or explore:
• 🏛️ **Public Catalog** — Browse all approved events with live countdown timers (public access without login)
• 📅 **Events Calendar** — Visual monthly calendar with export to Google Calendar & Outlook
• 🎫 **My Registrations** — View confirmed passes, trigger **"Print Admit Slip"** for browser printing, or download PNG
• 🛡️ **HOD Statutory Review Queue** — Department clearance hub for event charters
• 👤 **Profile & Photo Customization** — Custom name, photo, and roll number saved across the platform

Ask me anything about events, schedules, countdown timers, venues, speakers, or pages!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      let replyText = '';
      try {
        const token = localStorage.getItem('campusflow_token') || localStorage.getItem('campusflow_auth_token');
        const data = await safeFetchJson<{ reply?: string }>('/api/assistant/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            message: query,
            activeView,
            currentEvents: events,
            history: messages.slice(-6).map((m) => ({
              role: m.sender,
              content: m.text
            }))
          })
        });

        if (data && data.reply) {
          replyText = data.reply;
        }
      } catch (netErr) {
        // Fall through to client assistant generator
      }

      if (!replyText) {
        replyText = generateClientAssistantReply(query, events, activeView);
      }

      // Determine smart quick action suggestion
      let actionSuggestion: Message['actionSuggestion'] = undefined;
      const lower = query.toLowerCase();
      if (lower.includes('download') || lower.includes('offline') || lower.includes('pass') || lower.includes('ticket') || lower.includes('admit') || lower.includes('my registration') || lower.includes('print')) {
        actionSuggestion = { label: 'Go to My Registrations & Print Slip', targetView: 'passes' };
      } else if (lower.includes('calendar') || lower.includes('date') || lower.includes('schedule')) {
        actionSuggestion = { label: 'Open Events Calendar', targetView: 'calendar' };
      } else if (lower.includes('catalog') || lower.includes('discover') || lower.includes('upcoming') || lower.includes('explore')) {
        actionSuggestion = { label: 'Go to Public Catalog', targetView: 'catalog' };
      } else if (lower.includes('hod') || lower.includes('approval') || lower.includes('queue')) {
        actionSuggestion = { label: 'Open HOD Review Queue', targetView: 'hod' };
      } else if (lower.includes('profile') || lower.includes('photo') || lower.includes('name') || lower.includes('customize')) {
        actionSuggestion = { label: 'Customize Profile', targetView: 'profile' };
      }

      const botMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestion
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const fallbackText = generateClientAssistantReply(query, events, activeView);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-bot-${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. How can I assist you with Vignan events today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderFormattedText = (text: string) => {
    // Basic markdown formatting for bold, bullets, newlines
    const lines = text.split('\n');
    return (
      <div className="space-y-1 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Process bold text (**bold**)
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-blue-600 font-bold shrink-0">•</span>
                <span>{formattedParts}</span>
              </div>
            );
          }

          return <p key={idx}>{formattedParts}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            id="open-ai-assistant-btn"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-blue-400/30"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white animate-bounce" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white" />
            </div>
            <span className="text-xs font-bold tracking-tight pr-1">
              Ask CampusFlow AI
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/40 text-blue-100 font-mono font-medium hidden sm:inline-block">
              Online
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          id="campus-ai-assistant-modal"
          className={`fixed z-50 transition-all duration-200 shadow-2xl border border-slate-200 bg-white flex flex-col ${
            isExpanded
              ? 'inset-4 md:inset-10 rounded-2xl'
              : 'bottom-4 right-4 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-4 rounded-t-2xl flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white font-display">
                    CampusFlow Virtual Assistant
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-300">
                  Vignan Institutional Portal AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                id="close-ai-assistant-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Topics:
            </span>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-medium whitespace-nowrap transition-colors shrink-0 shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {msg.sender === 'assistant'
                    ? renderFormattedText(msg.text)
                    : <p className="leading-relaxed">{msg.text}</p>}
                </div>

                {/* Optional smart suggestion navigation pill */}
                {msg.actionSuggestion && (
                  <button
                    onClick={() => {
                      onNavigate(msg.actionSuggestion!.targetView);
                      if (!isExpanded) setIsOpen(false);
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-[11px] font-bold shadow-2xs transition-colors"
                  >
                    <span>{msg.actionSuggestion.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-xs text-xs text-slate-500 w-fit">
                <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span className="animate-pulse font-medium">
                  CampusFlow AI is writing...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 rounded-b-2xl flex items-center gap-2 shrink-0"
          >
            <input
              id="ai-assistant-input"
              type="text"
              placeholder="Ask about events, HOD approval, QR passes, feedback..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isTyping}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
            <button
              id="send-ai-message-btn"
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:bg-slate-200 disabled:text-slate-400 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
