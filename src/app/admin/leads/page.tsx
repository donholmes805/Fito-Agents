"use client";

import { useEffect, useState } from "react";
import { leadService, businessService } from "@/services";
import { Lead, Business } from "@/types";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsData, bizData] = await Promise.all([
        leadService.getLeadsForAdmin(),
        businessService.getBusinessesForAdmin()
      ]);
      setLeads(leadsData);
      setBusinesses(bizData);
    } catch (err) {
      console.error("Failed to load admin leads:", err);
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
        <h2 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">Global Lead Monitoring</h2>
        <div className="bg-surface-container-high px-6 py-2 rounded-xl border border-outline-variant">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total System Leads: </span>
            <span className="text-sm font-black text-secondary">{leads.length}</span>
        </div>
      </div>

      <div className="glass-panel rounded-[2.5rem] overflow-hidden rim-light shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Business</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Lead Info</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Source</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {leads.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-on-surface-variant italic">No leads found in the system.</td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const biz = businesses.find(b => b.id === lead.businessId);
                  return (
                    <tr key={lead.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white uppercase tracking-tight">{biz?.name || 'Unknown'}</span>
                            <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">ID: {lead.businessId.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-white">{lead.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{lead.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                          lead.status === 'new' ? 'bg-error/10 text-error' :
                          lead.status === 'contacted' ? 'bg-secondary/10 text-secondary' :
                          lead.status === 'won' ? 'bg-tertiary/10 text-tertiary' :
                          'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant px-2 py-1 rounded-lg">
                            {lead.source}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[10px] font-bold text-on-surface-variant">
                            {new Date(lead.createdAt).toLocaleDateString()}
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
