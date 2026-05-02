"use client";

import { useEffect, useState } from "react";
import { businessService } from "@/services";
import { Business } from "@/types";

export default function AdminCustomersPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await businessService.getBusinessesForAdmin();
      setBusinesses(data);
    } catch (err) {
      console.error("Failed to load admin businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOverride = async (biz: Business) => {
    const newStatus = !biz.ownerOverride;
    try {
        await businessService.updateBusinessAdmin(biz.id, { 
            ownerOverride: newStatus,
            subscriptionStatus: newStatus ? "owner_override" : "trial"
        });
        setBusinesses(prev => prev.map(b => b.id === biz.id ? { ...b, ownerOverride: newStatus, subscriptionStatus: newStatus ? "owner_override" : "trial" } : b));
    } catch (err) {
        alert("Failed to update override status");
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
            <h3 className="font-heading text-2xl font-black text-white uppercase tracking-tighter">Customer Management</h3>
            <p className="text-on-surface-variant text-sm mt-1">Total {businesses.length} businesses registered.</p>
        </div>
        <button className="btn-secondary px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
            Export CSV
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden rim-light shadow-2xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Business</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Owner Email</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Plan</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Admin Controls</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
                {businesses.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-on-surface-variant font-bold uppercase tracking-widest opacity-30">
                            No businesses found
                        </td>
                    </tr>
                ) : (
                    businesses.map((biz) => (
                    <tr key={biz.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-8 py-6">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white uppercase tracking-tight">{biz.name}</span>
                                <span className="text-[10px] text-on-surface-variant font-mono">{biz.website}</span>
                            </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-on-surface-variant font-bold">{biz.email}</td>
                        <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${
                                biz.plan === 'business' || biz.plan === 'advanced' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-surface-container border-outline-variant text-on-surface-variant'
                            }`}>
                                {biz.plan}
                            </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
                                biz.subscriptionStatus === 'active' || biz.subscriptionStatus === 'owner_override'
                                ? 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                                : 'bg-surface-container border-outline-variant text-on-surface-variant'
                            }`}>
                                {biz.subscriptionStatus || 'Trial'}
                            </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex justify-end items-center gap-4">
                                <button 
                                    onClick={() => toggleOverride(biz)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        biz.ownerOverride 
                                        ? 'bg-tertiary text-on-tertiary border-tertiary' 
                                        : 'bg-surface-container border-outline-variant text-on-surface-variant hover:text-white'
                                    }`}
                                >
                                    {biz.ownerOverride ? 'Override On' : 'Grant Override'}
                                </button>
                                <button className="p-2 bg-surface-container border border-outline-variant rounded-xl text-on-surface-variant hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-sm">settings</span>
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
