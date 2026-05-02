"use client";

import { useBusiness } from "@/context/BusinessContext";
import { useAuth } from "@/context/AuthContext";
import { billingService } from "@/services";
import { getPlanConfig } from "@/config/plans";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const { business, loading: bizLoading } = useBusiness();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (bizLoading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-48 bg-surface-container rounded-3xl"></div>
      <div className="h-64 bg-surface-container rounded-3xl"></div>
    </div>;
  }

  if (!business) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-2xl mx-auto">
        <h3 className="text-2xl font-heading font-black text-white mb-4">No Business Profile Found</h3>
        <p className="text-on-surface-variant mb-8 text-sm">Please complete your business onboarding to manage billing.</p>
        <button onClick={() => router.push("/onboarding/business")} className="btn-primary">Complete Onboarding</button>
      </div>
    );
  }

  const planConfig = getPlanConfig(business.plan);
  const messagesUsed = business.monthlyMessagesUsed || 0;
  const messageLimit = planConfig.monthlyMessageLimit;
  const usagePercent = Math.min(Math.round((messagesUsed / messageLimit) * 100), 100);

  const handlePortal = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const url = await billingService.createCustomerPortalSession(business.id, user.uid);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Failed to open billing portal. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    if (!user) return;
    setLoading(true);
    billingService.createCheckoutSession(planId, business.id, user.uid)
      .then(url => { window.location.href = url; })
      .catch(err => {
        console.error(err);
        alert("Failed to start checkout. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-5xl space-y-8">
      {/* Plan Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-panel rounded-3xl p-8 rim-light bg-gradient-to-br from-secondary-container/10 to-transparent relative overflow-hidden">
          {business.ownerOverride && (
            <div className="absolute top-0 right-0 bg-tertiary text-on-tertiary px-6 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest shadow-lg z-10">
              Owner Override Active
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Current Plan</p>
              <h3 className="text-4xl font-heading font-black text-white capitalize">{business.plan} Agent</h3>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  business.subscriptionStatus === 'active' || business.subscriptionStatus === 'trial' || business.subscriptionStatus === 'owner_override'
                  ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' 
                  : 'bg-error/10 border-error/20 text-error'
                }`}>
                  {business.subscriptionStatus.replace('_', ' ')}
                </span>
                {business.currentPeriodEnd && (
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Renews {new Date(business.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            {business.ownerOverride ? (
                <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] font-black text-tertiary uppercase tracking-widest bg-tertiary/10 px-4 py-2 rounded-xl border border-tertiary/20">
                        Managed by Fito Technology
                    </span>
                    <p className="text-[9px] text-on-surface-variant font-bold mt-2 max-w-[200px]">
                        Internal accounts are managed via the Platform Owner dashboard.
                    </p>
                </div>
            ) : business.stripeCustomerId ? (
              <button 
                onClick={handlePortal} 
                disabled={loading}
                className="btn-secondary whitespace-nowrap"
              >
                {loading ? "Loading..." : "Manage Billing"}
              </button>
            ) : (
                <div className="flex gap-2">
                    <button onClick={() => handleUpgrade('starter')} disabled={loading} className="btn-primary text-xs px-4 py-2">Get Started</button>
                    <button onClick={() => handleUpgrade('business')} disabled={loading} className="btn-secondary text-xs px-4 py-2 border-secondary/20">Upgrade</button>
                </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-on-surface font-bold">Monthly AI Usage</span>
                <span className="text-on-surface-variant font-mono font-bold">{messagesUsed.toLocaleString()} / {messageLimit.toLocaleString()} messages</span>
              </div>
              <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden rim-light">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    usagePercent >= 100 ? 'bg-error shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 
                    usagePercent >= 80 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                    'bg-secondary'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
              
              {usagePercent >= 100 && !business.ownerOverride && (
                  <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-error text-lg mt-0.5">error</span>
                      <div>
                          <p className="text-xs font-bold text-white">Usage Limit Reached</p>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed">Your agent is currently using its fallback response. Upgrade to restore AI functionality immediately.</p>
                      </div>
                  </div>
              )}

              {usagePercent >= 80 && usagePercent < 100 && !business.ownerOverride && (
                  <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">warning</span>
                      <div>
                          <p className="text-xs font-bold text-white">Approaching Limit</p>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed">You have used {usagePercent}% of your monthly messages. Consider upgrading to avoid service interruption.</p>
                      </div>
                  </div>
              )}
              <p className={`text-[10px] text-on-surface-variant mt-2 font-bold uppercase tracking-widest ${business.ownerOverride ? 'text-secondary' : ''}`}>
                {business.ownerOverride 
                    ? 'Owner Override Active — Manual resets apply.' 
                    : business.nextUsageResetAt 
                        ? `Usage resets on ${new Date(business.nextUsageResetAt).toLocaleDateString()}`
                        : 'Usage resets on the next billing cycle.'
                }
              </p>
            </div>
            
            <div className="flex gap-6 pt-2 border-t border-outline-variant/30">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Plan Capacity</span>
                    <span className="text-sm font-bold text-white">{planConfig.maxAgents} AI Agents</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Knowledge Base</span>
                    <span className="text-sm font-bold text-white">{planConfig.knowledgeItemsLimit} Items</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Documents</span>
                    <span className="text-sm font-bold text-white">{planConfig.documentUploadEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-8 rim-light flex flex-col justify-center items-center text-center bg-gradient-to-br from-tertiary/5 to-transparent border-tertiary/10">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Setup Fee Status</p>
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border-2 transform rotate-3 ${
              business.setupFeeStatus === 'paid' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-surface-variant/20 text-on-surface-variant border-outline-variant animate-pulse'
          }`}>
              <span className="material-symbols-outlined text-4xl">
                  {business.setupFeeStatus === 'paid' ? 'verified' : 'pending'}
              </span>
          </div>
          <h4 className="text-2xl font-heading font-black text-white uppercase tracking-tighter">
              {business.setupFeeStatus === 'paid' ? 'Paid' : 'Pending'}
          </h4>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-2 leading-relaxed">
              One-time activation fee for your digital workers.
          </p>
        </div>
      </div>

      {/* Pricing Teaser / Comparison if not on top plan */}
      {business.plan !== 'advanced' && !business.ownerOverride && (
        <div className="glass-panel rounded-3xl p-8 rim-light border-secondary/20 bg-secondary/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h4 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Ready for scale?</h4>
                    <p className="text-sm text-on-surface-variant">Upgrade to Business or Advanced to unlock document uploads and higher limits.</p>
                </div>
                <button 
                    onClick={() => handleUpgrade(business.plan === 'starter' ? 'business' : 'advanced')}
                    disabled={loading}
                    className="btn-primary"
                >
                    View Upgrade Options
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
