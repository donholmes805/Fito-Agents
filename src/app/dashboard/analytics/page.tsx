"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import Link from "next/link";

const COLORS = ['#0356ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard() {
  const { user, userProfile, loading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'billing' | 'all'>('billing');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!userProfile?.businessId || !user) return;
      
      try {
        setIsLoadingData(true);
        const token = await user.getIdToken();
        const res = await fetch(`/api/analytics/business?businessId=${userProfile.businessId}&timeRange=${timeRange}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingData(false);
      }
    }

    if (!loading) {
      fetchAnalytics();
    }
  }, [userProfile, loading, timeRange]);

  if (loading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error/10 border border-error/20 rounded-2xl">
        <h3 className="text-error font-bold mb-2">Failed to load analytics</h3>
        <p className="text-on-surface-variant text-sm">{error}</p>
      </div>
    );
  }

  // Handle empty state
  if (!analytics || analytics.metrics.totalConversations === 0) {
      return (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-surface-container rounded-3xl border border-outline-variant max-w-2xl mx-auto mt-12">
            <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 border border-secondary/20 shadow-[0_0_30px_rgba(3,86,255,0.15)]">
                <span className="material-symbols-outlined text-4xl">bar_chart</span>
            </div>
            <h2 className="text-2xl font-black text-white font-heading tracking-tight mb-4">No Data Yet</h2>
            <p className="text-on-surface-variant mb-8 max-w-md">
                Your analytics will appear here once visitors start chatting with your AI agent. Install your agent to start collecting data!
            </p>
            <Link 
                href="/dashboard/embed"
                className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
            >
                Install Your Widget
            </Link>
          </div>
      );
  }

  const { metrics, charts, agentPerformance } = analytics;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white font-heading tracking-tight">Analytics</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track your AI agent performance and lead conversions</p>
        </div>
        
        <div className="flex items-center bg-surface-container p-1 rounded-xl border border-outline-variant">
            {(['7d', '30d', 'billing', 'all'] as const).map(range => (
                <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                        timeRange === range 
                            ? 'bg-secondary text-white shadow-md' 
                            : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                    }`}
                >
                    {range === 'billing' ? 'Billing Cycle' : range.replace('d', ' Days')}
                </button>
            ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all"></div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 relative z-10">Total Messages</p>
            <div className="flex items-baseline gap-2 relative z-10">
                <h3 className="text-3xl font-black text-white font-heading">{metrics.totalMessages.toLocaleString()}</h3>
            </div>
        </div>
        
        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 relative z-10">Conversations</p>
            <div className="flex items-baseline gap-2 relative z-10">
                <h3 className="text-3xl font-black text-white font-heading">{metrics.totalConversations.toLocaleString()}</h3>
            </div>
        </div>

        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 relative z-10">Total Leads</p>
            <div className="flex items-baseline gap-2 relative z-10">
                <h3 className="text-3xl font-black text-white font-heading">{metrics.totalLeads.toLocaleString()}</h3>
            </div>
        </div>

        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 relative z-10">Conversion</p>
            <div className="flex items-baseline gap-2 relative z-10">
                <h3 className="text-3xl font-black text-white font-heading">{metrics.conversionRate.toFixed(1)}%</h3>
            </div>
        </div>

        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 relative z-10">Monthly Usage</p>
            <div className="flex flex-col relative z-10 h-full justify-between">
                <h3 className="text-3xl font-black text-white font-heading">{metrics.usagePercentage}%</h3>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-2">
                    <div className={`h-full ${metrics.usagePercentage >= 100 ? 'bg-error' : metrics.usagePercentage >= 80 ? 'bg-amber-500' : 'bg-secondary'}`} style={{ width: `${metrics.usagePercentage}%` }}></div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-surface-container p-6 rounded-3xl border border-outline-variant">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Activity Over Time</h3>
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={charts.timelineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
                          <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" stroke="#A0AEC0" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#030816', border: '1px solid #1E293B', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Line yAxisId="left" type="monotone" dataKey="messages" name="Messages" stroke="#0356ff" strokeWidth={3} dot={{ r: 4, fill: '#0356ff' }} activeDot={{ r: 6 }} />
                          <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Source Chart */}
          <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant flex flex-col">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Traffic Sources</h3>
              <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={charts.sourceData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                          >
                              {charts.sourceData.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#030816', border: '1px solid #1E293B', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', textTransform: 'capitalize' }}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                  {charts.sourceData.map((entry: any, index: number) => (
                      <div key={entry.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="text-on-surface-variant capitalize">{entry.name}</span>
                          </div>
                          <span className="font-bold text-white">{entry.value}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-surface-container rounded-3xl border border-outline-variant overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Agent Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50">
                  <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Agent Name</th>
                  <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Status</th>
                  <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Messages</th>
                  <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Conversations</th>
                  <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Leads</th>
                  <th className="p-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent: any) => (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors border-b border-outline-variant/50 last:border-0">
                    <td className="p-4">
                      <div className="font-bold text-white">{agent.name}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">{agent.id.substring(0, 8)}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        agent.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-surface-container-highest text-on-surface-variant border-outline-variant'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="p-4 text-white font-mono">{agent.messagesUsed.toLocaleString()}</td>
                    <td className="p-4 text-white font-mono">{agent.conversations.toLocaleString()}</td>
                    <td className="p-4 text-white font-mono">{agent.leads.toLocaleString()}</td>
                    <td className="p-4 text-white font-mono">
                        <span className={agent.conversionRate > 0 ? "text-emerald-400" : "text-on-surface-variant"}>
                            {agent.conversionRate.toFixed(1)}%
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
