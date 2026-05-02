"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { 
  businessService, 
  agentService, 
  messageService,
  leadService
} from "@/services";
import { Business, Agent, Message } from "@/types";

export default function HostedAgentPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", email: "", phone: "", message: "" });
  const [leadSaved, setLeadSaved] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize visitor ID
    const storedVisitorId = sessionStorage.getItem("fito_visitor_id");
    if (storedVisitorId) {
      setVisitorId(storedVisitorId);
    } else {
      const newVisitorId = "guest-" + Math.random().toString(36).substring(7);
      sessionStorage.setItem("fito_visitor_id", newVisitorId);
      setVisitorId(newVisitorId);
    }

    if (slug) {
      loadData();
    }
  }, [slug]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showLeadForm, sending]);

  const loadData = async () => {
    setLoading(true);
    try {
      const biz = await businessService.getBusinessBySlug(slug as string);
      if (biz) {
        setBusiness(biz);
        const agents = await agentService.getAgentsByBusinessId(biz.id);
        const activeAgent = agents.find(a => a.status === 'active') || agents[0];
        setAgent(activeAgent);
        
        // Add initial greeting
        if (activeAgent) {
            setMessages([{
                id: 'initial',
                conversationId: '',
                businessId: biz.id,
                agentId: activeAgent.id,
                role: 'assistant',
                content: activeAgent.greeting,
                createdAt: new Date().toISOString()
            }]);
        }
      }
    } catch (err) {
      console.error("Failed to load hosted page data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !agent || !business || sending) return;

    const userMessage = input.trim();
    setInput("");
    setSending(true);

    // Add visitor message to UI
    const visitorMsg: Message = {
        id: Date.now().toString(),
        conversationId: conversationId || '',
        businessId: business.id,
        agentId: agent.id,
        role: 'visitor',
        content: userMessage,
        createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, visitorMsg]);

    try {
      const response = await fetch("/api/agents/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              businessId: business.id,
              agentId: agent.id,
              conversationId: conversationId,
              visitorId: visitorId,
              message: userMessage,
              source: "hosted_page"
          })
      });

      const data = await response.json();

      if (response.ok) {
        setConversationId(data.conversationId);
        
        const assistantMsg: Message = {
            id: Date.now().toString() + "-ai",
            conversationId: data.conversationId,
            businessId: business.id,
            agentId: agent.id,
            role: "assistant",
            content: data.content,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMsg]);

        // Auto-show lead form if intent detected or limit reached
        if (data.hasLeadIntent && !leadSaved) {
            setTimeout(() => setShowLeadForm(true), 1000);
        }
        if (data.isLimitReached) {
            console.warn("Agent limit reached");
        }
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Fallback message
      const fallbackMsg: Message = {
        id: Date.now().toString() + "-err",
        conversationId: conversationId || '',
        businessId: business.id,
        agentId: agent.id,
        role: "assistant",
        content: agent.fallbackMessage || "I'm having a bit of trouble connecting to my brain right now. Please leave your details so we can get back to you!",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setShowLeadForm(true);
    } finally {
      setSending(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!business || !agent) return;

      try {
          await leadService.createLead(business.id, agent.id, {
              ...leadData,
              conversationId: conversationId || undefined,
              source: "hosted_page"
          });
          setLeadSaved(true);
          setShowLeadForm(false);
          
          // Add confirmation message
          const systemMsg: Message = {
              id: Date.now().toString() + "-lead",
              conversationId: conversationId || '',
              businessId: business.id,
              agentId: agent.id,
              role: "assistant",
              content: "Thanks! Your information has been sent to our team. Someone will be in touch shortly.",
              createdAt: new Date().toISOString()
          };
          setMessages(prev => [...prev, systemMsg]);
      } catch (err) {
          console.error("Failed to save lead:", err);
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#0b0f10] flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          </div>
      );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-[#0b0f10] flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-black text-white font-heading uppercase tracking-tighter mb-4">Business Not Found</h1>
        <p className="text-on-surface-variant mb-8">The business you are looking for does not exist or has been moved.</p>
        <a href="/" className="btn-primary px-8 py-3 rounded-xl">Back to Fito Agents</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f10] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-secondary/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-tertiary/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-2xl flex flex-col h-[85vh] glass-panel rounded-3xl rim-light shadow-2xl overflow-hidden relative z-10">
        {/* Header */}
        <div className="p-6 md:p-8 bg-surface-container-high/50 border-b border-outline-variant flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div 
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-secondary/10"
                style={{ backgroundColor: agent?.brandColor || '#2563eb' }}
            >
              <span className="material-symbols-outlined text-2xl md:text-3xl">smart_toy</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white font-heading uppercase tracking-tight truncate max-w-[200px] md:max-w-xs">{business.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest">
                    {agent?.name || "AI Assistant"} Online
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
              {business.phone && (
                  <a href={`tel:${business.phone}`} className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant text-on-surface-variant hover:text-white transition-all">
                      <span className="material-symbols-outlined text-sm">phone</span>
                  </a>
              )}
              <button 
                onClick={() => setShowLeadForm(true)}
                className="p-2.5 bg-secondary/20 rounded-xl border border-secondary/30 text-secondary hover:bg-secondary hover:text-white transition-all"
              >
                  <span className="material-symbols-outlined text-sm">person_add</span>
              </button>
          </div>
        </div>

        {/* Chat Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant' 
                ? 'bg-surface-container text-on-surface border border-outline-variant shadow-lg' 
                : 'bg-secondary text-on-secondary-fixed shadow-lg shadow-secondary/10'
              }`}
              style={msg.role === 'visitor' ? { backgroundColor: agent?.brandColor } : {}}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
              <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
              </div>
          )}

          {showLeadForm && !leadSaved && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
                  <div className="glass-panel p-6 rounded-3xl border-secondary/30 bg-secondary/5 space-y-4 shadow-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-secondary">contact_mail</span>
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">How can we reach you?</h4>
                      </div>
                      <form onSubmit={handleLeadSubmit} className="space-y-4">
                          <input 
                            required
                            type="text" 
                            placeholder="Full Name"
                            value={leadData.name}
                            onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                            className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none"
                          />
                          <div className="grid grid-cols-2 gap-4">
                              <input 
                                required
                                type="email" 
                                placeholder="Email Address"
                                value={leadData.email}
                                onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                                className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none"
                              />
                              <input 
                                type="tel" 
                                placeholder="Phone Number"
                                value={leadData.phone}
                                onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                                className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none"
                              />
                          </div>
                          <textarea 
                            placeholder="Briefly describe what you need..."
                            rows={2}
                            value={leadData.message}
                            onChange={(e) => setLeadData({...leadData, message: e.target.value})}
                            className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-xs text-white focus:border-secondary outline-none resize-none"
                          />
                          <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowLeadForm(false)}
                                className="flex-1 py-3 rounded-xl bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border border-outline-variant"
                            >
                                Not now
                            </button>
                            <button type="submit" className="flex-[2] btn-primary py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                Submit Details
                            </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
        </div>

        {/* Footer / Input */}
        <div className="p-6 bg-surface-container-high/30 border-t border-outline-variant">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              disabled={sending}
              onChange={(e) => setInput(e.target.value)}
              placeholder={sending ? "Agent is thinking..." : `Ask me anything...`}
              className="w-full bg-surface-container-low border border-outline-variant rounded-2xl pl-6 pr-16 py-4 text-sm text-on-surface focus:outline-none focus:border-secondary transition-all font-bold placeholder:text-on-surface-variant/30 disabled:opacity-50"
            />
            <button 
                type="submit" 
                disabled={sending || !input.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-on-secondary-fixed hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                style={{ backgroundColor: agent?.brandColor }}
            >
              {sending ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                  <span className="material-symbols-outlined">send</span>
              )}
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Powered by</p>
              <span className="text-[10px] font-black text-white font-heading">Fito Agents</span>
          </div>
        </div>
      </div>
      
      {/* Side Info (Desktop Only) */}
      <div className="hidden xl:block absolute left-12 top-1/2 -translate-y-1/2 space-y-6 max-w-xs z-20">
          <div className="glass-panel p-8 rounded-[2rem] rim-light shadow-2xl">
              <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span> About Business
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed font-medium italic">
                  "{business.description}"
              </p>
          </div>
          {(business.businessHours || business.address) && (
            <div className="glass-panel p-8 rounded-[2rem] rim-light shadow-2xl">
                <h4 className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span> Details
                </h4>
                <div className="space-y-4">
                    {business.businessHours && (
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-1">Hours</p>
                            <p className="text-xs text-white leading-relaxed">{business.businessHours}</p>
                        </div>
                    )}
                    {business.address && (
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-1">Address</p>
                            <p className="text-xs text-white leading-relaxed">{business.address}</p>
                        </div>
                    )}
                </div>
            </div>
          )}
      </div>
    </div>
  );
}
