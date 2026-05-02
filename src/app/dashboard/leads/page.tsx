"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { leadService, agentService } from "@/services";
import { Lead, Agent } from "@/types";

const statuses = ["all", "new", "contacted", "won", "lost", "archived"];

export default function LeadsInboxPage() {
  const { businessId } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, agentsData] = await Promise.all([
        leadService.getLeadsByBusiness(businessId!),
        agentService.getAgentsByBusinessId(businessId!)
      ]);
      setLeads(leadsData);
      setAgents(agentsData);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, status: Lead["status"]) => {
      try {
          await leadService.updateLeadStatus(leadId, status);
          setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l));
      } catch (err) {
          console.error("Failed to update lead status:", err);
      }
  };

  const filteredLeads = leads
    .filter(lead => filterStatus === "all" || lead.status === filterStatus)
    .filter(lead => 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.serviceRequested?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
      return (
          <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex bg-surface-container-high p-1 rounded-2xl border border-outline-variant overflow-x-auto scrollbar-hide">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filterStatus === status ? "bg-secondary text-white shadow-lg" : "text-on-surface-variant hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
             <div className="relative flex-1 lg:min-w-[300px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant rounded-xl pl-12 pr-6 py-3 text-xs text-white focus:outline-none focus:border-secondary font-bold"
                />
            </div>
            <button className="btn-secondary p-3 rounded-xl">
                <span className="material-symbols-outlined text-sm">download</span>
            </button>
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] overflow-hidden rim-light shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Lead Identity</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Contact / Agent</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Inquiry</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredLeads.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-30">
                              <span className="material-symbols-outlined text-5xl">person_add_disabled</span>
                              <p className="text-xs font-bold uppercase tracking-widest">No leads found in this category</p>
                          </div>
                      </td>
                  </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center text-secondary text-sm font-black font-heading uppercase">
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white uppercase tracking-tight">{lead.name}</span>
                            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-white">{lead.email}</p>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[10px] text-on-surface-variant">smart_toy</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                                    {agents.find(a => a.id === lead.agentId)?.name || 'Unknown Agent'}
                                </span>
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="max-w-[200px]">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{lead.serviceRequested || 'General Inquiry'}</p>
                            <p className="text-xs text-on-surface-variant line-clamp-1 italic">"{lead.message || 'No message provided'}"</p>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <select 
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter cursor-pointer border appearance-none text-center focus:outline-none transition-all ${
                          lead.status === 'new' ? 'bg-error/10 border-error/20 text-error' :
                          lead.status === 'contacted' ? 'bg-secondary/10 border-secondary/20 text-secondary' :
                          lead.status === 'won' ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' :
                          'bg-surface-variant/20 border-outline-variant text-on-surface-variant'
                        }`}
                      >
                          {statuses.filter(s => s !== 'all').map(s => (
                              <option key={s} value={s} className="bg-surface-container-high text-white">{s}</option>
                          ))}
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-10 h-10 flex items-center justify-center bg-surface-container border border-outline-variant rounded-xl text-on-surface-variant hover:text-white transition-all">
                          <span className="material-symbols-outlined text-lg">forum</span>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center bg-surface-container border border-outline-variant rounded-xl text-on-surface-variant hover:text-error transition-all">
                          <span className="material-symbols-outlined text-lg">archive</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
