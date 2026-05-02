"use client";

import { StatCard } from "@/components/ui/StatCard";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value="2,542" change="+124 this week" icon="group" trend="up" />
        <StatCard title="Active Agents" value="8,120" change="+420" icon="smart_toy" trend="up" />
        <StatCard title="MRR" value="$128,450" change="+8.2%" icon="payments" trend="up" />
        <StatCard title="API Usage" value="92%" change="High" icon="database" trend="none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health */}
        <div className="glass-panel rounded-2xl p-6 rim-light">
          <h3 className="font-heading text-lg font-bold text-on-surface mb-6">System Health</h3>
          <div className="space-y-4">
            <HealthItem name="AI Inference" status="Operational" latency="240ms" />
            <HealthItem name="Payments" status="Operational" latency="12ms" />
            <HealthItem name="Database" status="Operational" latency="45ms" />
            <HealthItem name="Storage" status="Operational" latency="110ms" />
          </div>
        </div>

        {/* Server Load */}
        <div className="glass-panel rounded-2xl p-6 rim-light">
          <h3 className="font-heading text-lg font-bold text-on-surface mb-6">Server Load</h3>
          <div className="space-y-6">
            <LoadItem region="US-East" value={42} color="bg-secondary" />
            <LoadItem region="EU-West" value={78} color="bg-error" />
            <LoadItem region="Asia-PAC" value={15} color="bg-tertiary" />
          </div>
        </div>

        {/* Events */}
        <div className="glass-panel rounded-2xl p-6 rim-light">
          <h3 className="font-heading text-lg font-bold text-on-surface mb-6">Platform Events</h3>
          <div className="space-y-4">
            {recentEvents.map((event, i) => (
              <div key={i} className="flex gap-4 p-3 hover:bg-surface-container-low rounded-xl transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-xs font-medium text-on-surface leading-tight">{event.text}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthItem({ name, status, latency }: { name: string, status: string, latency: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant">
      <div>
        <p className="text-xs font-bold text-on-surface">{name}</p>
        <p className="text-[10px] text-on-surface-variant uppercase">{latency}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-tertiary font-bold">{status}</p>
      </div>
    </div>
  );
}

function LoadItem({ region, value, color }: { region: string, value: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span>{region}</span>
                <span>{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
            </div>
        </div>
    );
}

const recentEvents = [
  { text: "New customer 'EcoFlow' joined Business", time: "2m ago" },
  { text: "Agent 'SupportBot' reached message limit", time: "15m ago" },
  { text: "System Update: V2 Model deployed", time: "1h ago" },
  { text: "Stripe: Renewal failed for 'Peterson'", time: "3h ago" },
];
