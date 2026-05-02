"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { businessService, agentService, knowledgeBaseService } from "@/services";
import { StatCard } from "@/components/ui/StatCard";
import { Business, Agent } from "@/types";
import Link from "next/link";

export default function DashboardOverview() {
  const { businessId } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [kbCount, setKbCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadDashboardData();
    }
  }, [businessId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [bizData, agentsData, kbData] = await Promise.all([
        businessService.getBusinessById(businessId!),
        agentService.getAgentsByBusinessId(businessId!),
        knowledgeBaseService.getKnowledgeItemsByBusiness(businessId!)
      ]);
      setBusiness(bizData);
      setAgents(agentsData);
      setKbCount(kbData.length);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !business) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-surface-container rounded-2xl"></div>
              ))}
          </div>
      );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard title="Total Conversations" value="0" change="0" icon="forum" trend="none" />
        <StatCard title="New Leads" value="0" change="0" icon="person_add" trend="none" />
        <StatCard title="Messages Used" value="0" change="0%" icon="chat_bubble" trend="none" limit={`/ ${business?.plan === 'starter' ? '500' : '10,000'}`} />
        <StatCard title="Active Agents" value={agents.length.toString()} change="0" icon="smart_toy" trend="none" />
        <StatCard title="Conversion Rate" value="0%" change="0%" icon="trending_up" trend="none" />
        <StatCard title="Current Plan" value={business?.plan || "Starter"} change="Free" icon="payments" trend="none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Card */}
          <div className="glass-panel rounded-3xl p-8 rim-light bg-gradient-to-br from-secondary/10 to-transparent flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">
                Welcome back, {business?.name || "Business Owner"}!
              </h2>
              <p className="text-on-surface-variant max-w-lg">
                Your AI agents are standing by. You have {agents.length} active agent{agents.length !== 1 ? 's' : ''} currently helping your visitors.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                <Link href="/dashboard/agent-builder" className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">add</span> Create New Agent
                </Link>
                <Link href="/dashboard/embed" className="px-6 py-3 rounded-xl border border-outline-variant text-[10px] font-bold uppercase tracking-widest text-white hover:bg-surface-container transition-all">
                  Get Embed Code
                </Link>
              </div>
            </div>
            <div className="w-48 h-48 bg-surface-container rounded-full flex items-center justify-center border-4 border-outline-variant relative">
                <span className="material-symbols-outlined text-6xl text-secondary animate-pulse">smart_toy</span>
                <div className="absolute -bottom-2 -right-2 bg-tertiary text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-4 border-[#0b0f10]">Online</div>
            </div>
          </div>

          {/* Recent Conversations Placeholder */}
          <div className="glass-panel rounded-3xl p-8 rim-light">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">Recent Conversations</h3>
                <p className="text-xs text-on-surface-variant mt-1">Real-time interaction log from your agents.</p>
              </div>
              <Link href="/dashboard/conversations" className="text-secondary text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>
            </div>
            
            <div className="bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant p-12 text-center">
                <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest">No conversations yet</p>
                <p className="text-xs text-on-surface-variant/50 mt-2">Deploy your agent to start seeing conversations here.</p>
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-8">
          {/* Quick Setup Checklist */}
          <div className="glass-panel rounded-3xl p-8 rim-light border-secondary/30">
            <h3 className="font-heading text-lg font-bold text-white uppercase tracking-tighter mb-6">Setup Checklist</h3>
            <div className="space-y-6">
                {[
                    { label: "Business Profile", done: true },
                    { label: "Create AI Agent", done: agents.length > 0 },
                    { label: "Add Knowledge Base", done: kbCount > 0 },
                    { label: "Install Embed Script", done: false },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.done ? "bg-secondary text-white" : "bg-surface-container border border-outline-variant text-on-surface-variant"}`}>
                            {item.done && <span className="material-symbols-outlined text-sm">check</span>}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${item.done ? "text-white line-through opacity-50" : "text-on-surface-variant"}`}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
          </div>

          {/* Business Goal Status */}
          <div className="glass-panel rounded-3xl p-8 rim-light border-tertiary/30">
            <h3 className="font-heading text-lg font-bold text-white uppercase tracking-tighter mb-2">Lead Goal</h3>
            <p className="text-xs text-on-surface-variant mb-6">Capture leads and grow your business with AI.</p>
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-on-surface-variant">Monthly Target</span>
                    <span className="text-white">0 / 50</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary w-[0%]"></div>
                </div>
            </div>
          </div>

          {/* Support Ticket */}
          <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">help</span>
             </div>
             <h4 className="text-sm font-bold text-white mb-2">Need help?</h4>
             <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">Our team is ready to help you optimize your AI agents for maximum performance.</p>
             <button className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-secondary hover:text-white transition-all">
                Contact Support
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
