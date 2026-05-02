"use client";

import { useEffect, useState } from "react";
import { conversationService, businessService } from "@/services";
import { Conversation, Business } from "@/types";

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [convsData, bizData] = await Promise.all([
        conversationService.getConversationsForAdmin(),
        businessService.getBusinessesForAdmin()
      ]);
      setConversations(convsData);
      setBusinesses(bizData);
    } catch (err) {
      console.error("Failed to load admin conversations:", err);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">Global Chat Activity</h2>
        <div className="bg-surface-container-high px-6 py-2 rounded-xl border border-outline-variant">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Active Chats: </span>
            <span className="text-sm font-black text-tertiary">{conversations.length}</span>
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] overflow-hidden rim-light shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Business Context</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Visitor / Session</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {conversations.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-on-surface-variant italic">No chat sessions found in the system.</td>
                </tr>
              ) : (
                conversations.map((conv) => {
                  const biz = businesses.find(b => b.id === conv.businessId);
                  return (
                    <tr key={conv.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white uppercase tracking-tight">{biz?.name || 'Unknown'}</span>
                            <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">Agent ID: {conv.agentId.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-xs text-on-surface-variant">person</span>
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-widest">{conv.visitorId}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                          conv.status === 'open' ? 'bg-tertiary/10 text-tertiary' :
                          conv.status === 'lead_captured' ? 'bg-secondary/10 text-secondary' :
                          'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {conv.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[10px] font-bold text-on-surface-variant">
                            {new Date(conv.lastMessageAt).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
