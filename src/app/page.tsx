import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      
      <main className="flex-grow pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-40">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full border border-outline-variant">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="text-[10px] font-heading font-semibold text-on-surface-variant uppercase tracking-wider">
                New: V2 Autonomous Agents
              </span>
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-on-surface leading-tight">
              Custom AI Agents for <span className="text-secondary">Modern Businesses</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
              Fito Agents helps businesses launch AI-powered digital workers that answer questions, capture leads, support customers, and automate daily tasks.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/register" className="btn-gradient">
                Get Your AI Agent
              </Link>
              <Link href="/pricing" className="btn-secondary px-8 py-4 text-lg rounded-xl">
                View Pricing
              </Link>
            </div>
          </div>

          <div className="relative mt-12 lg:mt-0">
            {/* Dashboard Mockup */}
            <div className="glass-panel rounded-2xl p-6 rim-light ambient-glow relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <div className="w-3 h-3 rounded-full bg-on-tertiary-fixed-variant"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                </div>
                <span className="text-[10px] font-heading font-semibold text-on-surface-variant uppercase tracking-widest">Live Activity</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                    <div>
                      <p className="text-on-surface font-medium text-sm">Website Agent</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Active on fitoagents.com</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary text-[10px] font-bold">ONLINE</span>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                    <div>
                      <p className="text-on-surface font-medium text-sm">Lead Captured</p>
                      <p className="text-[10px] text-on-surface-variant uppercase">james.w@enterprise.io</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-on-surface-variant">2m ago</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-secondary-fixed-variant" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                  <div>
                    <p className="text-on-surface font-medium text-sm">24/7 Support</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Resolved 142 tickets today</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Background Elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondary-container/20 rounded-full blur-[80px] -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-tertiary/10 rounded-full blur-[80px] -z-10"></div>
          </div>
        </section>

        {/* Agent Types Grid */}
        <section className="max-w-7xl mx-auto px-gutter mb-40">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-on-surface mb-4">Purpose-Built for Every Role</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">
              Our pre-configured agent blueprints allow you to go live in minutes, not months.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentTypes.map((agent) => (
              <div key={agent.name} className="glass-panel p-8 rounded-2xl rim-light group hover:bg-slate-900 transition-all cursor-pointer">
                <div className={`w-12 h-12 rounded-xl ${agent.bgColor} flex items-center justify-center mb-6 ${agent.iconColor} group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined">{agent.icon}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-on-surface mb-3">{agent.name}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{agent.description}</p>
                <Link href="/agent-types" className="text-secondary text-sm font-medium flex items-center gap-2">
                  Learn More <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-gutter mb-20">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 p-12 md:p-24 text-center border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary-container/20 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-on-surface mb-6">Ready to automate your growth?</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-10">
                Join 2,500+ businesses who are saving thousands of hours every month with Fito Agents.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register" className="bg-secondary-container text-on-secondary-container px-10 py-5 rounded-xl font-heading font-bold text-lg hover:brightness-110 active:scale-95 transition-all">
                  Get Your AI Agent Now
                </Link>
                <Link href="/contact" className="bg-white/5 backdrop-blur-sm border border-white/10 text-white px-10 py-5 rounded-xl font-heading font-bold text-lg hover:bg-white/10 active:scale-95 transition-all">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

const agentTypes = [
  {
    name: "Website Agent",
    icon: "language",
    bgColor: "bg-secondary-container",
    iconColor: "text-on-secondary-container",
    description: "Inbound assistant that navigates your site with users, answers product questions, and captures visitor info.",
  },
  {
    name: "Support Agent",
    icon: "support",
    bgColor: "bg-tertiary/20",
    iconColor: "text-tertiary",
    description: "Expert technical support that solves user problems by referencing your knowledge base and documentation.",
  },
  {
    name: "Sales Agent",
    icon: "point_of_sale",
    bgColor: "bg-on-secondary-fixed-variant/20",
    iconColor: "text-on-secondary-fixed-variant",
    description: "Proactive outbound and inbound sales assistant trained to qualify leads and push deals through the funnel.",
  },
  {
    name: "Booking Agent",
    icon: "calendar_today",
    bgColor: "bg-secondary/20",
    iconColor: "text-secondary",
    description: "Automated scheduling for meetings, demos, or appointments with full calendar synchronization.",
  },
  {
    name: "Document Agent",
    icon: "description",
    bgColor: "bg-on-tertiary-fixed-variant/20",
    iconColor: "text-on-tertiary-fixed-variant",
    description: "Upload PDFs or CSVs and let the agent synthesize information, extract data, or answer complex queries.",
  },
  {
    name: "App Agent",
    icon: "apps",
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
    description: "A headless agent that lives inside your own application, performing actions for users via your own API.",
  },
];
