"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { conversationService, messageService, agentService } from "@/services";
import { Conversation, Message, Agent } from "@/types";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function ConversationLogsPage() {
  const { businessId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId]);

  useEffect(() => {
    if (selectedConv) {
      const q = query(
        collection(db, "conversations", selectedConv.id, "messages"),
        orderBy("createdAt", "asc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => doc.data() as Message);
        setMessages(msgs);
      });

      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [selectedConv]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [convsData, agentsData] = await Promise.all([
        conversationService.getConversationsByBusiness(businessId!),
        agentService.getAgentsByBusinessId(businessId!)
      ]);
      setConversations(convsData);
      setAgents(agentsData);
      if (convsData.length > 0) {
        setSelectedConv(convsData[0]);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConvs = conversations.filter(conv => 
    conv.visitorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agents.find(a => a.id === conv.agentId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-8">
      {/* List Panel */}
      <div className="w-1/3 glass-panel rounded-[2rem] flex flex-col rim-light overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-outline-variant bg-surface-container-high/50">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4">Conversations</h3>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                <input
                    type="text"
                    placeholder="Search visitors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl pl-12 pr-6 py-3 text-xs text-white focus:outline-none focus:border-secondary font-bold placeholder:text-on-surface-variant/30"
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant scrollbar-hide">
          {filteredConvs.length === 0 ? (
              <div className="p-12 text-center opacity-20">
                  <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest">No chats found</p>
              </div>
          ) : (
            filteredConvs.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-6 cursor-pointer transition-all border-l-4 ${
                  selectedConv?.id === conv.id 
                  ? "bg-secondary/10 border-secondary" 
                  : "hover:bg-surface-container border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[150px]">
                      {conv.visitorId.startsWith('anon-') ? `Guest ${conv.visitorId.slice(-4)}` : conv.visitorId}
                  </span>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${conv.status === 'open' ? 'bg-tertiary' : 'bg-surface-variant'}`}></span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {agents.find(a => a.id === conv.agentId)?.name || 'AI Assistant'}
                    </span>
                    {conv.leadId && (
                        <span className="ml-auto text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/20">
                            LEAD
                        </span>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transcript Panel */}
      <div className="flex-1 glass-panel rounded-[2.5rem] flex flex-col rim-light overflow-hidden bg-surface-container-lowest/30 shadow-2xl relative">
        {selectedConv ? (
          <>
            <div className="p-6 md:p-8 border-b border-outline-variant bg-surface-container-high/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-2xl">person</span>
                </div>
                <div>
                  <p className="text-base font-bold text-white uppercase tracking-tight">
                    {selectedConv.visitorId.startsWith('anon-') ? `Guest ${selectedConv.visitorId.slice(-4)}` : selectedConv.visitorId}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                    <p className="text-[9px] text-tertiary font-bold uppercase tracking-widest">Active Session</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                  {selectedConv.leadId && (
                      <button className="btn-secondary py-3 px-6 text-[10px] font-bold uppercase tracking-widest rounded-xl">View Lead Profile</button>
                  )}
                  <button className="w-12 h-12 flex items-center justify-center bg-surface-container border border-outline-variant rounded-xl text-on-surface-variant hover:text-white transition-all">
                      <span className="material-symbols-outlined">more_vert</span>
                  </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
              <div className="flex justify-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 bg-surface-container/30 px-4 py-2 rounded-full border border-outline-variant/10">
                    Session Started: {new Date(selectedConv.startedAt).toLocaleString()}
                </span>
              </div>
              
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[75%] p-6 rounded-3xl text-sm leading-relaxed relative ${
                    msg.role === 'assistant' 
                    ? 'bg-surface-container text-white border border-outline-variant shadow-lg' 
                    : 'bg-secondary text-on-secondary-fixed shadow-xl shadow-secondary/10'
                  }`}>
                    {msg.content}
                    <div className={`flex items-center gap-2 mt-3 opacity-30 ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                        <span className="text-[8px] font-bold uppercase tracking-widest">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.role === 'assistant' && (
                             <span className="material-symbols-outlined text-[10px]">smart_toy</span>
                        )}
                    </div>
                  </div>
                </div>
              ))}

              {selectedConv.status === 'lead_captured' && (
                   <div className="flex justify-center py-4">
                       <div className="bg-tertiary/10 border border-tertiary/20 rounded-2xl px-6 py-4 flex items-center gap-3 animate-bounce shadow-lg shadow-tertiary/5">
                           <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                           <span className="text-[10px] font-black text-tertiary uppercase tracking-widest">Lead Captured via AI Chat</span>
                       </div>
                   </div>
              )}
            </div>

            <div className="p-8 border-t border-outline-variant bg-surface-container-high/30">
              <div className="bg-surface-container border border-outline-variant rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest italic">Monitoring enabled. AI is handling this guest.</span>
                  <button className="ml-auto btn-primary py-3 px-8 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl shadow-lg shadow-secondary/20">Take Over Chat</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center border-2 border-dashed border-outline-variant opacity-20">
                  <span className="material-symbols-outlined text-5xl">chat_bubble</span>
              </div>
              <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white uppercase tracking-tighter">No Conversation Selected</h4>
                  <p className="text-xs text-on-surface-variant max-w-xs mx-auto">Select a chat from the left panel to view the live transcript and AI interactions.</p>
              </div>
          </div>
        )}
        
        {/* Background Decorative Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
}
