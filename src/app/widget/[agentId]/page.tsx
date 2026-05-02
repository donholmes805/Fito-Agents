"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { businessService, agentService } from "@/services";
import { Agent, Business, Message } from "@/types";

export default function WidgetPage() {
  return (
    <Suspense fallback={null}>
      <WidgetContent />
    </Suspense>
  );
}

function WidgetContent() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .widget-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .widget-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .widget-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .widget-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .rim-light {
          box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.05);
        }
      `}} />
      <WidgetUI />
    </>
  );
}

function WidgetUI() {
  const params = useParams();
  const searchParams = useSearchParams();
  const agentId = params.agentId as string;
  
  // Customization from URL (overrides Firestore)
  const overridePosition = searchParams.get("position");
  const overrideColor = searchParams.get("primary-color");
  const overrideTheme = searchParams.get("theme");

  const [agent, setAgent] = useState<Agent | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isLeadCaptured, setIsLeadCaptured] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      // Notify parent about state change for resizing
      const state = isOpen ? 'open' : 'closed';
      window.parent.postMessage({ type: 'fito-resize', state }, '*');
  }, [isOpen]);

  useEffect(() => {
    if (agentId) {
      loadAgentData();
      initVisitor();
    }
  }, [agentId]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending, isOpen]);

  const initVisitor = () => {
    const vId = sessionStorage.getItem(`fito_visitor_${agentId}`);
    const cId = sessionStorage.getItem(`fito_conv_${agentId}`);
    
    if (vId) setVisitorId(vId);
    else {
        const newVId = `v-${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem(`fito_visitor_${agentId}`, newVId);
        setVisitorId(newVId);
    }
    
    if (cId) setConversationId(cId);
  };

  const loadAgentData = async () => {
    try {
      const agentData = await agentService.getAgentById(agentId);
      if (agentData && agentData.status === 'active') {
        setAgent(agentData);
        const bizData = await businessService.getBusinessById(agentData.businessId);
        setBusiness(bizData);
        
        // Initial Greeting
        setMessages([{
            id: 'greeting',
            conversationId: '',
            businessId: agentData.businessId,
            agentId: agentData.id,
            role: 'assistant',
            content: agentData.greeting || "Hello! How can I help you?",
            createdAt: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error("Widget load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending || !agent) return;

    const userMsg = input.trim();
    setInput("");
    setIsSending(true);

    const visitorMsg: Message = {
        id: Date.now().toString(),
        conversationId: conversationId || '',
        businessId: agent.businessId,
        agentId: agent.id,
        role: 'visitor',
        content: userMsg,
        createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, visitorMsg]);

    try {
        const response = await fetch("/api/agents/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                agentId: agent.id,
                conversationId,
                visitorId,
                message: userMsg,
                source: "embed_widget"
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            setMessages(prev => [...prev, {
                id: Date.now().toString() + "-error",
                conversationId: '',
                businessId: agent.businessId,
                agentId: agent.id,
                role: 'assistant',
                content: data.message || "I'm sorry, I'm currently unavailable. Please try again later.",
                createdAt: new Date().toISOString()
            }]);
            return;
        }

        if (data.conversationId && !conversationId) {
            setConversationId(data.conversationId);
            sessionStorage.setItem(`fito_conv_${agentId}`, data.conversationId);
        }

        const assistantMsg: Message = {
            id: Date.now().toString() + "-ai",
            conversationId: data.conversationId,
            businessId: agent.businessId,
            agentId: agent.id,
            role: "assistant",
            content: data.content,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);

        if (data.hasLeadIntent && !isLeadCaptured) {
            setShowLeadForm(true);
        }

    } catch (err) {
        console.error("Chat error:", err);
    } finally {
        setIsSending(false);
    }
  };

  const handleLeadSubmit = async (leadData: any) => {
      try {
          const response = await fetch("/api/leads/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  ...leadData,
                  agentId: agent?.id,
                  conversationId,
                  source: "embed_widget"
              })
          });
          
          if (response.ok) {
              setIsLeadCaptured(true);
              setShowLeadForm(false);
              setMessages(prev => [...prev, {
                  id: 'lead-success',
                  conversationId: conversationId || '',
                  businessId: agent?.businessId || '',
                  agentId: agent?.id || '',
                  role: 'assistant',
                  content: "Thank you! Your information has been sent to the team. Someone will be in touch soon.",
                  createdAt: new Date().toISOString()
              }]);
          }
      } catch (err) {
          console.error("Lead submission error:", err);
      }
  };

  if (loading) return null;
  if (!agent) return <div className="p-4 text-xs text-on-surface-variant font-bold uppercase tracking-widest text-center">Agent Unavailable</div>;

  const primaryColor = overrideColor || agent.brandColor || "#2563eb";
  const position = overridePosition || agent.widgetPosition || "bottom-right";

  return (
    <div className={`fixed inset-0 pointer-events-none flex flex-col ${position === 'bottom-right' ? 'items-end' : 'items-start'} justify-end p-4 md:p-6`}>
      
      {/* Chat Panel */}
      {isOpen && (
        <div className={`w-full sm:w-[400px] h-[85vh] sm:h-[600px] bg-surface-container-lowest border border-outline-variant rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 mb-4 rim-light`}>
          {/* Header */}
          <div className="p-6 bg-surface-container border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                    <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">{agent.name}</h3>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{business?.name || 'Online'}</p>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 widget-scroll">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300`}>
                    <div 
                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'assistant' 
                            ? 'bg-surface-container text-white border border-outline-variant' 
                            : 'text-white'
                        }`}
                        style={msg.role === 'visitor' ? { backgroundColor: primaryColor } : {}}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}
            
            {isSending && (
                <div className="flex justify-start">
                    <div className="bg-surface-container p-3 rounded-2xl border border-outline-variant flex gap-1">
                        <span className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                </div>
            )}

            {showLeadForm && (
                <div className="bg-surface-container border border-secondary/30 rounded-2xl p-6 space-y-4 animate-in zoom-in-95">
                    <div className="text-center">
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">Connect with us</h4>
                        <p className="text-[10px] text-on-surface-variant mt-1">Leave your details and we'll get back to you!</p>
                    </div>
                    <LeadForm onSubmit={handleLeadSubmit} onCancel={() => setShowLeadForm(false)} />
                </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-surface-container border-t border-outline-variant">
            <form onSubmit={handleSendMessage} className="relative">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending || showLeadForm}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl pl-5 pr-12 py-4 text-sm text-white focus:outline-none focus:border-secondary transition-all disabled:opacity-50"
                />
                <button 
                    type="submit"
                    disabled={isSending || !input.trim() || showLeadForm}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white disabled:opacity-30 transition-all hover:scale-110"
                    style={{ color: primaryColor }}
                >
                    <span className="material-symbols-outlined">send</span>
                </button>
            </form>
            <div className="mt-4 text-center">
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-30">
                    Powered by <span className="text-white">Fito Agents</span>
                </p>
            </div>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white pointer-events-auto hover:scale-110 active:scale-95 transition-all relative group"
        style={{ backgroundColor: primaryColor }}
      >
        <span className={`material-symbols-outlined text-3xl transition-all duration-300 ${isOpen ? 'rotate-90 scale-0' : 'scale-100'}`}>chat</span>
        <span className={`material-symbols-outlined text-3xl absolute transition-all duration-300 ${isOpen ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}>close</span>
        
        {!isOpen && (
            <div className="absolute right-full mr-4 whitespace-nowrap bg-white text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                Ask a question
            </div>
        )}
      </button>

    </div>
  );
}

function LeadForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void, onCancel: () => void }) {
    const [data, setData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <input 
                required
                type="text"
                placeholder="Full Name"
                value={data.name}
                onChange={e => setData({...data, name: e.target.value})}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-secondary"
            />
            <input 
                required
                type="email"
                placeholder="Email Address"
                value={data.email}
                onChange={e => setData({...data, email: e.target.value})}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-secondary"
            />
            <input 
                type="tel"
                placeholder="Phone Number (Optional)"
                value={data.phone}
                onChange={e => setData({...data, phone: e.target.value})}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-secondary"
            />
            <div className="flex gap-2 pt-2">
                <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl bg-surface-container-high text-[9px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white">Cancel</button>
                <button type="submit" className="flex-[2] py-3 rounded-xl bg-secondary text-white text-[9px] font-bold uppercase tracking-widest hover:bg-secondary/80">Submit Info</button>
            </div>
        </form>
    );
}
