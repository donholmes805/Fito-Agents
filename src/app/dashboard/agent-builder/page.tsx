"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBusiness } from "@/context/BusinessContext";
import { agentService } from "@/services";
import { Agent, Message } from "@/types";
import { getPlanConfig } from "@/config/plans";
import Link from "next/link";

export default function AgentBuilderPage() {
  const { businessId, isOwner, isAdmin } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [formData, setFormData] = useState<Partial<Agent>>({
    name: "",
    type: "website",
    greeting: "Hello! How can I help you today?",
    tone: "professional",
    businessGoal: "",
    brandColor: "#2563eb",
    widgetPosition: "bottom-right",
    leadCaptureEnabled: true,
  });

  // Test Chat State
  const [testMessages, setTestMessages] = useState<Message[]>([]);
  const [testInput, setTestInput] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testConversationId, setTestConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (businessId) {
      loadAgents();
    } else if (!businessLoading) {
      setLoading(false);
    }
  }, [businessId, businessLoading]);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [testMessages, testSending]);

  const loadAgents = async () => {
    if (!businessId) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const agentsData = await agentService.getAgentsByBusinessId(businessId);
      setAgents(agentsData);

      if (business) {
        const limits = getPlanConfig(business.plan);
        setLimitReached(agentsData.length >= limits.maxAgents);
      }

      if (agentsData.length > 0 && !selectedAgent) {
        setSelectedAgent(agentsData[0]);
      }
    } catch (err: any) {
      console.error("Failed to load agents:", err);
      setError("Failed to load your agents. Please try again or check your Firestore rules.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    if (limitReached && !business?.ownerOverride) {
        alert("You have reached the maximum number of agents for your current plan. Please upgrade to create more.");
        return;
    }
    setFormData({
      name: "",
      type: "website",
      greeting: "Hello! How can I help you today?",
      tone: "professional",
      businessGoal: "",
      brandColor: "#2563eb",
      widgetPosition: "bottom-right",
      leadCaptureEnabled: true,
    });
    setIsCreating(true);
    setIsEditing(true);
    setSelectedAgent(null);
    setTestMessages([]);
    setTestConversationId(null);
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData(agent);
    setIsEditing(true);
    setIsCreating(false);
    
    // Initialize test chat with greeting
    setTestMessages([{
        id: 'initial',
        conversationId: '',
        businessId: businessId!,
        agentId: agent.id,
        role: 'assistant',
        content: agent.greeting,
        createdAt: new Date().toISOString()
    }]);
    setTestConversationId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    setLoading(true);
    try {
      if (isCreating) {
        const newAgent = await agentService.createAgent(businessId, formData);
        setAgents([newAgent, ...agents]);
        setSelectedAgent(newAgent);
      } else if (selectedAgent) {
        await agentService.updateAgent(selectedAgent.id, formData);
        setAgents(agents.map(a => a.id === selectedAgent.id ? { ...a, ...formData } : a));
      }
      setIsEditing(false);
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to save agent:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (agentId: string) => {
    if (confirm("Are you sure you want to archive this agent?")) {
      try {
        await agentService.archiveAgent(agentId);
        setAgents(agents.map(a => a.id === agentId ? { ...a, status: "draft" } : a));
      } catch (err) {
        console.error("Failed to archive agent:", err);
      }
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!testInput.trim() || !businessId || !selectedAgent || testSending) return;

      const userMsg = testInput.trim();
      setTestInput("");
      setTestSending(true);

      const visitorMsg: Message = {
          id: Date.now().toString(),
          conversationId: testConversationId || '',
          businessId,
          agentId: selectedAgent.id,
          role: 'visitor',
          content: userMsg,
          createdAt: new Date().toISOString()
      };
      setTestMessages(prev => [...prev, visitorMsg]);

      try {
          const response = await fetch("/api/agents/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  businessId,
                  agentId: selectedAgent.id,
                  conversationId: testConversationId,
                  visitorId: "dashboard-tester",
                  message: userMsg,
                  source: "dashboard_preview"
              })
          });

          const data = await response.json();
          if (response.ok) {
              setTestConversationId(data.conversationId);
              const assistantMsg: Message = {
                  id: Date.now().toString() + "-ai",
                  conversationId: data.conversationId,
                  businessId,
                  agentId: selectedAgent.id,
                  role: "assistant",
                  content: data.content,
                  createdAt: new Date().toISOString()
              };
              setTestMessages(prev => [...prev, assistantMsg]);
          }
      } catch (err) {
          console.error("Test chat failed:", err);
      } finally {
          setTestSending(false);
      }
  };

  if (loading || businessLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Synchronizing Agent Data...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="bg-error/10 border border-error/20 rounded-3xl p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto text-error">
                <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Data Loading Error</h3>
                <p className="text-on-surface-variant max-w-sm mx-auto">{error}</p>
            </div>
            <button 
              onClick={() => loadAgents()}
              className="btn-primary px-10 py-4 rounded-2xl mx-auto"
            >
                Try Again
            </button>
        </div>
    );
  }

  if (!businessId) {
      return (
        <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-3xl p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">business</span>
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">No Business Profile Connected</h3>
                <p className="text-on-surface-variant max-w-sm mx-auto">You need to create or select a business before creating an AI agent.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/onboarding/business" className="btn-primary px-8 py-4 rounded-2xl">
                    Create Business Profile
                </Link>
                {(isAdmin || isOwner) && (
                    <Link href="/admin" className="px-8 py-4 rounded-2xl bg-surface-container text-white font-bold text-sm hover:bg-surface-container-high transition-all">
                        Go to Admin Dashboard
                    </Link>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">Agent Builder</h1>
          <p className="text-on-surface-variant text-sm">Create and customize your AI website assistants.</p>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-4">
            {limitReached && !business?.ownerOverride && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-xl">
                    <span className="material-symbols-outlined text-secondary text-sm">warning</span>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Plan Limit Reached</span>
                </div>
            )}
            <button 
                onClick={handleCreateNew}
                className={`btn-primary px-6 py-3 rounded-xl flex items-center gap-2 ${limitReached && !business?.ownerOverride ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
                <span className="material-symbols-outlined">add</span> Create New Agent
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.length === 0 ? (
            <div className="col-span-full bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-3xl p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">smart_toy</span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">No Agents Yet</h3>
                    <p className="text-on-surface-variant max-w-sm mx-auto">Create your first AI agent to start engaging with your website visitors and capturing leads.</p>
                </div>
                <button 
                  onClick={handleCreateNew}
                  className="btn-primary px-10 py-4 rounded-2xl mx-auto"
                >
                    Create Your First Agent
                </button>
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 hover:border-secondary/50 transition-all group shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: agent.brandColor + '20', color: agent.brandColor }}>
                    <span className="material-symbols-outlined">{agent.type === 'website' ? 'globe' : 'smart_toy'}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    agent.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {agent.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{agent.name}</h3>
                <p className="text-xs text-on-surface-variant mb-6 line-clamp-2">{agent.businessGoal || "No goal specified."}</p>
                
                <div className="flex items-center gap-2 pt-6 border-t border-outline-variant">
                  <button 
                    onClick={() => handleEdit(agent)}
                    className="flex-1 py-3 rounded-xl bg-surface-container text-[10px] font-bold uppercase tracking-widest text-white hover:bg-secondary/20 hover:text-secondary transition-all"
                  >
                    Configure
                  </button>
                  <button 
                    onClick={() => handleArchive(agent.id)}
                    className="p-3 rounded-xl bg-surface-container text-on-surface-variant hover:text-error transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">archive</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 space-y-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-tighter">
                    {isCreating ? "Create New Agent" : `Editing: ${selectedAgent?.name}`}
                </h2>
                <button type="button" onClick={() => setIsEditing(false)} className="text-on-surface-variant hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Agent Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Website Assistant"
                    className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Agent Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all font-bold appearance-none"
                  >
                    <option value="website">Website Chatbot</option>
                    <option value="support">Customer Support</option>
                    <option value="sales">Sales & Lead Gen</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Greeting Message</label>
                <input
                  type="text"
                  value={formData.greeting}
                  onChange={(e) => setFormData({...formData, greeting: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Tone & Personality</label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all font-bold appearance-none"
                >
                  <option value="professional">Professional & Helpful</option>
                  <option value="friendly">Friendly & Casual</option>
                  <option value="bold">Bold & Energetic</option>
                  <option value="luxury">Luxury & Sophisticated</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Main Business Goal</label>
                <textarea
                  value={formData.businessGoal}
                  onChange={(e) => setFormData({...formData, businessGoal: e.target.value})}
                  rows={4}
                  placeholder="e.g. Answer questions about my services and capture email leads for follow-up."
                  className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white focus:border-secondary outline-none transition-all font-bold resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Brand Accent Color</label>
                    <div className="flex gap-4 items-center">
                        <input
                            type="color"
                            value={formData.brandColor}
                            onChange={(e) => setFormData({...formData, brandColor: e.target.value})}
                            className="w-14 h-14 bg-surface-container border border-outline-variant rounded-xl cursor-pointer overflow-hidden p-0"
                        />
                        <input
                            type="text"
                            value={formData.brandColor}
                            onChange={(e) => setFormData({...formData, brandColor: e.target.value})}
                            className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-4 py-3 text-white text-xs font-mono"
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Widget Position</label>
                    <div className="flex gap-2">
                        {['bottom-left', 'bottom-right'].map((pos) => (
                            <button
                                key={pos}
                                type="button"
                                onClick={() => setFormData({...formData, widgetPosition: pos as any})}
                                className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    formData.widgetPosition === pos ? "bg-secondary/10 border-secondary text-secondary" : "bg-surface-container border-outline-variant text-on-surface-variant"
                                }`}
                            >
                                {pos.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                  </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant">
                  <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary">person_add</span>
                      <div>
                          <p className="text-sm font-bold text-white">Lead Capture</p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Ask for contact info automatically</p>
                      </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, leadCaptureEnabled: !formData.leadCaptureEnabled})}
                    className={`w-12 h-6 rounded-full relative transition-all ${formData.leadCaptureEnabled ? "bg-secondary" : "bg-surface-container-high"}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.leadCaptureEnabled ? "right-1" : "left-1"}`}></div>
                  </button>
              </div>

              <div className="flex gap-4 pt-6 border-t border-outline-variant">
                <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-2xl bg-surface-container border border-outline-variant text-white font-bold uppercase tracking-widest text-[10px] hover:bg-surface-container-high transition-all"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>{isCreating ? "Create Agent" : "Save Changes"}</>
                    )}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-xl border border-outline-variant rounded-3xl p-8 sticky top-24 h-[600px] flex flex-col">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-secondary">visibility</span> Live Test Chat
                </h3>
                
                <div className="flex-1 bg-surface-container rounded-2xl border border-outline-variant overflow-hidden flex flex-col">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        {testMessages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-40">
                                <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Test your agent here</p>
                            </div>
                        ) : (
                            testMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[90%] p-3 rounded-xl text-xs ${
                                        msg.role === 'assistant' ? 'bg-surface-container-high text-white border border-outline-variant' : 'bg-secondary text-white'
                                    }`}
                                    style={msg.role === 'visitor' ? { backgroundColor: formData.brandColor } : {}}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {testSending && (
                            <div className="flex justify-start">
                                <div className="bg-surface-container-high p-2 rounded-xl border border-outline-variant flex gap-1">
                                    <span className="w-1 h-1 bg-secondary rounded-full animate-bounce"></span>
                                    <span className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1 h-1 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <form onSubmit={handleTestSend} className="p-3 bg-surface-container-high border-t border-outline-variant relative">
                        <input 
                            type="text"
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            disabled={testSending || isCreating}
                            placeholder={isCreating ? "Save to start testing" : "Type to test..."}
                            className="w-full bg-surface-container border border-outline-variant rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:outline-none focus:border-secondary disabled:opacity-50"
                        />
                        <button 
                            type="submit"
                            disabled={testSending || !testInput.trim() || isCreating}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                    </form>
                </div>
                
                <div className="mt-6">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Changes must be saved before testing.</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
