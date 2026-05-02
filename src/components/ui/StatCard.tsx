interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  trend: "up" | "down" | "none";
  limit?: string;
}

export function StatCard({ title, value, change, icon, trend, limit }: StatCardProps) {
  return (
    <div className="glass-panel p-5 rounded-2xl rim-light flex flex-col justify-between hover:border-outline transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
        </div>
        {trend !== "none" && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
            trend === "up" ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error"
          }`}>
            {trend === "up" ? "▲" : "▼"} {change}
          </span>
        )}
        {trend === "none" && change !== "0" && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-tighter">
                {change}
            </span>
        )}
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-on-surface font-heading">{value}</span>
          {limit && <span className="text-xs text-on-surface-variant">{limit}</span>}
        </div>
      </div>
    </div>
  );
}
