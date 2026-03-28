import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Zap, Calendar, AlertCircle } from 'lucide-react';

export default function Chat({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Campus Autonomous Assistant. I can help resolve timetable clashes, sync events to your calendar, or request deadline extensions. How can I help you today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  const demoQueries = [
    "My DAA lab clashes with Physics lab",
    "Where is today's TechFest event?",
    "Request deadline extension for DAA due to medical reasons"
  ];

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, studentId: user.id })
      });
      const data = await res.json();
      
      const botMsg = { 
        role: 'assistant', 
        content: data.reply,
        details: data.details
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred while connecting to the assistant.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (user.role !== 'student') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 glass rounded-2xl mx-auto max-w-2xl mt-12 bg-white/70">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Student Access Required</h2>
        <p className="mt-2 text-sm">Please switch to a Student account in the top right to interact with the Autonomous Assistant.</p>
      </div>
    );
  }

  const renderIconForIntent = (intent) => {
    switch (intent) {
      case 'timetable_clash': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'event_query': return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'approval_request': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto glass rounded-2xl overflow-hidden bg-white/80 shadow-2xl border border-white/40 relative">
       {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 -z-10"></div>
      
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
              <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'}
              `}>
                {msg.content}
              </div>
              
              {/* Action Details Card */}
              {msg.details?.success && msg.details?.result && msg.role === 'assistant' && (
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 rounded-xl shadow-sm space-y-3 mt-2 w-full max-w-md animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-2">
                    {renderIconForIntent(msg.details.result.intent)}
                    <span>Action Taken</span>
                  </div>
                  
                  {msg.details.result.result?.ticketId && (
                     <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-lg text-sm">
                       <span className="text-slate-600 font-medium">Ticket ID</span>
                       <span className="text-indigo-700 font-bold font-mono">#{msg.details.result.result.ticketId}</span>
                     </div>
                  )}

                  {msg.details.result.result?.event && (
                     <div className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-lg text-sm">
                       <span className="text-slate-600 font-medium">Added to Calendar</span>
                       <span className="text-emerald-700 font-bold">{msg.details.result.result.event.time}</span>
                     </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-600">Workflow Completed • Verified</span>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 shadow-sm shrink-0">
                <User className="w-5 h-5 text-slate-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 animate-fade-in">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center opacity-70 shrink-0">
               <Bot className="w-5 h-5 text-white" />
             </div>
             <div className="bg-white/80 border border-slate-100 px-5 py-3.5 rounded-2xl rounded-bl-sm flex gap-2 items-center">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
             </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="p-4 bg-white/50 border-t border-slate-200/50 backdrop-blur-md">
        {/* Chips for quick demo */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {demoQueries.map((q, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(q)}
                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your issue or request..."
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 shadow-sm rounded-full pl-6 pr-14 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-800 disabled:opacity-60"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 transition-colors flex items-center justify-center shadow-md active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
