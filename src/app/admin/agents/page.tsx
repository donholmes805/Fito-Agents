"use client";

import { useEffect, useState } from "react";
import { agentService } from "@/services";
import { Agent } from "@/types";

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await agentService.getAgentsForAdmin();
      setAgents(data);
    } catch (err) {
      console.error("Failed to load admin agents:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
            <h3 className="font-heading text-2xl font-black text-white uppercase tracking-tighter">System-Wide Agents</h3>
            <p className="text-on-surface-variant text-sm mt-1">Monitoring {agents.length} active AI workers across all businesses.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-surface-container border border-outline-variant px-4 py-2 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
                <input 
                    type="text" 
                    placeholder="Search by name..." 
                    className="bg-transparent border-none outline-none text-xs text-white placeholder:text-on-surface-variant/30 font-bold"
                />
            </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden rim-light shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Agent Name</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Business ID</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Usage</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
                {agents.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-on-surface-variant font-bold uppercase tracking-widest opacity-30">
                            No agents found in system
                        </td>
                    </tr>
                ) : (
                    agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                    style={{ backgroundColor: agent.brandColor }}
                                >
                                    <span className="material-symbols-outlined text-xl">smart_toy</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">{agent.name}</span>
                                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{agent.type}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-[10px] text-on-surface-variant font-mono uppercase">{agent.businessId}</td>
                        <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-white">{agent.monthlyMessagesUsed || 0}</span>
                                <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">Messages</span>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                agent.status === 'active' ? 'bg-tertiary/10 text-tertiary' : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                            }`}>
                                {agent.status}
                            </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="px-4 py-2 bg-surface-container border border-outline-variant rounded-xl text-[10px] font-bold text-on-surface-variant hover:text-white uppercase transition-all">
                                Config
                            </button>
                            <button className="px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-xl text-[10px] font-bold text-secondary hover:bg-secondary/20 uppercase transition-all">
                                Logs
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
