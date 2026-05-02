"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { knowledgeBaseService, agentService, businessService } from "@/services";
import { KnowledgeItem, Agent, Business } from "@/types";
import { getPlanConfig } from "@/config/plans";
import Link from "next/link";

const categories = [
  { id: "faq", label: "FAQs", icon: "quiz" },
  { id: "service", label: "Services", icon: "settings_suggest" },
  { id: "pricing", label: "Pricing", icon: "payments" },
  { id: "policy", label: "Policies", icon: "policy" },
  { id: "link", label: "Links", icon: "link" },
  { id: "document", label: "Documents", icon: "description" },
];

export default function KnowledgeBasePage() {
  const { businessId, isTeamMember } = useAuth();
  const [activeTab, setActiveTab] = useState<KnowledgeItem["type"]>("faq");
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<KnowledgeItem>>({
    type: "faq",
    title: "",
    content: "",
    agentId: "all",
    status: "active",
    question: "",
    answer: "",
    serviceName: "",
    startingPrice: "",
    itemName: "",
    price: "",
    policyName: "",
    policyText: "",
    label: "",
    url: "",
  });

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, agentsData, bizData] = await Promise.all([
        knowledgeBaseService.getKnowledgeItemsByBusiness(businessId!),
        agentService.getAgentsByBusinessId(businessId!),
        businessService.getBusinessById(businessId!)
      ]);
      setItems(itemsData);
      setAgents(agentsData);
      setBusiness(bizData);

      if (bizData) {
        const limits = getPlanConfig(bizData.plan);
        setLimitReached(itemsData.length >= limits.knowledgeItemsLimit);
      }
    } catch (err) {
      console.error("Failed to load knowledge base:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items
    .filter(item => item.type === activeTab)
    .filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleOpenModal = (item?: KnowledgeItem) => {
    if (isTeamMember) return;
    if (!item && limitReached && !business?.ownerOverride) {
        alert("You have reached the knowledge base limit for your current plan. Please upgrade to add more items.");
        return;
    }
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        type: activeTab,
        title: "",
        content: "",
        agentId: "all",
        status: "active",
        question: "",
        answer: "",
        serviceName: "",
        startingPrice: "",
        itemName: "",
        price: "",
        policyName: "",
        policyText: "",
        label: "",
        url: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || isTeamMember) return;

    try {
      // Sync title/content based on type if needed
      let finalData = { ...formData };
      if (formData.type === 'faq') {
          finalData.title = formData.question || "";
          finalData.content = formData.answer || "";
      } else if (formData.type === 'service') {
          finalData.title = formData.serviceName || "";
          finalData.content = formData.description || "";
      } else if (formData.type === 'pricing') {
          finalData.title = formData.itemName || "";
          finalData.content = `${formData.price} - ${formData.description}`;
      } else if (formData.type === 'policy') {
          finalData.title = formData.policyName || "";
          finalData.content = formData.policyText || "";
      } else if (formData.type === 'link') {
          finalData.title = formData.label || "";
          finalData.content = formData.url || "";
      }

      if (editingItem) {
        await knowledgeBaseService.updateKnowledgeItem(editingItem.id, finalData);
      } else {
        await knowledgeBaseService.createKnowledgeItem(businessId, finalData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Failed to save knowledge item:", err);
    }
  };

  const handleArchive = async (itemId: string) => {
      if (confirm("Are you sure you want to archive this item?")) {
          await knowledgeBaseService.archiveKnowledgeItem(itemId);
          loadData();
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (agents.length === 0) {
      return (
          <div className="max-w-4xl space-y-8">
              <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-[2.5rem] p-16 text-center space-y-8">
                  <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant">smart_toy</span>
                  </div>
                  <div className="space-y-4">
                      <h2 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">No Agents Found</h2>
                      <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
                          You need to create at least one AI agent before you can add business knowledge for them to learn.
                      </p>
                  </div>
                  <Link href="/dashboard/agent-builder" className="btn-primary px-10 py-5 rounded-2xl mx-auto flex items-center justify-center gap-3 w-fit">
                      Create Agent <span className="material-symbols-outlined">add</span>
                  </Link>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex bg-surface-container-high p-1 rounded-2xl border border-outline-variant overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as KnowledgeItem["type"])}
              className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === cat.id ? "bg-secondary text-white shadow-lg" : "text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
        {!isTeamMember && (
            <div className="flex items-center gap-4">
                {limitReached && !business?.ownerOverride && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-xl">
                        <span className="material-symbols-outlined text-secondary text-sm">warning</span>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Plan Limit Reached</span>
                    </div>
                )}
                <button 
                    onClick={() => handleOpenModal()}
                    className={`btn-primary flex items-center gap-3 justify-center px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] ${limitReached && !business?.ownerOverride ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                <span className="material-symbols-outlined text-lg">add</span> Add {activeTab === 'faq' ? 'FAQ' : activeTab}
                </button>
            </div>
        )}
      </div>

      <div className="glass-panel rounded-[2.5rem] p-8 rim-light shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} items...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-secondary font-bold placeholder:text-on-surface-variant/30"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
            <div className="py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto border border-outline-variant">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-20">inventory_2</span>
                </div>
                <div>
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm">No {activeTab}s Found</h4>
                    <p className="text-xs text-on-surface-variant mt-2">Start building your agent's brain by adding your first {activeTab}.</p>
                </div>
                {!isTeamMember && (
                    <button onClick={() => handleOpenModal()} className="btn-secondary px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                        Create Now
                    </button>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
                <div 
                    key={item.id} 
                    className="group p-8 bg-surface-container border border-outline-variant rounded-[2rem] hover:border-secondary transition-all relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                                item.status === 'active' ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-variant text-on-surface-variant'
                            }`}>
                                {item.status}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50">
                                {item.agentId === 'all' ? 'All Agents' : agents.find(a => a.id === item.agentId)?.name || 'Unknown'}
                            </span>
                        </div>
                        {!isTeamMember && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(item)} className="p-2 hover:text-secondary text-on-surface-variant">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button onClick={() => handleArchive(item.id)} className="p-2 hover:text-error text-on-surface-variant">
                                    <span className="material-symbols-outlined text-lg">archive</span>
                                </button>
                            </div>
                        )}
                    </div>
                    <h4 className="font-heading text-white font-bold text-lg mb-3 tracking-tight uppercase">{item.title}</h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">{item.content}</p>
                    
                    <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">
                            {categories.find(c => c.id === item.type)?.icon}
                        </span>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              <div className="glass-panel w-full max-w-2xl rounded-[2.5rem] p-10 rim-light shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                  <h3 className="text-2xl font-black text-white font-heading uppercase tracking-tighter mb-8">
                      {editingItem ? 'Edit' : 'Add'} {activeTab === 'faq' ? 'FAQ' : activeTab}
                  </h3>

                  <form onSubmit={handleSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Assign to Agent</label>
                              <select 
                                value={formData.agentId}
                                onChange={(e) => setFormData({...formData, agentId: e.target.value})}
                                className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white font-bold text-xs"
                              >
                                  <option value="all">All Agents</option>
                                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                              </select>
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Status</label>
                              <select 
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                                className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white font-bold text-xs"
                              >
                                  <option value="active">Active</option>
                                  <option value="draft">Draft</option>
                                  <option value="needs_review">Needs Review</option>
                              </select>
                          </div>
                      </div>

                      {activeTab === 'faq' && (
                          <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Question</label>
                                <input 
                                    required
                                    type="text"
                                    value={formData.question}
                                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                                    className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Answer</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={formData.answer}
                                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                                    className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white font-bold resize-none"
                                />
                            </div>
                          </>
                      )}

                      {activeTab === 'service' && (
                          <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Service Name</label>
                                <input 
                                    required
                                    type="text"
                                    value={formData.serviceName}
                                    onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                                    className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Description</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-white font-bold resize-none"
                                />
                            </div>
                          </>
                      )}

                      {/* Other tabs follow similar pattern - keeping it clean for brevity */}
                      {(activeTab === 'pricing' || activeTab === 'policy' || activeTab === 'link' || activeTab === 'document') && (
                          <div className="p-8 bg-surface-container border-2 border-dashed border-outline-variant rounded-3xl text-center">
                              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Type form for {activeTab} coming in sub-phase</p>
                              <p className="text-[10px] text-on-surface-variant/50 mt-2">Use FAQ or Service for now to test knowledge base persistence.</p>
                          </div>
                      )}

                      <div className="flex justify-end gap-4 pt-6">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white">Cancel</button>
                          <button type="submit" className="btn-primary px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest">Save Knowledge</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
