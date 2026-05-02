"use client";

import { useEffect, useState } from "react";
import { businessService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { Business } from "@/types";
import { getPlanConfig } from "@/config/plans";

export default function AdminUsagePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    setLoading(true);
    try {
      const data = await businessService.getBusinessesForAdmin();
      setBusinesses(data);
    } catch (err) {
      console.error("Failed to load admin usage data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualReset = async (businessId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to manually reset usage for this business? This will reset all active agents for this business to 0 messages used.")) return;

    setResetting(businessId);
    try {
      const response = await fetch("/api/admin/usage/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, actorId: user.uid })
      });

      if (response.ok) {
        alert("Usage reset successfully!");
        loadUsageData();
      } else {
        const error = await response.json();
        alert(`Failed to reset usage: ${error.error}`);
      }
    } catch (err) {
      console.error("Reset error:", err);
      alert("An error occurred while resetting usage.");
    } finally {
      setResetting(null);
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
      <div>
        <h3 className="font-heading text-2xl font-black text-white uppercase tracking-tighter">Usage Monitoring</h3>
        <p className="text-on-surface-variant text-sm mt-1">Monitor real-time AI usage across all business accounts.</p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden rim-light">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Business</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Plan Limits</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Usage</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Reset Timeline</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {businesses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-on-surface-variant font-bold uppercase tracking-widest opacity-30">
                    No active usage data found
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => {
                  const planConfig = getPlanConfig(biz.plan || 'starter');
                  const used = biz.monthlyMessagesUsed || 0;
                  const limit = planConfig.monthlyMessageLimit;
                  const percent = Math.min(Math.round((used / limit) * 100), 100);

                  return (
                    <tr key={biz.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white uppercase tracking-tight">{biz.name}</span>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{biz.subscriptionStatus}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{limit.toLocaleString()}</span>
                            <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">Messages/Mo</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-[140px] mx-auto">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                            <span className={percent > 90 ? 'text-error' : 'text-secondary'}>{used.toLocaleString()} used</span>
                            <span className="text-on-surface-variant">{percent}%</span>
                          </div>
                          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden rim-light">
                            <div 
                              className={`h-full transition-all duration-1000 ${percent > 90 ? 'bg-error shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-secondary'}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest w-12">Next:</span>
                            <span className="text-[10px] font-bold text-white">
                                {biz.nextUsageResetAt ? new Date(biz.nextUsageResetAt).toLocaleDateString() : 'Manual Only'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest w-12">Last:</span>
                            <span className="text-[10px] font-bold text-on-surface-variant">
                                {biz.lastUsageResetAt ? new Date(biz.lastUsageResetAt).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleManualReset(biz.id)}
                          disabled={resetting === biz.id}
                          className={`btn-secondary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                            resetting === biz.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary hover:text-on-secondary border-secondary/20'
                          }`}
                        >
                          {resetting === biz.id ? 'Resetting...' : 'Manual Reset'}
                        </button>
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
