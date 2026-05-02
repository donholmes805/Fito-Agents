"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { agentService, businessService } from "@/services";
import { Agent, Business } from "@/types";

export default function EmbedSharePage() {
  const { businessId } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bizData, agentsData] = await Promise.all([
        businessService.getBusinessById(businessId!),
        agentService.getAgentsByBusinessId(businessId!)
      ]);
      setBusiness(bizData);
      setAgents(agentsData);
      if (agentsData.length > 0) {
        setSelectedAgent(agentsData[0]);
      }
    } catch (err) {
      console.error("Failed to load embed data:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="max-w-4xl space-y-8">
        <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-[2.5rem] p-16 text-center space-y-8">
            <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mx-auto ring-8 ring-secondary/5">
                <span className="material-symbols-outlined text-5xl text-secondary">code</span>
            </div>
            <div className="space-y-4">
                <h2 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">Ready to Deploy?</h2>
                <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
                    You haven't created any agents yet. Build your first AI assistant to get your unique embed code and hosted page.
                </p>
            </div>
            <Link href="/dashboard/agent-builder" className="btn-primary px-10 py-5 rounded-2xl mx-auto flex items-center justify-center gap-3 w-fit">
                Go to Agent Builder <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
        </div>
      </div>
    );
  }

  const [origin, setOrigin] = useState("https://fitoagents.com");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const agentId = selectedAgent?.id || "your-agent-id";
  const businessSlug = business?.slug || "business-slug";
  const embedCode = `<script src="${origin}/embed.js" data-agent-id="${agentId}"></script>`;
  const advancedEmbedCode = `<script 
  src="${origin}/embed.js" 
  data-agent-id="${agentId}" 
  data-position="bottom-right" 
  data-theme="dark">
</script>`;
  const hostedLink = `${origin}/a/${businessSlug}`;

  return (
    <div className="max-w-5xl space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">Embed & Share</h1>
            <p className="text-on-surface-variant text-sm mt-1">Get your AI agent live on your website and across the web.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-surface-container border border-outline-variant p-2 rounded-2xl">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-3">Active Agent</label>
              <select 
                className="bg-surface-container-high border border-outline-variant rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none"
                value={selectedAgent?.id}
                onChange={(e) => setSelectedAgent(agents.find(a => a.id === e.target.value) || null)}
              >
                  {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
              </select>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
            {/* Universal Embed Code */}
            <div className="glass-panel rounded-[2rem] p-8 rim-light space-y-6 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                        <span className="material-symbols-outlined text-2xl">code</span>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">Universal Embed Code</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Works on any website (HTML, React, etc.)</p>
                    </div>
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                    Paste this code before the closing <code className="bg-surface-container px-1.5 py-0.5 rounded text-white font-mono">&lt;/body&gt;</code> tag of your website.
                </p>

                <div className="relative group">
                    <pre className="bg-black/60 border border-outline-variant rounded-2xl p-6 overflow-x-auto text-xs text-secondary font-mono leading-relaxed ring-1 ring-white/5">
                        {embedCode}
                    </pre>
                    <button
                        onClick={() => copyToClipboard(embedCode, 'embed')}
                        className="absolute right-3 top-3 bg-surface-container border border-outline-variant px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white hover:bg-secondary hover:text-white transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">{copied['embed'] ? 'check' : 'content_copy'}</span>
                        {copied['embed'] ? 'Copied' : 'Copy'}
                    </button>
                </div>

                <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Installation Steps</h4>
                    <ul className="space-y-3">
                        <li className="flex gap-3 text-xs text-on-surface-variant">
                            <span className="w-5 h-5 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-[10px] text-white flex-shrink-0">1</span>
                            <span>Copy the code snippet above.</span>
                        </li>
                        <li className="flex gap-3 text-xs text-on-surface-variant">
                            <span className="w-5 h-5 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-[10px] text-white flex-shrink-0">2</span>
                            <span>Paste it into your website's HTML, ideally right before the <code className="text-secondary font-mono">&lt;/body&gt;</code> tag.</span>
                        </li>
                        <li className="flex gap-3 text-xs text-on-surface-variant">
                            <span className="w-5 h-5 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-[10px] text-white flex-shrink-0">3</span>
                            <span>Save and publish your website. The chat widget will appear automatically!</span>
                        </li>
                    </ul>
                </div>

                <div className="pt-6 border-t border-outline-variant">
                    <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Advanced Customization</h4>
                    <div className="relative group">
                        <pre className="bg-black/40 border border-outline-variant rounded-xl p-4 overflow-x-auto text-[10px] text-on-surface-variant font-mono leading-relaxed">
                            {advancedEmbedCode}
                        </pre>
                        <button
                            onClick={() => copyToClipboard(advancedEmbedCode, 'advanced')}
                            className="absolute right-3 top-3 text-on-surface-variant hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">{copied['advanced'] ? 'check' : 'content_copy'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Hosted Page */}
            <div className="glass-panel rounded-[2rem] p-8 rim-light space-y-6 shadow-2xl">
                <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
                        <span className="material-symbols-outlined text-2xl">link</span>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">Hosted Agent Page</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">No website needed</p>
                    </div>
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                    A dedicated landing page for your agent. Share it on social media or email signatures.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        readOnly
                        value={hostedLink}
                        className="flex-1 bg-surface-container border border-outline-variant rounded-xl px-5 py-4 text-xs text-on-surface-variant font-bold"
                    />
                    <div className="flex gap-3">
                        <button onClick={() => copyToClipboard(hostedLink, 'link')} className="flex-1 sm:flex-none p-4 border border-outline-variant rounded-xl text-on-surface-variant hover:text-white hover:bg-surface-container transition-all">
                            <span className="material-symbols-outlined text-sm">{copied['link'] ? 'check' : 'content_copy'}</span>
                        </button>
                        <Link href={hostedLink} target="_blank" className="flex-1 sm:flex-none p-4 border border-outline-variant rounded-xl text-on-surface-variant hover:text-white hover:bg-surface-container transition-all">
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-10">
             {/* QR Code Placeholder */}
             <div className="glass-panel rounded-[2rem] p-8 rim-light space-y-6 shadow-2xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-on-secondary-fixed-variant/10 flex items-center justify-center text-on-secondary-fixed-variant border border-on-secondary-fixed-variant/20 mb-2">
                    <span className="material-symbols-outlined text-2xl">qr_code_2</span>
                </div>
                <h4 className="font-heading font-bold text-white uppercase tracking-tighter text-xl">QR Code Generator</h4>
                <div className="w-48 h-48 bg-white p-4 rounded-3xl opacity-20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-black text-6xl">lock</span>
                    </div>
                </div>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Coming Soon</p>
            </div>

            {/* WordPress Plugin */}
            <div className="bg-gradient-to-br from-blue-900/20 to-transparent border border-blue-500/20 rounded-[2rem] p-8 rim-light space-y-6 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border-4 border-blue-500 shadow-xl shadow-blue-500/20">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/WordPress_blue_logo.svg" className="w-7 h-7" alt="WordPress" />
                    </div>
                    <div>
                        <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">WordPress Plugin</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">No-Code Integration</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant flex flex-col items-center text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Your Agent ID</p>
                        <p className="text-2xl font-mono font-bold text-secondary mb-4 tracking-tighter">{agentId}</p>
                        <button 
                            onClick={() => copyToClipboard(agentId, 'id')} 
                            className="btn-primary w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                        >
                            {copied['id'] ? 'Copied ID' : 'Copy Agent ID'}
                        </button>
                    </div>

                    <div className="pt-2 space-y-4">
                        <a 
                            href="/downloads/fito-agents-ai-chat.zip" 
                            download 
                            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            Download WordPress Plugin
                        </a>
                        <div className="flex flex-col gap-2 p-4 bg-black/20 rounded-xl border border-white/5">
                            <p className="text-[10px] text-on-surface-variant font-medium">
                                <strong className="text-secondary">Version 1.0.0</strong> — Official Fito Agents AI Chat connector.
                            </p>
                            <p className="text-[10px] text-on-surface-variant/60 leading-tight">
                                Upload this ZIP in WordPress under <code className="text-white">Plugins &gt; Add New &gt; Upload Plugin</code>. After activation, go to the <strong className="text-white">Fito Agents</strong> menu and paste your Agent ID.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
