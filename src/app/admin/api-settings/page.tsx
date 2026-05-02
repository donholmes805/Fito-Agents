"use client";

import { useEffect, useState } from "react";

export default function AdminApiSettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/config-status")
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
        <div className="h-40 bg-surface-container rounded-3xl"></div>
        <div className="h-60 bg-surface-container rounded-3xl"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-black text-white font-heading uppercase tracking-tighter">System Settings</h1>
            <p className="text-on-surface-variant text-sm mt-1">Configure global AI models, safety guardrails, and API keys.</p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/10 px-4 py-2 rounded-xl border border-secondary/20">
            <span className={`w-2 h-2 rounded-full ${status?.openRouter?.isSet && status?.firebaseAdmin?.isSet ? 'bg-tertiary animate-pulse' : 'bg-error'}`}></span>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                {status?.openRouter?.isSet && status?.firebaseAdmin?.isSet ? 'System Healthy' : 'Action Required'}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            <div className="glass-panel rounded-3xl p-8 rim-light shadow-2xl space-y-8">
                <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                        <span className="material-symbols-outlined text-2xl">vpn_key</span>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">API Configuration</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Environment Variable Status</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant">
                        <div>
                            <p className="text-xs font-bold text-white">OpenRouter API</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">AI Intelligence Layer</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border ${
                            status?.openRouter?.isSet ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'bg-error/10 border-error/20 text-error'
                        }`}>
                            {status?.openRouter?.isSet ? 'Connected' : 'Missing'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant">
                        <div>
                            <p className="text-xs font-bold text-white">Firebase Admin SDK</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Server-side Data Access</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border ${
                            status?.firebaseAdmin?.isSet ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'bg-error/10 border-error/20 text-error'
                        }`}>
                            {status?.firebaseAdmin?.isSet ? 'Configured' : 'Missing'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant">
                        <div>
                            <p className="text-xs font-bold text-white">Stripe Payments</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Billing & Subscription</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border ${
                            status?.stripe?.isSet ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'bg-surface-variant/20 border-outline-variant text-on-surface-variant opacity-50'
                        }`}>
                            {status?.stripe?.isSet ? 'Active' : 'Disabled'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-outline-variant">
                        <div>
                            <p className="text-xs font-bold text-white">Resend Emails</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Lead & Usage Notifications</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter border ${
                                    status?.resend?.isSet ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'bg-error/10 border-error/20 text-error'
                                }`}>
                                    {status?.resend?.isSet ? 'Configured' : 'Missing'}
                                </span>
                                {status?.resend?.isSet && (
                                    <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tighter">
                                        Warnings Active
                                    </span>
                                )}
                            </div>
                            {status?.resend?.isSet && (
                                <span className="text-[8px] text-on-surface-variant/60 font-mono">{status.resend.fromEmail}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-secondary/5 p-6 rounded-2xl border border-secondary/20">
                    <p className="text-[11px] text-on-surface-variant leading-relaxed font-bold italic">
                        <span className="text-secondary">Note:</span> For production security, API keys must be updated via environment variables (Vercel, Railway, etc.) or Cloud Secrets.
                    </p>
                </div>
            </div>
        </div>

        <div className="space-y-8">
            <div className="glass-panel rounded-3xl p-8 rim-light shadow-2xl space-y-8">
                <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
                        <span className="material-symbols-outlined text-2xl">psychology</span>
                    </div>
                    <div>
                        <h3 className="font-heading text-xl font-bold text-white uppercase tracking-tighter">AI Intelligence</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Global Model Controls</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Default Production Model</label>
                        <select 
                            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-on-surface focus:border-secondary outline-none transition-all font-bold appearance-none"
                            value={status?.openRouter?.model}
                            disabled
                        >
                            <option>{status?.openRouter?.model}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Global System Safety Prompt</label>
                        <textarea 
                            className="w-full bg-surface-container border border-outline-variant rounded-2xl px-5 py-4 text-on-surface h-32 text-xs leading-relaxed font-bold focus:border-secondary outline-none transition-all resize-none"
                            defaultValue="You are a helpful, harmless, and honest assistant. Do not provide financial, legal, or medical advice. Always act on behalf of the business owner."
                            disabled
                        />
                    </div>
                </div>

                <div className="p-4 bg-tertiary/10 rounded-2xl border border-tertiary/20 flex items-start gap-4">
                    <span className="material-symbols-outlined text-tertiary">shield_with_heart</span>
                    <p className="text-[10px] font-bold text-white leading-relaxed uppercase tracking-widest">
                        Safety guardrails are applied globally to all agent interactions before business-specific contexts.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
